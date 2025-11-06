const path = require('path');
const fs = require('fs');

// Charger .env seulement s'il existe (développement local)
const envPath = path.resolve(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

const nodemailer = require('nodemailer');

// Debug: Vérifier si les variables d'environnement sont chargées
console.log('📧 Configuration Email:');
console.log('  EMAIL_HOST:', process.env.EMAIL_HOST || 'NON DÉFINI');
console.log('  EMAIL_PORT:', process.env.EMAIL_PORT || 'NON DÉFINI');
console.log('  EMAIL_USER:', process.env.EMAIL_USER || 'NON DÉFINI');

// NOTE : En production, vous remplacerez ces informations par celles de votre vrai service d'email.
const transport = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false, // true pour le port 465, false pour tous les autres ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  // --- AJOUTEZ CETTE PARTIE ---
  tls: {
    // Ne pas échouer sur les certificats invalides (utile pour les tests locaux/Ethereal)
    rejectUnauthorized: false
  }
});

// Tester la connexion au démarrage
transport.verify(function (error, success) {
  if (error) {
    console.error('❌ Erreur de connexion au serveur email:', error.message);
    console.error('Vérifiez vos identifiants EMAIL_USER et EMAIL_PASS dans le fichier .env');
  } else {
    console.log('✅ Serveur email prêt à envoyer des messages');
  }
});

module.exports = transport;