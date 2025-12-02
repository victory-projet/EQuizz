// backend/tests/setup.js
// Configuration globale pour tous les tests

require('dotenv').config({ path: '.env.test' });

// Mock console pour réduire le bruit dans les tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Timeout global pour les tests
jest.setTimeout(10000);

// Nettoyage après chaque test
afterEach(() => {
  jest.clearAllMocks();
});
