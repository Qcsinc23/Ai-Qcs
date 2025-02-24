from typing import Optional
from fastapi import HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
import requests
from functools import lru_cache
import os
from dotenv import load_dotenv

load_dotenv()

CLERK_JWKS_URL = os.getenv("CLERK_JWKS_URL")
if not CLERK_JWKS_URL:
    raise ValueError("CLERK_JWKS_URL environment variable is not set")

class JWTBearer(HTTPBearer):
    def __init__(self, auto_error: bool = True):
        super(JWTBearer, self).__init__(auto_error=auto_error)

    @lru_cache(maxsize=1)
    def get_jwks(self):
        response = requests.get(CLERK_JWKS_URL)
        response.raise_for_status()
        return response.json()

    async def __call__(self, request: Request) -> Optional[dict]:
        credentials: HTTPAuthorizationCredentials = await super().__call__(request)
        
        if not credentials:
            raise HTTPException(status_code=403, detail="Invalid authorization code.")

        token = credentials.credentials
        try:
            jwks = self.get_jwks()
            header = jwt.get_unverified_header(token)
            key = None

            # Find the key that matches the key ID in the token header
            for jwk in jwks["keys"]:
                if jwk["kid"] == header["kid"]:
                    key = jwt.algorithms.RSAAlgorithm.from_jwk(jwk)
                    break

            if not key:
                raise HTTPException(status_code=403, detail="Invalid token signature.")

            # Verify and decode the token
            payload = jwt.decode(
                token,
                key=key,
                algorithms=["RS256"],
                audience=os.getenv("CLERK_FRONTEND_API"),
                options={"verify_exp": True}
            )

            return payload
        except jwt.ExpiredSignatureError:
            error_message = "Token has expired."
            print(f"JWT ExpiredSignatureError: {error_message}")
            raise HTTPException(status_code=403, detail=error_message)
        except jwt.JWTClaimsError as e:
            error_message = f"Invalid token claims: {e}"
            print(f"JWT JWTClaimsError: {error_message}")
            raise HTTPException(status_code=403, detail=error_message)
        except jwt.JWTError as e:
            error_message = f"Invalid token: {e}"
            print(f"JWT JWTError: {error_message}")
            raise HTTPException(status_code=403, detail=error_message)
        except requests.exceptions.RequestException as e:
            error_message = f"JWKS request error: {e}"
            print(f"JWKS RequestException: {error_message}")
            raise HTTPException(status_code=500, detail="Failed to fetch JWKS.")
        except Exception as e:
            error_message = f"An unexpected error occurred: {e}"
            print(f"JWT Exception: {error_message}")
            raise HTTPException(status_code=403, detail="An unexpected authentication error occurred.")

jwt_bearer = JWTBearer()
