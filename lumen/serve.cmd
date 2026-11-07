@echo off
setlocal
cd /d "%~dp0"
echo Starting LUMEN at http://localhost:8080 ...
start "LUMEN Server" /min python -m http.server 8080
timeout /t 1 /nobreak >nul
start "" "http://localhost:8080"
exit /b
