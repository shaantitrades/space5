@echo off
cd /d "e:\space 5"
echo Checking TypeScript...
npx tsc --noEmit
if errorlevel 1 (
    echo.
    echo TypeScript compilation FAILED
    exit /b 1
) else (
    echo.
    echo TypeScript compilation SUCCESS
    exit /b 0
)
