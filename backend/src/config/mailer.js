const nodemailer = require('nodemailer');

// NOTE : En production, vous remplacerez ces informations par celles de votre vrai service d'email.
const transport = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
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

module.exports = transport;