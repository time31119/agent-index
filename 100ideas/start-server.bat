@echo off
cd /d "%~dp0"
where python >nul 2>nul
if errorlevel 1 (
  echo Python not found. Install Python, or open index.html directly.
  pause
  exit /b 1
)
start "" http://127.0.0.1:8765
python -m http.server 8765
