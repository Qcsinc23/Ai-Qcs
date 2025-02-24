@echo off

REM Activate virtual environment
call .venv\Scripts\activate.bat
if errorlevel 1 goto activate_error

REM Run the FastAPI server
uvicorn main:app --reload
if errorlevel 1 goto uvicorn_error

echo Backend server started successfully!
goto end

:activate_error
echo Error activating virtual environment.
goto end

:uvicorn_error
echo Error starting uvicorn server.
goto end

:end
pause
exit /b 0
