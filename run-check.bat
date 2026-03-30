@echo off
cd /d "%~dp0"
echo.
echo ============================================
echo  [check] lint + build + e2e
echo  Step 1/3: lint
echo ============================================
echo.
npm run lint
if %ERRORLEVEL% neq 0 (
  echo.
  echo [FAILED] lint failed. Fix errors before proceeding.
  pause
  exit /b 1
)

echo.
echo ============================================
echo  [check] Step 2/3: build
echo ============================================
echo.
npm run build
if %ERRORLEVEL% neq 0 (
  echo.
  echo [FAILED] build failed. Fix errors before proceeding.
  pause
  exit /b 1
)

echo.
echo ============================================
echo  [check] Step 3/3: e2e tests
echo ============================================
echo.
npm run test:e2e
if %ERRORLEVEL% neq 0 (
  echo.
  echo [FAILED] E2E tests failed.
  echo  -> Run /bug-loop in Claude Code to generate fix requests.
  pause
  exit /b 1
)

echo.
echo ============================================
echo  [check] ALL PASSED: lint + build + e2e OK
echo  Ready to ship.
echo ============================================
echo.
pause
