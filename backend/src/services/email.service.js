// backend/src/services/email.service.js

// 1. Importer le package SendGrid
const sgMail = require('@sendgrid/mail');
require('dotenv').config();

// 2. Configurer la clé API une seule fois au démarrage
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const verifiedSender = process.env.SENDGRID_VERIFIED_SENDER;

class EmailService {
  async sendAccountClaimEmail(etudiant, password) {
    // L'objet etudiant contient : { Utilisateur: {...}, matricule, ... }
    const utilisateur = etudiant.Utilisateur;
    
    // 3. Définir le message au format attendu par SendGrid
    const msg = {
      to: utilisateur.email,
      from: verifiedSender, // Doit être l'adresse que vous avez vérifiée
      subject: 'Vos identifiants de connexion EQuizz',
      html: `
        <h1>Bienvenue sur EQuizz !</h1>
        <p>Bonjour ${utilisateur.prenom},</p>
        <p>Votre compte a été activé avec succès. Voici vos identifiants pour vous connecter :</p>
        <ul>
          <li><strong>Identifiant (Email) :</strong> ${utilisateur.email}</li>
          <li><strong>Identifiant (Matricule) :</strong> ${etudiant.matricule}</li>
          <li><strong>Mot de passe :</strong> ${password}</li>
        </ul>
        <p>Veuillez conserver ce mot de passe en lieu sûr.</p>
        <p>Vous pouvez vous connecter avec votre email ou votre matricule.</p>
        <a href="http://lien-vers-le-frontend-de-connexion">Cliquez ici pour vous connecter</a>
      `,
    };

    // 4. Envoyer l'email
    try {
      await sgMail.send(msg);
      console.log(`✅ Email d'activation envoyé avec succès à ${utilisateur.email}`);
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de l\'email via SendGrid:', error);
      // Pour voir les détails de l'erreur renvoyée par l'API SendGrid
      if (error.response) {
        console.error(error.response.body);
      }
      // Propager l'erreur pour que le service parent puisse la gérer
      throw new Error('Le service d\'email n\'a pas pu envoyer le message.');
    }
  }

  async sendNotificationEmail(email, titre, message) {
    const msg = {
      to: email,
      from: verifiedSender,
      subject: titre,
      html: `
        <h2>${titre}</h2>
        <p>${message}</p>
        <p>Connectez-vous à EQuizz pour plus de détails.</p>
        <a href="http://lien-vers-le-frontend">Accéder à EQuizz</a>
      `,
    };

    try {
      await sgMail.send(msg);
      console.log(`✅ Email de notification envoyé à ${email}`);
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de l\'email de notification:', error);
      if (error.response) {
        console.error(error.response.body);
      }
      throw new Error('Le service d\'email n\'a pas pu envoyer la notification.');
    }
  }

  async sendCardLinkConfirmation(etudiant, idCarte) {
    const utilisateur = etudiant.Utilisateur;
    
    const msg = {
      to: utilisateur.email,
      from: verifiedSender,
      subject: 'Confirmation d\'association de carte - EQuizz',
      html: `
        <h1>Association de carte confirmée</h1>
        <p>Bonjour ${utilisateur.prenom},</p>
        <p>Votre carte a été associée avec succès à votre compte EQuizz.</p>
        <ul>
          <li><strong>Matricule :</strong> ${etudiant.matricule}</li>
          <li><strong>ID Carte :</strong> ${idCarte}</li>
        </ul>
        <p>Vous pouvez maintenant utiliser votre carte pour vous connecter rapidement à l'application.</p>
        <p>Si vous n'êtes pas à l'origine de cette action, veuillez contacter l'administration immédiatement.</p>
        <a href="http://lien-vers-le-frontend">Accéder à EQuizz</a>
      `,
    };

    try {
      await sgMail.send(msg);
      console.log(`✅ Email de confirmation d'association de carte envoyé à ${utilisateur.email}`);
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de l\'email de confirmation:', error);
      if (error.response) {
        console.error(error.response.body);
      }
      throw new Error('Le service d\'email n\'a pas pu envoyer la confirmation.');
    }
  }

  // Nouvelle fonction pour l'email de bienvenue (admin/enseignant)
  async sendWelcomeEmail(user, temporaryPassword) {
    const roleLabel = user.role === 'ADMIN' ? 'Administrateur' : 'Enseignant';

    const msg = {
      to: user.email,
      from: verifiedSender,
      subject: 'Bienvenue sur EQuizz - Vos identifiants',
      html: `
        <h1>Bienvenue sur EQuizz</h1>
        <p>Bonjour <strong>${user.prenom} ${user.nom}</strong>,</p>
        <p>Votre compte ${roleLabel} a été créé avec succès sur la plateforme EQuizz.</p>
        <h3>Vos identifiants de connexion :</h3>
        <ul>
          <li><strong>Email :</strong> ${user.email}</li>
          <li><strong>Mot de passe temporaire :</strong> ${temporaryPassword}</li>
        </ul>
        <p><strong>⚠️ Important :</strong> Pour des raisons de sécurité, veuillez changer votre mot de passe lors de votre première connexion.</p>
        <a href="http://localhost:52577/login">Se connecter à EQuizz</a>
        <p>Si vous avez des questions, n'hésitez pas à contacter l'administrateur système.</p>
      `,
    };

    try {
      await sgMail.send(msg);
      console.log(`✅ Email de bienvenue envoyé à ${user.email}`);
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de l\'email de bienvenue:', error);
      if (error.response) {
        console.error(error.response.body);
      }
      // Ne pas bloquer la création de l'utilisateur si l'email échoue
      console.warn('⚠️ L\'utilisateur a été créé mais l\'email n\'a pas pu être envoyé');
    }
  }

  // Nouvelle fonction pour l'email de réinitialisation de mot de passe
  async sendPasswordResetEmail(user, newPassword) {
    const msg = {
      to: user.email,
      from: verifiedSender,
      subject: 'EQuizz - Réinitialisation de votre mot de passe',
      html: `
        <h1>Réinitialisation de mot de passe</h1>
        <p>Bonjour <strong>${user.prenom} ${user.nom}</strong>,</p>
        <p>Votre mot de passe a été réinitialisé par un administrateur.</p>
        <h3>Votre nouveau mot de passe :</h3>
        <p><strong>${newPassword}</strong></p>
        <p><strong>⚠️ Important :</strong> Veuillez changer ce mot de passe dès votre prochaine connexion.</p>
        <a href="http://localhost:52577/login">Se connecter à EQuizz</a>
      `,
    };

    try {
      await sgMail.send(msg);
      console.log(`✅ Email de réinitialisation envoyé à ${user.email}`);
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de l\'email de réinitialisation:', error);
      if (error.response) {
        console.error(error.response.body);
      }
      console.warn('⚠️ Le mot de passe a été réinitialisé mais l\'email n\'a pas pu être envoyé');
    }
  }
}

module.exports = new EmailService();