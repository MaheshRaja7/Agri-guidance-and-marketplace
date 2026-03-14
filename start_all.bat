@echo off
echo Starting Agriculture Web Project...
echo ===================================
echo.

echo Starting ML Server (Python Flask) on port 5000...
start "ML Server" cmd /c "python server.py || echo Failed to start ML Server. Ensure Python and requirements are installed. && pause"

echo Starting Next.js Web App...
start "Next.js App" cmd /c "npm run dev || echo Failed to start Next.js server. && pause"

echo.
echo Both servers have been launched in separate windows!
echo Make sure they stay open while you are using the app.
pause
