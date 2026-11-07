@echo off
setlocal
cd /d "%~dp0"
echo INTRADAY 100 - local research server
echo.
echo Open: http://127.0.0.1:8900/
echo Press Ctrl+C to stop.
echo.
where py >nul 2>nul
if %errorlevel%==0 (
  start "" http://127.0.0.1:8900/
  py -3 -m http.server 8900 --bind 127.0.0.1
  goto :eof
)
where python >nul 2>nul
if %errorlevel%==0 (
  start "" http://127.0.0.1:8900/
  python -m http.server 8900 --bind 127.0.0.1
  goto :eof
)
echo Python not found. Install Python 3, or run any static file server in this folder.
pause
