import os
import pathlib
from fastapi import FastAPI, APIRouter, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.auth.middleware import jwt_bearer

load_dotenv()

def create_app() -> FastAPI:
    """Create the FastAPI application."""
    app = FastAPI(title="QCS Command API")
    
    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173"],  # Frontend dev server
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Create API router
    api_router = APIRouter(prefix="/api")

    # Import API routes from app/apis directory
    apis_path = pathlib.Path(__file__).parent / "app" / "apis"
    if apis_path.exists():
        for route_file in apis_path.glob("**/*.py"):
            if route_file.name != "__init__.py":
                module_path = ".".join(
                    route_file.relative_to(pathlib.Path(__file__).parent)
                    .with_suffix("")
                    .parts
                )
                try:
                    module = __import__(module_path, fromlist=["router"])
                    if hasattr(module, "router"):
                        api_router.include_router(
                            module.router,
                            dependencies=[Depends(jwt_bearer)]
                        )
                except Exception as e:
                    print(f"Error loading route {module_path}: {e}")

    # Include the API router
    app.include_router(api_router)

    @app.get("/health")
    async def health_check():
        return {"status": "healthy"}

    @app.get("/auth-test")
    async def auth_test(user_data: dict = Depends(jwt_bearer)):
        return {
            "message": "You are authenticated!",
            "user_data": user_data
        }

    return app

app = create_app()
