@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo   短幕 SHORTFRAME
echo   本地预览： http://127.0.0.1:8000
echo   按 Ctrl+C 停止
echo.
start "" "http://127.0.0.1:8000"
python -m http.server 8000
