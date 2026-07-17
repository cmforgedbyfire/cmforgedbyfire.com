@echo off
echo Starting Forged By Fire website for Fire Line...
echo.
echo Open from VPN devices:
echo   http://10.77.77.1:7795/ai.html
echo.
echo This private viewer lets OTTO chat call http://10.77.77.1:7791.
echo Run F:\company\projects\otto\otto_fire_line_api.bat in another window first.
echo.
cd /d "%~dp0"
python -m http.server 7795 --bind 10.77.77.1
pause
