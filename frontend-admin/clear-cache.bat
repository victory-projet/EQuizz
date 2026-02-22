@echo off
echo Nettoyage du cache Angular...
if exist .angular\cache rmdir /s /q .angular\cache
if exist node_modules\.cache rmdir /s /q node_modules\.cache
echo Cache nettoyé!
echo.
echo Redémarrez maintenant le serveur avec: npm start
pause
