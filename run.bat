@echo off
setlocal
cd /d "%~dp0"

python main.py
if errorlevel 9009 (
  py main.py
)
