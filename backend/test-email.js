// Script de test pour vérifier la configuration email
require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('🧪 Test de configuration email\n');
console.log('Configuration actuelle:');
console.log('  EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('  EMAIL_PORT:', process.env.EMAIL_PORT);
console.log('  EMAIL_USER:', process.env.EMAIL_USER);
console.log('  EMAIL_PASS:', process.env.EMAIL_PASS ? '***' + process.env.EMAIL_PASS.slice(-4) : 'NON DÉFINI');
console.log('');

const transport = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

console.log('📧 Test de connexion au serveur email...\n');

transport.verify(function (error, _success) {
  if (error) {
    console.error('❌ Erreur de connexion:', error.message);
    console.error('\n💡 Solutions:');
    console.error('   1. Créez de nouveaux identifiants sur https://ethereal.email/');
    console.error('   2. Mettez à jour EMAIL_USER et EMAIL_PASS dans le fichier .env');
    console.error('   3. Redémarrez le serveur');
    process.exit(1);
  } else {
    console.log('✅ Connexion réussie ! Le serveur email est prêt.');
    console.log('\n📤 Envoi d\'un email de test...\n');

    // Envoyer un email de test
    transport.sendMail({
      from: '"Test EQuizz" <test@equizz.com>',
      to: process.env.EMAIL_USER,
      subject: 'Test de configuration email',
      html: '<h1>Succès !</h1><p>Votre configuration email fonctionne correctement.</p>'
    }, (error, info) => {
      if (error) {
        console.error('❌ Erreur lors de l\'envoi:', error.message);
        process.exit(1);
      } else {
        console.log('✅ Email envoyé avec succès !');
        console.log('📧 Message ID:', info.messageId);
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log('🔗 URL de prévisualisation Ethereal:');
        console.log('   ', previewUrl);
        console.log('\n💡 Copiez ce lien dans votre navigateur pour voir l\'email');
        process.exit(0);
      }
    });
  }
});
