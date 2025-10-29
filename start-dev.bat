@echo off
echo ============================================
echo  Starting EduAdmin AI Platform
echo ============================================
echo.

echo [1/2] Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm start"
timeout /t 3 /nobreak > nul

echo [2/2] Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo ============================================
echo  Servers Starting...
echo ============================================
echo  Backend:  http://localhost:5000
echo  Frontend: http://localhost:5173
echo ============================================
echo.
echo Press any key to close this window...
pause > nul
