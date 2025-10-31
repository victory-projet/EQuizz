const mailer = require('../config/mailer');
const nodemailer = require('nodemailer');

class EmailService {
  async sendAccountClaimEmail(etudiant, password) {
    const mailOptions = {
      from: '"EQuizz Platform" <no-reply@equizz.com>',
      to: etudiant.Utilisateur.email,
      subject: 'Vos identifiants de connexion EQuizz',
      html: `
        <h1>Bienvenue sur EQuizz !</h1>
        <p>Bonjour ${etudiant.Utilisateur.prenom},</p>
        <p>Votre compte a été activé avec succès. Voici vos identifiants pour vous connecter :</p>
        <ul>
          <li><strong>Identifiant :</strong> ${etudiant.matricule}</li>
          <li><strong>Mot de passe :</strong> ${password}</li>
        </ul>
        <p>Veuillez conserver ce mot de passe en lieu sûr.</p>
        <a href="http://lien-vers-le-frontend-de-connexion">Cliquez ici pour vous connecter</a>
      `
    };

    const info = await mailer.sendMail(mailOptions);

    console.log("Email envoyé. URL de prévisualisation : %s", nodemailer.getTestMessageUrl(info));
    return info;
  }
}

module.exports = new EmailService();