@echo off
echo ========================================
echo   EQuizz - Demarrage Environnement Dev
echo ========================================
echo.

echo [1/3] Demarrage du Backend...
cd backend
start "EQuizz Backend" cmd /k "npm start"
timeout /t 3 /nobreak >nul

echo [2/3] Demarrage du Frontend...
cd ..\frontend-admin
start "EQuizz Frontend" cmd /k "npm start"

echo.
echo ========================================
echo   Serveurs demarres !
echo ========================================
echo   Backend:  http://localhost:8080
echo   Frontend: http://localhost:4200
echo ========================================
echo.
echo Appuyez sur une touche pour fermer cette fenetre...
pause >nul
