// backend/tests/setup.js

// Configuration globale pour tous les tests

// Charger les variables d'environnement de test
const path = require('path');
const fs = require('fs');

const envTestPath = path.resolve(__dirname, '../.env.test');
if (fs.existsSync(envTestPath)) {
  require('dotenv').config({ path: envTestPath });
} else {
  console.warn('⚠️  Fichier .env.test non trouvé, utilisation des variables par défaut');
  // Variables par défaut pour les tests
  process.env.NODE_ENV = 'test';
  process.env.DB_HOST = 'localhost';
  process.env.DB_PORT = '3306';
  process.env.DB_NAME = 'equizz_test_db';
  process.env.DB_USER = 'root';
  process.env.DB_PASSWORD = '123456';
  process.env.DB_DIALECT = 'mysql';
  process.env.JWT_SECRET = 'test_secret_key_for_testing_only';
  process.env.JWT_EXPIRES_IN = '1h';
}

// Augmenter le timeout global pour les tests d'intégration
jest.setTimeout(30000);

// Désactiver les logs pendant les tests (optionnel)
if (process.env.SILENT_TESTS === 'true') {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}

// Hook global avant tous les tests
beforeAll(() => {
  console.log('🧪 Démarrage des tests...');
});

// Hook global après tous les tests
afterAll(() => {
  console.log('✅ Tests terminés !');
});
