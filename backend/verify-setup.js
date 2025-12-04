// Script de vérification de la configuration
require('dotenv').config();

console.log('🔍 Vérification de la configuration EQuizz Backend\n');

const checks = {
  '✅ Variables d\'environnement': [],
  '⚠️  Variables manquantes': [],
  '💡 Recommandations': []
};

// Variables requises
const required = {
  'DB_HOST': process.env.DB_HOST,
  'DB_USER': process.env.DB_USER,
  'DB_PASSWORD': process.env.DB_PASSWORD,
  'DB_NAME': process.env.DB_NAME,
  'DB_DIALECT': process.env.DB_DIALECT,
  'JWT_SECRET': process.env.JWT_SECRET,
  'SENDGRID_API_KEY': process.env.SENDGRID_API_KEY,
  'SENDGRID_VERIFIED_SENDER': process.env.SENDGRID_VERIFIED_SENDER
};

// Variables optionnelles
const optional = {
  'GOOGLE_AI_API_KEY': process.env.GOOGLE_AI_API_KEY,
  'DB_PORT': process.env.DB_PORT,
  'PORT': process.env.PORT,
  'NODE_ENV': process.env.NODE_ENV
};

// Vérifier les variables requises
for (const [key, value] of Object.entries(required)) {
  if (value) {
    checks['✅ Variables d\'environnement'].push(`${key}: ${maskValue(key, value)}`);
  } else {
    checks['⚠️  Variables manquantes'].push(key);
  }
}

// Vérifier les variables optionnelles
for (const [key, value] of Object.entries(optional)) {
  if (value) {
    checks['✅ Variables d\'environnement'].push(`${key}: ${maskValue(key, value)}`);
  }
}

// Vérifications spécifiques
if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  checks['💡 Recommandations'].push('JWT_SECRET devrait faire au moins 32 caractères');
}

if (process.env.DB_HOST === 'localhost' && process.env.NODE_ENV === 'production') {
  checks['💡 Recommandations'].push('En production, utilisez une base de données distante (Aiven)');
}

if (!process.env.GOOGLE_AI_API_KEY) {
  checks['💡 Recommandations'].push('GOOGLE_AI_API_KEY non configuré - L\'analyse de sentiments utilisera le mode basique');
}

if (process.env.NODE_ENV === 'production' && !process.env.DB_PORT) {
  checks['💡 Recommandations'].push('DB_PORT devrait être défini en production (généralement 12345 pour Aiven)');
}

// Afficher les résultats
for (const [category, items] of Object.entries(checks)) {
  if (items.length > 0) {
    console.log(`\n${category}:`);
    items.forEach(item => console.log(`  - ${item}`));
  }
}

// Résumé
console.log('\n' + '='.repeat(60));
if (checks['⚠️  Variables manquantes'].length === 0) {
  console.log('✅ Configuration valide! Vous pouvez démarrer l\'application.');
  console.log('\nProchaines étapes:');
  console.log('  1. npm run db:test    # Tester la connexion à la base');
  console.log('  2. npm run db:setup   # Créer les tables');
  console.log('  3. npm start          # Démarrer le serveur');
  console.log('  4. POST /api/init/seed # Peupler la base de données');
} else {
  console.log('❌ Configuration incomplète. Veuillez définir les variables manquantes.');
  console.log('\nCopiez .env.example vers .env et remplissez les valeurs.');
}
console.log('='.repeat(60) + '\n');

// Fonction pour masquer les valeurs sensibles
function maskValue(key, value) {
  const sensitiveKeys = ['PASSWORD', 'SECRET', 'KEY', 'TOKEN'];
  if (sensitiveKeys.some(k => key.includes(k))) {
    if (value.length <= 8) {
      return '***';
    }
    return value.substring(0, 4) + '...' + value.substring(value.length - 4);
  }
  return value;
}
