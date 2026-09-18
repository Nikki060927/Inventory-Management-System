@echo off
TITLE Smart Stationery Inventory Management System - Academic Launcher
COLOR 0B
CLS

echo ======================================================================
echo          SMART STATIONERY INVENTORY MANAGEMENT SYSTEM
echo     Full-Stack Academic Project Runner (SOP-COLLEGE-FSD-2026)
echo     Team: Nikhila V (44731059) & Zaid Basha (44731049)
echo ======================================================================
echo.

:: 1. Verify JDK 17+ is installed
echo [1/3] Verifying Java Development Kit (JDK 17+)...
javac -version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    COLOR 0C
    echo [ERROR] JDK compiler 'javac' is not found or not in PATH!
    echo Please install JDK 17 or higher and configure your PATH environment variable.
    pause
    exit /b 1
)
echo [OK] JDK compiler verified.
echo.

:: 2. Compile all Java backend classes into backend/bin/
echo [2/3] Compiling Java backend classes into backend/bin/ ...
cd backend
IF NOT EXIST "bin" mkdir bin
javac -cp "lib/mysql-connector-j.jar;src" -d "bin" src/model/*.java src/util/*.java src/dao/*.java src/service/*.java src/server/*.java src/Main.java
IF %ERRORLEVEL% NEQ 0 (
    COLOR 0C
    echo [ERROR] Compilation failed! Check error logs above.
    pause
    exit /b 1
)
echo [OK] Compilation successful. All classes generated in backend/bin/.
cd ..
echo.

:: 3. Launch Java HttpServer on port 8080
echo [3/3] Starting Java HttpServer & REST API on Port 8080...
start "Smart Stationery - Server & Application (:8080)" cmd /k "cd backend && java -cp bin;lib/mysql-connector-j.jar Main"

:: Brief wait for server socket binding
timeout /t 3 >nul

:: 4. Open Web Application and 20-Slide Presentation
echo [OK] Launching Application and 20-Slide Presentation...
start http://localhost:8080/index.html
start "" "%~dp0presentation\presentation.html"

echo.
echo ======================================================================
echo  SYSTEM IS LIVE AND RUNNING!
echo  ------------------------------------------------------------------
echo  * Web Application:     http://localhost:8080/index.html
echo  * REST API Base URL:   http://localhost:8080/api
echo  * 20-Slide Web Deck:   presentation/presentation.html
echo  * Academic Runbook:    docs/Student_FullStack_Project_Runbook.xlsx
echo ======================================================================
echo.
pause
