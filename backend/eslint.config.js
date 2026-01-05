
const globals = require('globals');
const js = require('@eslint/js');

module.exports = [
  // Applique les règles recommandées par ESLint
  js.configs.recommended,

  {
    // Applique ces règles à tous les fichiers .js
    files: ['**/*.js'],

    // Définit les variables globales disponibles dans l'environnement
    languageOptions: {
      ecmaVersion: 'latest', // Utilise la dernière version de JavaScript
      sourceType: 'commonjs', // On utilise require/module.exports
      globals: {
        ...globals.node, // Variables globales de Node.js (console, process, etc.)
        ...globals.jest, // Variables globales de Jest (describe, it, expect, etc.)
      },
    },

    // Définit les règles de style spécifiques
    rules: {
      'indent': ['error', 2], // Force une indentation de 2 espaces
      'linebreak-style': 'off', // Désactive la vérification des fins de ligne (compatible Windows/Unix)
      'quotes': ['error', 'single'], // Force l'utilisation de guillemets simples (')
      'semi': ['error', 'always'], // Force l'ajout de points-virgules à la fin des lignes
      'no-unused-vars': ['warn'], // Affiche un avertissement pour les variables non utilisées (au lieu d'une erreur)
    },
  }
];