#!/bin/bash

echo "========================================"
echo "   TESTS DES FONCTIONNALITES EQUIZZ"
echo "========================================"
echo

echo "🚀 Vérification des prérequis..."
echo

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé ou pas dans le PATH"
    echo "   Installez Node.js depuis https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js détecté: $(node --version)"

# Vérifier si npm est disponible
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas disponible"
    exit 1
fi

echo "✅ npm détecté: $(npm --version)"
echo

echo "📦 Installation des dépendances de test..."
cd backend
npm install axios colors &> /dev/null
if [ $? -ne 0 ]; then
    echo "⚠️ Erreur lors de l'installation des dépendances"
    echo "   Continuons quand même..."
fi
echo

echo "🧪 Démarrage des tests..."
echo
echo "⚠️ IMPORTANT: Assurez-vous que le serveur backend est démarré !"
echo "   (npm start dans le dossier backend)"
echo
read -p "Appuyez sur Entrée pour continuer..."

echo "🔄 Exécution des tests..."
node run-all-tests.js

echo
echo "📊 Tests terminés !"
echo