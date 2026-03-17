#!/bin/bash

# Script de test manuel pour l'endpoint de transfert d'étudiant
# Usage: ./test-transfert-manuel.sh

BASE_URL="http://localhost:3000"
ADMIN_TOKEN="votre-token-admin-ici"

echo "🧪 Test Manuel - Endpoint de Transfert d'Étudiant"
echo "=================================================="
echo ""

# Couleurs pour l'affichage
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Créer un étudiant
echo -e "${YELLOW}Test 1: Créer un étudiant${NC}"
echo "POST $BASE_URL/api/academic/etudiants"
ETUDIANT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/academic/etudiants" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Test",
    "prenom": "Transfert",
    "email": "test.transfert@example.com",
    "classe_id": "CLASSE_ID_1"
  }')

ETUDIANT_ID=$(echo $ETUDIANT_RESPONSE | jq -r '.id')
MATRICULE_INITIAL=$(echo $ETUDIANT_RESPONSE | jq -r '.matricule')

if [ "$ETUDIANT_ID" != "null" ]; then
  echo -e "${GREEN}✓ Étudiant créé avec succès${NC}"
  echo "  ID: $ETUDIANT_ID"
  echo "  Matricule: $MATRICULE_INITIAL"
else
  echo -e "${RED}✗ Échec de la création${NC}"
  echo $ETUDIANT_RESPONSE | jq '.'
  exit 1
fi
echo ""

# Test 2: Transférer dans la même école
echo -e "${YELLOW}Test 2: Transférer dans la même école${NC}"
echo "POST $BASE_URL/api/academic/etudiants/$ETUDIANT_ID/transfert"
TRANSFERT1_RESPONSE=$(curl -s -X POST "$BASE_URL/api/academic/etudiants/$ETUDIANT_ID/transfert" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nouvelleClasseId": "CLASSE_ID_2_MEME_ECOLE"
  }')

MATRICULE_APRES=$(echo $TRANSFERT1_RESPONSE | jq -r '.etudiant.matricule')
EST_CHANGEMENT_ECOLE=$(echo $TRANSFERT1_RESPONSE | jq -r '.transfert.estChangementEcole')

if [ "$MATRICULE_APRES" == "$MATRICULE_INITIAL" ] && [ "$EST_CHANGEMENT_ECOLE" == "false" ]; then
  echo -e "${GREEN}✓ Transfert réussi (même école)${NC}"
  echo "  Matricule conservé: $MATRICULE_APRES"
  echo "  Changement d'école: $EST_CHANGEMENT_ECOLE"
else
  echo -e "${RED}✗ Échec du transfert${NC}"
  echo $TRANSFERT1_RESPONSE | jq '.'
fi
echo ""

# Test 3: Transférer vers une autre école
echo -e "${YELLOW}Test 3: Transférer vers une autre école${NC}"
echo "POST $BASE_URL/api/academic/etudiants/$ETUDIANT_ID/transfert"
TRANSFERT2_RESPONSE=$(curl -s -X POST "$BASE_URL/api/academic/etudiants/$ETUDIANT_ID/transfert" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nouvelleClasseId": "CLASSE_ID_3_AUTRE_ECOLE",
    "dateTransfert": "2024-09-01T00:00:00.000Z"
  }')

NOUVEAU_MATRICULE=$(echo $TRANSFERT2_RESPONSE | jq -r '.etudiant.matricule')
ANCIEN_MATRICULE=$(echo $TRANSFERT2_RESPONSE | jq -r '.transfert.ancienMatricule')
EST_CHANGEMENT_ECOLE2=$(echo $TRANSFERT2_RESPONSE | jq -r '.transfert.estChangementEcole')

if [ "$NOUVEAU_MATRICULE" != "$ANCIEN_MATRICULE" ] && [ "$EST_CHANGEMENT_ECOLE2" == "true" ]; then
  echo -e "${GREEN}✓ Transfert réussi (autre école)${NC}"
  echo "  Ancien matricule: $ANCIEN_MATRICULE"
  echo "  Nouveau matricule: $NOUVEAU_MATRICULE"
  echo "  Changement d'école: $EST_CHANGEMENT_ECOLE2"
else
  echo -e "${RED}✗ Échec du transfert${NC}"
  echo $TRANSFERT2_RESPONSE | jq '.'
fi
echo ""

# Test 4: Consulter l'historique
echo -e "${YELLOW}Test 4: Consulter l'historique${NC}"
echo "GET $BASE_URL/api/academic/etudiants/$ETUDIANT_ID/historique"
HISTORIQUE_RESPONSE=$(curl -s -X GET "$BASE_URL/api/academic/etudiants/$ETUDIANT_ID/historique" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

NB_PERIODES=$(echo $HISTORIQUE_RESPONSE | jq '. | length')

if [ "$NB_PERIODES" -ge 3 ]; then
  echo -e "${GREEN}✓ Historique complet${NC}"
  echo "  Nombre de périodes: $NB_PERIODES"
  echo $HISTORIQUE_RESPONSE | jq '.[] | {matricule, ecole: .Ecole.nom, classe: .Classe.nom, estPeriodeActuelle}'
else
  echo -e "${RED}✗ Historique incomplet${NC}"
  echo $HISTORIQUE_RESPONSE | jq '.'
fi
echo ""

# Test 5: Erreur - Même classe
echo -e "${YELLOW}Test 5: Erreur - Transférer vers la même classe${NC}"
ERREUR_RESPONSE=$(curl -s -X POST "$BASE_URL/api/academic/etudiants/$ETUDIANT_ID/transfert" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nouvelleClasseId": "CLASSE_ID_3_AUTRE_ECOLE"
  }')

ERROR_CODE=$(echo $ERREUR_RESPONSE | jq -r '.code')

if [ "$ERROR_CODE" == "SAME_CLASS" ]; then
  echo -e "${GREEN}✓ Erreur correctement gérée${NC}"
  echo "  Code: $ERROR_CODE"
else
  echo -e "${RED}✗ Erreur non gérée correctement${NC}"
  echo $ERREUR_RESPONSE | jq '.'
fi
echo ""

# Test 6: Erreur - Sans authentification
echo -e "${YELLOW}Test 6: Erreur - Sans authentification${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/academic/etudiants/$ETUDIANT_ID/transfert" \
  -H "Content-Type: application/json" \
  -d '{
    "nouvelleClasseId": "CLASSE_ID_2_MEME_ECOLE"
  }')

if [ "$HTTP_CODE" == "401" ]; then
  echo -e "${GREEN}✓ Authentification requise${NC}"
  echo "  Code HTTP: $HTTP_CODE"
else
  echo -e "${RED}✗ Authentification non vérifiée${NC}"
  echo "  Code HTTP: $HTTP_CODE"
fi
echo ""

echo "=================================================="
echo -e "${GREEN}✓ Tests terminés${NC}"
