@echo off
REM backend/run-tests.bat
REM Script Windows pour lancer les tests

:menu
cls
echo ========================================
echo   EQuizz Backend - Suite de Tests
echo ========================================
echo.
echo Choisissez une option:
echo 1) Tous les tests
echo 2) Tests unitaires uniquement
echo 3) Tests d'integration uniquement
echo 4) Tests E2E uniquement
echo 5) Tests avec couverture
echo 6) Mode watch (developpement)
echo 7) Quitter
echo.

set /p choice="Votre choix: "

if "%choice%"=="1" goto all
if "%choice%"=="2" goto unit
if "%choice%"=="3" goto integration
if "%choice%"=="4" goto e2e
if "%choice%"=="5" goto coverage
if "%choice%"=="6" goto watch
if "%choice%"=="7" goto end

echo Option invalide
pause
goto menu

:all
echo.
echo Lancement de tous les tests...
call npm test
pause
goto menu

:unit
echo.
echo Lancement des tests unitaires...
call npm run test:unit
pause
goto menu

:integration
echo.
echo Lancement des tests d'integration...
call npm run test:integration
pause
goto menu

:e2e
echo.
echo Lancement des tests E2E...
call npm run test:e2e
pause
goto menu

:coverage
echo.
echo Lancement des tests avec couverture...
call npm run test:coverage
echo.
echo Rapport genere dans coverage/lcov-report/index.html
pause
goto menu

:watch
echo.
echo Mode watch active...
call npm run test:watch
pause
goto menu

:end
echo Au revoir!
exit
