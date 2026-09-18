@echo off
TITLE Smart Stationery Inventory Management System Launcher
COLOR 0B
CLS

echo ======================================================================
echo          SMART STATIONERY INVENTORY MANAGEMENT SYSTEM
echo       Academic Project Launcher (Java 21 + JDBC + React)
echo ======================================================================
echo.

:: 1. Verify Java 21+ is available
echo [1/4] Checking Java environment...
java -version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    COLOR 0C
    echo [ERROR] Java is not installed or not added to PATH!
    echo Please install JDK 21+ and add it to your System PATH.
    pause
    exit /b 1
)
echo [OK] Java runtime found.
echo.

:: 2. Verify Node.js is available
echo [2/4] Checking Node.js environment (for React build/dev server)...
node -v >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    COLOR 0C
    echo [ERROR] Node.js is not installed or not added to PATH!
    echo Node.js is required as the development build tool for the React UI.
    pause
    exit /b 1
)
echo [OK] Node.js and npm found.
echo.

:: 3. Compile and Start Backend
echo [3/4] Compiling Java 21 Backend...
cd backend
IF NOT EXIST "out" mkdir out
javac -cp "lib/mysql-connector-j.jar;src" -d "out" src/model/*.java src/util/*.java src/dao/*.java src/service/*.java src/server/*.java src/Main.java
IF %ERRORLEVEL% NEQ 0 (
    COLOR 0C
    echo [ERROR] Java compilation failed! Check error messages above.
    pause
    exit /b 1
)
echo [OK] Backend compiled successfully.
echo Starting Java REST Server on http://localhost:8080/api ...
start "Smart Stationery - Java Backend (Port 8080)" cmd /k "java -cp out;lib/mysql-connector-j.jar Main"
cd ..
echo.

:: 4. Start React Frontend
echo [4/4] Starting React Frontend Dev Server on http://127.0.0.1:5173/ ...
start "Smart Stationery - React UI (Port 5173)" cmd /k "cd frontend && npm run dev -- --host 127.0.0.1 --port 5173"

:: Wait a brief moment for dev servers to initialize, then launch default browser
timeout /t 3 >nul
start http://127.0.0.1:5173/

echo ======================================================================
echo  PROJECT IS NOW RUNNING!
echo  ------------------------------------------------------------------
echo  * React Frontend UI:  http://127.0.0.1:5173/
echo  * Java REST Backend:  http://localhost:8080/api
echo.
echo  Keep the two opened command prompt windows running while using the app.
echo ======================================================================
echo.
pause
