@echo off
echo ========================================
echo Demarrage de l'environnement de developpement
echo ========================================
echo.

echo Verification des dependances...

REM Verifier si Node.js est installe
node --version >nul 2>&1
if errorlevel 1 (
    echo ERREUR: Node.js n'est pas installe
    echo Veuillez installer Node.js depuis https://nodejs.org/
    pause
    exit /b 1
)

REM Verifier si Angular CLI est installe
ng version >nul 2>&1
if errorlevel 1 (
    echo Installation d'Angular CLI...
    npm install -g @angular/cli
)

echo.
echo Demarrage du backend...
echo.

REM Demarrer le backend en arriere-plan
start "Backend Server" cmd /k "cd backend && npm start"

echo Attente de 5 secondes pour le demarrage du backend...
timeout /t 5 /nobreak >nul

echo.
echo Demarrage du frontend...
echo.

REM Demarrer le frontend
start "Frontend Admin" cmd /k "cd frontend-admin && ng serve"

echo.
echo ========================================
echo Environnement de developpement demarre
echo ========================================
echo.
echo Backend: http://localhost:3000
echo Frontend: http://localhost:4200
echo.
echo Appuyez sur une touche pour tester la connectivite...
pause

REM Executer le test de connectivite
node test-frontend-backend-connectivity.js

pause