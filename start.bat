@echo off
chcp 65001 >nul
echo Starting Smart Learning Question Generator...
echo.
echo Please make sure you have Python or Node.js installed to run local server
echo.
echo Choose startup method:
echo 1. Start with Python (Recommended)
echo 2. Start with Node.js
echo 3. Open HTML file directly
echo.
set /p choice=Please enter your choice (1-3): 

if "%choice%"=="1" goto python
if "%choice%"=="2" goto nodejs  
if "%choice%"=="3" goto direct
goto end

:python
echo Starting Python local server...
python -m http.server 8080
if errorlevel 1 (
    echo Python failed, trying python3...
    python3 -m http.server 8080
)
goto end

:nodejs
echo Starting Node.js local server...
npx http-server -p 8080
goto end

:direct
echo Opening HTML file directly...
start index.html
goto end

:end
echo.
echo If server started successfully, visit: http://localhost:8080
echo Press any key to exit...
pause >nul