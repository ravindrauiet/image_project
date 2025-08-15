@echo off
echo Starting GitHub Image Manager...
echo.

echo Installing backend dependencies...
npm install

echo.
echo Installing frontend dependencies...
cd client
npm install
cd ..

echo.
echo Starting backend server...
start "Backend Server" cmd /k "npm run dev"

echo.
echo Starting frontend server...
start "Frontend Server" cmd /k "npm run client"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit this window...
pause > nul

