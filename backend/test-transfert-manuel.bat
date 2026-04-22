@echo off
REM Script de test manuel pour l'endpoint de transfert d'étudiant (Windows)
REM Usage: test-transfert-manuel.bat

setlocal enabledelayedexpansion

set BASE_URL=http://localhost:3000
set ADMIN_TOKEN=votre-token-admin-ici

echo ========================================
echo Test Manuel - Endpoint de Transfert
echo ========================================
echo.

REM Test 1: Créer un étudiant
echo Test 1: Créer un étudiant
echo POST %BASE_URL%/api/academic/etudiants
curl -X POST "%BASE_URL%/api/academic/etudiants" ^
  -H "Authorization: Bearer %ADMIN_TOKEN%" ^
  -H "Content-Type: application/json" ^
  -d "{\"nom\":\"Test\",\"prenom\":\"Transfert\",\"email\":\"test.transfert@example.com\",\"classe_id\":\"CLASSE_ID_1\"}" ^
  -o response1.json

echo.
echo Reponse sauvegardee dans response1.json
echo.

REM Test 2: Transférer dans la même école
echo Test 2: Transferer dans la meme ecole
echo POST %BASE_URL%/api/academic/etudiants/ETUDIANT_ID/transfert
curl -X POST "%BASE_URL%/api/academic/etudiants/ETUDIANT_ID/transfert" ^
  -H "Authorization: Bearer %ADMIN_TOKEN%" ^
  -H "Content-Type: application/json" ^
  -d "{\"nouvelleClasseId\":\"CLASSE_ID_2_MEME_ECOLE\"}" ^
  -o response2.json

echo.
echo Reponse sauvegardee dans response2.json
echo.

REM Test 3: Transférer vers une autre école
echo Test 3: Transferer vers une autre ecole
echo POST %BASE_URL%/api/academic/etudiants/ETUDIANT_ID/transfert
curl -X POST "%BASE_URL%/api/academic/etudiants/ETUDIANT_ID/transfert" ^
  -H "Authorization: Bearer %ADMIN_TOKEN%" ^
  -H "Content-Type: application/json" ^
  -d "{\"nouvelleClasseId\":\"CLASSE_ID_3_AUTRE_ECOLE\",\"dateTransfert\":\"2024-09-01T00:00:00.000Z\"}" ^
  -o response3.json

echo.
echo Reponse sauvegardee dans response3.json
echo.

REM Test 4: Consulter l'historique
echo Test 4: Consulter l'historique
echo GET %BASE_URL%/api/academic/etudiants/ETUDIANT_ID/historique
curl -X GET "%BASE_URL%/api/academic/etudiants/ETUDIANT_ID/historique" ^
  -H "Authorization: Bearer %ADMIN_TOKEN%" ^
  -o response4.json

echo.
echo Reponse sauvegardee dans response4.json
echo.

REM Test 5: Erreur - Même classe
echo Test 5: Erreur - Transferer vers la meme classe
curl -X POST "%BASE_URL%/api/academic/etudiants/ETUDIANT_ID/transfert" ^
  -H "Authorization: Bearer %ADMIN_TOKEN%" ^
  -H "Content-Type: application/json" ^
  -d "{\"nouvelleClasseId\":\"CLASSE_ID_3_AUTRE_ECOLE\"}" ^
  -o response5.json

echo.
echo Reponse sauvegardee dans response5.json
echo.

REM Test 6: Erreur - Sans authentification
echo Test 6: Erreur - Sans authentification
curl -X POST "%BASE_URL%/api/academic/etudiants/ETUDIANT_ID/transfert" ^
  -H "Content-Type: application/json" ^
  -d "{\"nouvelleClasseId\":\"CLASSE_ID_2_MEME_ECOLE\"}" ^
  -o response6.json

echo.
echo Reponse sauvegardee dans response6.json
echo.

echo ========================================
echo Tests termines
echo Consultez les fichiers response*.json pour les resultats
echo ========================================

endlocal
