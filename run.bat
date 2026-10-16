@echo off
title MUSHFIQUR DATASET FORGE // SWISS MINIMAL
color 0B
echo ===========================================================================
echo   MUSHFIQUR DATASET FORGE // DISTRIBUTED SCIENTIFIC COLLECTIVE
echo ===========================================================================
echo [*] Checking Python installation...

python --version >nul 2>&1
if %errorlevel% neq 0 (
    py --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo [!] Python is not detected on your system.
        echo [*] Please install Python 3.10+ from https://www.python.org/
        echo.
        pause
        exit /b 1
    ) else (
        set PY_CMD=py
    )
) else (
    set PY_CMD=python
)

echo [OK] Python detected.
echo [*] Launching Swiss Minimalist Studio on http://localhost:7860/ ...

start "" "http://localhost:7860/"
%PY_CMD% server.py

if %errorlevel% neq 0 (
    echo.
    echo [!] Server exited with an error.
    pause
)
