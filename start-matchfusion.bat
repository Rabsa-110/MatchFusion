@echo off
title MatchFusion Launcher
color 0A

echo ======================================================
echo             Starting MatchFusion Platform
echo ======================================================
echo.

set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

echo [1/2] Launching Backend API Server (Port 5000)...
start "MatchFusion Backend (Port 5000)" cmd /k "cd /d "%ROOT_DIR%backend" && echo ===================================== && echo Starting Backend Server on port 5000... && echo ===================================== && npm run dev"

timeout /t 3 /nobreak >nul

echo [2/2] Launching Frontend Web Client (Port 5173)...
start "MatchFusion Frontend (Port 5173)" cmd /k "cd /d "%ROOT_DIR%frontend" && echo ====================================== && echo Starting Frontend Client on port 5173... && echo ====================================== && npm run dev"

echo.
echo ======================================================
echo MatchFusion is starting in separate windows!
echo.
echo  * Backend API:  http://localhost:5000
echo  * Frontend Web: http://localhost:5173
echo.
echo Once both windows show ready, open your browser:
echo       >>> http://localhost:5173 <<<
echo.
echo Keep the terminal windows open while using MatchFusion.
echo To stop the servers, close both command windows.
echo ======================================================
echo.
pause
