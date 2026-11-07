@echo off
title PERP ATLAS preview
cd /d "%~dp0"
echo Serving PERP ATLAS at http://127.0.0.1:8000
echo Press Ctrl+C to stop.
python -m http.server 8000
