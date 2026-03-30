@echo off
cd /d "%~dp0"
echo.
echo ============================================
echo  [dev] Starting development server
echo  URL: http://localhost:3000
echo  Stop: Ctrl+C
echo ============================================
echo.
npm run dev
echo.
pause
