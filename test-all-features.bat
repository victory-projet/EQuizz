@echo off
echo ========================================
echo    TESTS DES FONCTIONNALITES EQUIZZ
echo ========================================
echo.

echo 🚀 Verification des prerequis...
echo.

REM Verifier si Node.js est installe
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js n'est pas installe ou pas dans le PATH
    echo    Installez Node.js depuis https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js detecte: 
node --version

REM Verifier si npm est disponible
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm n'est pas disponible
    pause
    exit /b 1
)

echo ✅ npm detecte:
npm --version
echo.

echo 📦 Installation des dependances de test...
cd backend
npm install axios colors >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️ Erreur lors de l'installation des dependances
    echo    Continuons quand meme...
)
echo.

echo 🧪 Demarrage des tests...
echo.
echo ⚠️ IMPORTANT: Assurez-vous que le serveur backend est demarre !
echo    (npm start dans le dossier backend)
echo.
pause

echo 🔄 Execution des tests...
node run-all-tests.js

echo.
echo 📊 Tests termines !
echo.
pause