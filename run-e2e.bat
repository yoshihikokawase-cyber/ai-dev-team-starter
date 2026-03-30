@echo off
cd /d "%~dp0"
echo.
echo ============================================
echo  [test] Running Playwright E2E tests
echo  (dev server starts automatically if needed)
echo ============================================
echo.
npm run test:e2e
echo.
echo ============================================
echo  Done. Check results above.
echo  HTML report: playwright-report/index.html
echo ============================================
echo.
pause
