#!/bin/bash
# backend/run-tests.sh
# Script pour lancer les tests avec différentes options

echo "🧪 EQuizz Backend - Suite de Tests"
echo "===================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher un menu
show_menu() {
    echo "Choisissez une option:"
    echo "1) Tous les tests"
    echo "2) Tests unitaires uniquement"
    echo "3) Tests d'intégration uniquement"
    echo "4) Tests E2E uniquement"
    echo "5) Tests avec couverture"
    echo "6) Mode watch (développement)"
    echo "7) Quitter"
    echo ""
}

# Fonction pour lancer les tests
run_tests() {
    case $1 in
        1)
            echo -e "${BLUE}📊 Lancement de tous les tests...${NC}"
            npm test
            ;;
        2)
            echo -e "${BLUE}🔬 Lancement des tests unitaires...${NC}"
            npm run test:unit
            ;;
        3)
            echo -e "${BLUE}🔗 Lancement des tests d'intégration...${NC}"
            npm run test:integration
            ;;
        4)
            echo -e "${BLUE}🎯 Lancement des tests E2E...${NC}"
            npm run test:e2e
            ;;
        5)
            echo -e "${BLUE}📈 Lancement des tests avec couverture...${NC}"
            npm run test:coverage
            echo ""
            echo -e "${GREEN}✅ Rapport de couverture généré dans coverage/lcov-report/index.html${NC}"
            ;;
        6)
            echo -e "${BLUE}👀 Mode watch activé...${NC}"
            npm run test:watch
            ;;
        7)
            echo -e "${YELLOW}👋 Au revoir!${NC}"
            exit 0
            ;;
        *)
            echo -e "${YELLOW}⚠️  Option invalide${NC}"
            ;;
    esac
}

# Boucle principale
while true; do
    show_menu
    read -p "Votre choix: " choice
    echo ""
    run_tests $choice
    echo ""
    echo "===================================="
    echo ""
done
