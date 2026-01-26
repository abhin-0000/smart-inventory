@echo off
echo ===================================================
echo   Starting Smart Inventory System
echo ===================================================
echo.
echo 1. Starting Backend Server...
start "Smart Inventory Backend" cmd /k "cd server && npm run dev"
echo.
echo 2. Starting Frontend Client...
start "Smart Inventory Frontend" cmd /k "cd client && npm run dev"
echo.
echo 3. Waiting for servers to initialize (5 seconds)...
timeout /t 5 >nul
echo.
echo 4. Opening Application in Browser...
start http://localhost:5173
echo.
echo ===================================================
echo   System is Running!
echo   Do not close the two new terminal windows.
echo ===================================================
pause
