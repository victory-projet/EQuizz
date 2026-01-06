// backend/src/services/email.service.js

// 1. Importer le package SendGrid
const sgMail = require('@sendgrid/mail');
require('dotenv').config();

// 2. Vérifier si les emails sont désactivés
const emailsDisabled = process.env.DISABLE_EMAIL_NOTIFICATIONS === 'true';

// 3. Configurer la clé API seulement si les emails sont activés
if (!emailsDisabled && process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const verifiedSender = process.env.SENDGRID_VERIFIED_SENDER;

class EmailService {
  async sendAccountClaimEmail(etudiant, password) {
    // Vérifier si les emails sont désactivés
    if (emailsDisabled) {
      console.log('📧 Email désactivé - sendAccountClaimEmail pour:', etudiant.Utilisateur.email);
      return { success: true, message: 'Email désactivé en mode développement' };
    }

    // Vérifier si la clé API SendGrid est configurée
    if (!process.env.SENDGRID_API_KEY || !verifiedSender) {
      console.log('📧 SendGrid non configuré - sendAccountClaimEmail pour:', etudiant.Utilisateur.email);
      return { success: true, message: 'SendGrid non configuré en mode développement' };
    }

    // L'objet etudiant contient : { Utilisateur: {...}, matricule, ... }
    const utilisateur = etudiant.Utilisateur;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
    
    // 3. Définir le message au format attendu par SendGrid
    const msg = {
      to: utilisateur.email,
      from: verifiedSender,
      subject: 'Bienvenue sur EQuizz - Vos identifiants de connexion',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Bienvenue sur EQuizz</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
                <tr>
                    <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
                            <!-- Header avec gradient -->
                            <tr>
                                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                                    <div style="width: 80px; height: 80px; margin: 0 auto 20px; background: rgba(255,255,255,0.2); border-radius: 20px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
                                        <span style="font-size: 48px; color: white;">🎓</span>
                                    </div>
                                    <h1 style="margin: 0; color: white; font-size: 32px; font-weight: 700;">EQuizz</h1>
                                    <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Plateforme d'évaluation des enseignements</p>
                                </td>
                            </tr>
                            
                            <!-- Contenu -->
                            <tr>
                                <td style="padding: 40px 30px;">
                                    <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">Bienvenue ${utilisateur.prenom} !</h2>
                                    
                                    <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                                        Votre compte étudiant a été activé avec succès. Vous pouvez maintenant accéder à la plateforme EQuizz pour participer aux évaluations de vos enseignements.
                                    </p>
                                    
                                    <!-- Carte identifiants -->
                                    <div style="background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); border-radius: 12px; padding: 24px; margin: 30px 0;">
                                        <h3 style="margin: 0 0 16px 0; color: #667eea; font-size: 18px; font-weight: 600;">Vos identifiants de connexion</h3>
                                        
                                        <table width="100%" cellpadding="8" cellspacing="0">
                                            <tr>
                                                <td style="color: #718096; font-size: 14px; padding: 8px 0;">
                                                    <strong>Email :</strong>
                                                </td>
                                                <td style="color: #1a1a1a; font-size: 14px; padding: 8px 0; text-align: right;">
                                                    ${utilisateur.email}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #718096; font-size: 14px; padding: 8px 0;">
                                                    <strong>Matricule :</strong>
                                                </td>
                                                <td style="color: #1a1a1a; font-size: 14px; padding: 8px 0; text-align: right;">
                                                    ${etudiant.matricule}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #718096; font-size: 14px; padding: 8px 0;">
                                                    <strong>Mot de passe :</strong>
                                                </td>
                                                <td style="color: #667eea; font-size: 16px; font-weight: 600; padding: 8px 0; text-align: right; font-family: 'Courier New', monospace;">
                                                    ${password}
                                                </td>
                                            </tr>
                                        </table>
                                    </div>
                                    
                                    <!-- Alerte sécurité -->
                                    <div style="background: #fff5f5; border-left: 4px solid #fc8181; padding: 16px; margin: 20px 0; border-radius: 4px;">
                                        <p style="margin: 0; color: #c53030; font-size: 14px; line-height: 1.6;">
                                            <strong>⚠️ Important :</strong> Conservez ce mot de passe en lieu sûr. Nous vous recommandons de le changer lors de votre première connexion.
                                        </p>
                                    </div>
                                    
                                    <p style="margin: 20px 0; color: #4a5568; font-size: 14px; line-height: 1.6;">
                                        Vous pouvez vous connecter en utilisant soit votre email, soit votre matricule.
                                    </p>
                                    
                                    <!-- Bouton CTA -->
                                    <div style="text-align: center; margin: 30px 0;">
                                        <a href="${frontendUrl}/login" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                                            Se connecter maintenant
                                        </a>
                                    </div>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="background: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                                    <p style="margin: 0 0 10px 0; color: #718096; font-size: 12px;">
                                        Cet email a été envoyé automatiquement, merci de ne pas y répondre.
                                    </p>
                                    <p style="margin: 0; color: #a0aec0; font-size: 12px;">
                                        © 2025 EQuizz. Tous droits réservés.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
      `,
    };

    // 4. Envoyer l'email
    try {
      await sgMail.send(msg);
      console.log(`✅ Email d'activation envoyé avec succès à ${utilisateur.email}`);
      return { success: true, message: 'Email envoyé avec succès' };
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de l\'email via SendGrid:', error);
      
      // Gestion spécifique des erreurs SendGrid
      if (error.response && error.response.body && error.response.body.errors) {
        const sendGridError = error.response.body.errors[0];
        
        if (sendGridError && sendGridError.message.includes('Maximum credits exceeded')) {
          console.warn('⚠️ Quota SendGrid dépassé - email non envoyé à:', utilisateur.email);
          return { success: false, message: 'Quota SendGrid dépassé' };
        }
      }
      
      if (error.code === 401) {
        console.warn('⚠️ Clé API SendGrid invalide ou expirée');
        return { success: false, message: 'Configuration email invalide' };
      }
      
      console.warn('⚠️ L\'utilisateur a été créé mais l\'email n\'a pas pu être envoyé');
      return { success: false, message: 'Email service error' };
    }
  }

  async sendNotificationEmail(email, titre, message) {
    // Vérifier si les emails sont désactivés
    if (emailsDisabled) {
      console.log('📧 Email désactivé - sendNotificationEmail pour:', email);
      return { success: true, message: 'Email désactivé en mode développement' };
    }

    // Vérifier si la clé API SendGrid est configurée
    if (!process.env.SENDGRID_API_KEY || !verifiedSender) {
      console.log('📧 SendGrid non configuré - sendNotificationEmail pour:', email);
      return { success: true, message: 'SendGrid non configuré en mode développement' };
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
    
    const msg = {
      to: email,
      from: verifiedSender,
      subject: titre,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${titre}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
                <tr>
                    <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
                            <!-- Header -->
                            <tr>
                                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;">
                                    <div style="width: 60px; height: 60px; margin: 0 auto 15px; background: rgba(255,255,255,0.2); border-radius: 15px; display: flex; align-items: center; justify-content: center;">
                                        <span style="font-size: 36px; color: white;">🔔</span>
                                    </div>
                                    <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 700;">EQuizz</h1>
                                </td>
                            </tr>
                            
                            <!-- Contenu -->
                            <tr>
                                <td style="padding: 40px 30px;">
                                    <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 22px; font-weight: 600;">${titre}</h2>
                                    
                                    <div style="background: #f7fafc; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px;">
                                        <p style="margin: 0; color: #4a5568; font-size: 15px; line-height: 1.6;">
                                            ${message}
                                        </p>
                                    </div>
                                    
                                    <p style="margin: 20px 0; color: #718096; font-size: 14px;">
                                        Connectez-vous à EQuizz pour plus de détails.
                                    </p>
                                    
                                    <!-- Bouton -->
                                    <div style="text-align: center; margin: 30px 0;">
                                        <a href="${frontendUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
                                            Accéder à EQuizz
                                        </a>
                                    </div>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="background: #f7fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                                    <p style="margin: 0; color: #a0aec0; font-size: 12px;">
                                        © 2025 EQuizz. Tous droits réservés.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
      `,
    };

    try {
      await sgMail.send(msg);
      console.log(`✅ Email de notification envoyé à ${email}`);
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de l\'email de notification:', error);
      
      // Gestion spécifique des erreurs SendGrid
      if (error.response && error.response.body && error.response.body.errors) {
        const sendGridError = error.response.body.errors[0];
        
        if (sendGridError && sendGridError.message.includes('Maximum credits exceeded')) {
          console.warn('⚠️ Quota SendGrid dépassé - notification non envoyée à:', email);
          // Ne pas faire échouer le processus, juste logger l'erreur
          return { success: false, message: 'Quota SendGrid dépassé' };
        }
      }
      
      if (error.code === 401) {
        console.warn('⚠️ Clé API SendGrid invalide ou expirée');
        return { success: false, message: 'Configuration email invalide' };
      }
      
      // Pour les autres erreurs, on lance toujours l'exception
      throw new Error('Le service d\'email n\'a pas pu envoyer la notification.');
    }
  } 

  async sendCardLinkConfirmation(etudiant, idCarte) {
    // Vérifier si les emails sont désactivés
    if (emailsDisabled) {
      console.log('📧 Email désactivé - sendCardLinkConfirmation pour:', etudiant.Utilisateur.email);
      return { success: true, message: 'Email désactivé en mode développement' };
    }

    // Vérifier si la clé API SendGrid est configurée
    if (!process.env.SENDGRID_API_KEY || !verifiedSender) {
      console.log('📧 SendGrid non configuré - sendCardLinkConfirmation pour:', etudiant.Utilisateur.email);
      return { success: true, message: 'SendGrid non configuré en mode développement' };
    }

    const utilisateur = etudiant.Utilisateur;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
    
    const msg = {
      to: utilisateur.email,
      from: verifiedSender,
      subject: 'Confirmation d\'association de carte - EQuizz',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Association de carte confirmée</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
                <tr>
                    <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
                            <!-- Header -->
                            <tr>
                                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;">
                                    <div style="width: 60px; height: 60px; margin: 0 auto 15px; background: rgba(255,255,255,0.2); border-radius: 15px; display: flex; align-items: center; justify-content: center;">
                                        <span style="font-size: 36px; color: white;">💳</span>
                                    </div>
                                    <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 700;">EQuizz</h1>
                                </td>
                            </tr>
                            
                            <!-- Contenu -->
                            <tr>
                                <td style="padding: 40px 30px;">
                                    <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 22px; font-weight: 600;">Association de carte confirmée</h2>
                                    
                                    <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                                        Bonjour <strong>${utilisateur.prenom}</strong>,
                                    </p>
                                    
                                    <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 15px; line-height: 1.6;">
                                        Votre carte a été associée avec succès à votre compte EQuizz.
                                    </p>
                                    
                                    <!-- Carte informations -->
                                    <div style="background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); border-radius: 12px; padding: 24px; margin: 30px 0;">
                                        <table width="100%" cellpadding="8" cellspacing="0">
                                            <tr>
                                                <td style="color: #718096; font-size: 14px; padding: 8px 0;">
                                                    <strong>Matricule :</strong>
                                                </td>
                                                <td style="color: #1a1a1a; font-size: 14px; padding: 8px 0; text-align: right;">
                                                    ${etudiant.matricule}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #718096; font-size: 14px; padding: 8px 0;">
                                                    <strong>ID Carte :</strong>
                                                </td>
                                                <td style="color: #667eea; font-size: 16px; font-weight: 600; padding: 8px 0; text-align: right; font-family: 'Courier New', monospace;">
                                                    ${idCarte}
                                                </td>
                                            </tr>
                                        </table>
                                    </div>
                                    
                                    <div style="background: #d1fae5; border-left: 4px solid #10b981; padding: 16px; margin: 20px 0; border-radius: 4px;">
                                        <p style="margin: 0; color: #065f46; font-size: 14px; line-height: 1.6;">
                                            <strong>✓ Succès :</strong> Vous pouvez maintenant utiliser votre carte pour vous connecter rapidement à l'application mobile.
                                        </p>
                                    </div>
                                    
                                    <!-- Alerte sécurité -->
                                    <div style="background: #fff5f5; border-left: 4px solid #fc8181; padding: 16px; margin: 20px 0; border-radius: 4px;">
                                        <p style="margin: 0; color: #c53030; font-size: 14px; line-height: 1.6;">
                                            <strong>⚠️ Sécurité :</strong> Si vous n'êtes pas à l'origine de cette action, veuillez contacter l'administration immédiatement.
                                        </p>
                                    </div>
                                    
                                    <!-- Bouton -->
                                    <div style="text-align: center; margin: 30px 0;">
                                        <a href="${frontendUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
                                            Accéder à EQuizz
                                        </a>
                                    </div>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="background: #f7fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                                    <p style="margin: 0; color: #a0aec0; font-size: 12px;">
                                        © 2025 EQuizz. Tous droits réservés.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
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
    // Vérifier si les emails sont désactivés
    if (emailsDisabled) {
      console.log('📧 Email désactivé - sendWelcomeEmail pour:', user.email);
      return { success: true, message: 'Email désactivé en mode développement' };
    }

    // Vérifier si la clé API SendGrid est configurée
    if (!process.env.SENDGRID_API_KEY || !verifiedSender) {
      console.log('📧 SendGrid non configuré - sendWelcomeEmail pour:', user.email);
      return { success: true, message: 'SendGrid non configuré en mode développement' };
    }

    const roleLabel = user.role === 'ADMIN' ? 'Administrateur' : 'Enseignant';
    const roleIcon = user.role === 'ADMIN' ? '👨‍💼' : '👨‍🏫';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';

    const msg = {
      to: user.email,
      from: verifiedSender,
      subject: `Bienvenue sur EQuizz - Compte ${roleLabel}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Bienvenue sur EQuizz</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
                <tr>
                    <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
                            <!-- Header -->
                            <tr>
                                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                                    <div style="width: 80px; height: 80px; margin: 0 auto 20px; background: rgba(255,255,255,0.2); border-radius: 20px; display: flex; align-items: center; justify-content: center;">
                                        <span style="font-size: 48px; color: white;">${roleIcon}</span>
                                    </div>
                                    <h1 style="margin: 0; color: white; font-size: 32px; font-weight: 700;">EQuizz</h1>
                                    <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Plateforme d'évaluation des enseignements</p>
                                </td>
                            </tr>
                            
                            <!-- Contenu -->
                            <tr>
                                <td style="padding: 40px 30px;">
                                    <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">Bienvenue sur EQuizz !</h2>
                                    
                                    <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                                        Bonjour <strong>${user.prenom} ${user.nom}</strong>,
                                    </p>
                                    
                                    <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 15px; line-height: 1.6;">
                                        Votre compte <strong>${roleLabel}</strong> a été créé avec succès sur la plateforme EQuizz.
                                    </p>
                                    
                                    <!-- Carte identifiants -->
                                    <div style="background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); border-radius: 12px; padding: 24px; margin: 30px 0;">
                                        <h3 style="margin: 0 0 16px 0; color: #667eea; font-size: 18px; font-weight: 600;">Vos identifiants de connexion</h3>
                                        
                                        <table width="100%" cellpadding="8" cellspacing="0">
                                            <tr>
                                                <td style="color: #718096; font-size: 14px; padding: 8px 0;">
                                                    <strong>Email :</strong>
                                                </td>
                                                <td style="color: #1a1a1a; font-size: 14px; padding: 8px 0; text-align: right;">
                                                    ${user.email}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #718096; font-size: 14px; padding: 8px 0;">
                                                    <strong>Rôle :</strong>
                                                </td>
                                                <td style="color: #667eea; font-size: 14px; font-weight: 600; padding: 8px 0; text-align: right;">
                                                    ${roleLabel}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #718096; font-size: 14px; padding: 8px 0;">
                                                    <strong>Mot de passe temporaire :</strong>
                                                </td>
                                                <td style="color: #667eea; font-size: 16px; font-weight: 600; padding: 8px 0; text-align: right; font-family: 'Courier New', monospace;">
                                                    ${temporaryPassword}
                                                </td>
                                            </tr>
                                        </table>
                                    </div>
                                    
                                    <!-- Alerte sécurité -->
                                    <div style="background: #fff5f5; border-left: 4px solid #fc8181; padding: 16px; margin: 20px 0; border-radius: 4px;">
                                        <p style="margin: 0; color: #c53030; font-size: 14px; line-height: 1.6;">
                                            <strong>⚠️ Important :</strong> Pour des raisons de sécurité, veuillez changer votre mot de passe lors de votre première connexion.
                                        </p>
                                    </div>
                                    
                                    <!-- Bouton CTA -->
                                    <div style="text-align: center; margin: 30px 0;">
                                        <a href="${frontendUrl}/login" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                                            Se connecter maintenant
                                        </a>
                                    </div>
                                    
                                    <p style="margin: 20px 0 0 0; color: #718096; font-size: 13px; text-align: center;">
                                        Si vous avez des questions, n'hésitez pas à contacter l'administrateur système.
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="background: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                                    <p style="margin: 0 0 10px 0; color: #718096; font-size: 12px;">
                                        Cet email a été envoyé automatiquement, merci de ne pas y répondre.
                                    </p>
                                    <p style="margin: 0; color: #a0aec0; font-size: 12px;">
                                        © 2025 EQuizz. Tous droits réservés.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
      `,
    };

    try {
      await sgMail.send(msg);
      console.log(`✅ Email de bienvenue envoyé à ${user.email}`);
      return { success: true, message: 'Email envoyé avec succès' };
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de l\'email de bienvenue:', error);
      
      // Gestion spécifique des erreurs SendGrid
      if (error.response && error.response.body && error.response.body.errors) {
        const sendGridError = error.response.body.errors[0];
        
        if (sendGridError && sendGridError.message.includes('Maximum credits exceeded')) {
          console.warn('⚠️ Quota SendGrid dépassé - email non envoyé à:', user.email);
          return { success: false, message: 'Quota SendGrid dépassé' };
        }
      }
      
      if (error.code === 401) {
        console.warn('⚠️ Clé API SendGrid invalide ou expirée');
        return { success: false, message: 'Configuration email invalide' };
      }
      
      // Ne pas bloquer la création de l'utilisateur si l'email échoue
      console.warn('⚠️ L\'utilisateur a été créé mais l\'email n\'a pas pu être envoyé');
      return { success: false, message: 'Email service error' };
    }
  }

  // Nouvelle fonction pour l'email de réinitialisation de mot de passe
  async sendPasswordResetEmail(utilisateur, token) {
    // Vérifier si les emails sont désactivés
    if (emailsDisabled) {
      console.log('📧 Email désactivé - sendPasswordResetEmail pour:', utilisateur.email);
      return { success: true, message: 'Email désactivé en mode développement' };
    }

    // Vérifier si la clé API SendGrid est configurée
    if (!process.env.SENDGRID_API_KEY || !verifiedSender) {
      console.log('📧 SendGrid non configuré - sendPasswordResetEmail pour:', utilisateur.email);
      return { success: true, message: 'SendGrid non configuré en mode développement' };
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    const msg = {
      to: utilisateur.email,
      from: verifiedSender,
      subject: 'EQuizz - Réinitialisation de votre mot de passe',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Réinitialisation mot de passe</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
                <tr>
                    <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
                            <!-- Header -->
                            <tr>
                                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                                    <div style="width: 80px; height: 80px; margin: 0 auto 20px; background: rgba(255,255,255,0.2); border-radius: 20px; display: flex; align-items: center; justify-content: center;">
                                        <span style="font-size: 48px; color: white;">🔐</span>
                                    </div>
                                    <h1 style="margin: 0; color: white; font-size: 32px; font-weight: 700;">EQuizz</h1>
                                    <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Réinitialisation de mot de passe</p>
                                </td>
                            </tr>
                            
                            <!-- Contenu -->
                            <tr>
                                <td style="padding: 40px 30px;">
                                    <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">Réinitialisation de votre mot de passe</h2>
                                    
                                    <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                                        Bonjour <strong>${utilisateur.prenom} ${utilisateur.nom}</strong>,
                                    </p>
                                    
                                    <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 15px; line-height: 1.6;">
                                        Vous avez demandé la réinitialisation de votre mot de passe pour votre compte EQuizz.
                                    </p>
                                    
                                    <p style="margin: 0 0 30px 0; color: #4a5568; font-size: 15px; line-height: 1.6;">
                                        Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :
                                    </p>
                                    
                                    <!-- Bouton CTA -->
                                    <div style="text-align: center; margin: 30px 0;">
                                        <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                                            Réinitialiser mon mot de passe
                                        </a>
                                    </div>
                                    
                                    <!-- Alerte expiration -->
                                    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 30px 0; border-radius: 4px;">
                                        <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                                            <strong>⏱️ Attention :</strong> Ce lien expire dans <strong>1 heure</strong>.
                                        </p>
                                    </div>
                                    
                                    <p style="margin: 20px 0; color: #718096; font-size: 14px; line-height: 1.6;">
                                        Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. Votre mot de passe actuel reste inchangé.
                                    </p>
                                    
                                    <!-- Lien de secours -->
                                    <div style="background: #f7fafc; padding: 20px; margin: 30px 0; border-radius: 8px; border: 1px solid #e2e8f0;">
                                        <p style="margin: 0 0 10px 0; color: #4a5568; font-size: 13px; font-weight: 600;">
                                            Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
                                        </p>
                                        <p style="margin: 0; color: #667eea; font-size: 12px; word-break: break-all; font-family: 'Courier New', monospace;">
                                            ${resetUrl}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="background: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                                    <p style="margin: 0 0 10px 0; color: #718096; font-size: 12px;">
                                        Cet email a été envoyé automatiquement, merci de ne pas y répondre.
                                    </p>
                                    <p style="margin: 0; color: #a0aec0; font-size: 12px;">
                                        © 2025 EQuizz. Tous droits réservés.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
      `,
    };

    try {
      await sgMail.send(msg);
      console.log(`✅ Email de réinitialisation envoyé à ${utilisateur.email}`);
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de l\'email de réinitialisation:', error);
      if (error.response) {
        console.error(error.response.body);
      }
      throw new Error('Le service d\'email n\'a pas pu envoyer le lien de réinitialisation.');
    }
  }
}

module.exports = new EmailService();