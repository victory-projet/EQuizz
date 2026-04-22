// backend/src/services/email.service.js

const nodemailer = require('nodemailer');
const { getSecret } = require('../utils/secrets');

// 2. Vérifier si les emails sont désactivés
const emailsDisabled = process.env.DISABLE_EMAIL_NOTIFICATIONS === 'true';

class EmailService {
  constructor() {
    if (!emailsDisabled) {
      if (process.env.SENDGRID_API_KEY) {
        this.transporter = nodemailer.createTransport({
          host: 'smtp.sendgrid.net',
          port: 587,
          auth: {
            user: 'apikey',
            pass: process.env.SENDGRID_API_KEY
          }
        });
        console.log('📧 Service email (SendGrid) initialisé');
      } else {
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: getSecret('SMTP_USER', process.env.SMTP_USER),
            pass: getSecret('SMTP_PASS', process.env.SMTP_PASS)
          }
        });
        console.log('📧 Service email (Gmail) initialisé');
      }
    }
  }

  async _sendMail(msg) {
    if (emailsDisabled) {
      console.log('📧 Email désactivé - Envoi simulé à:', msg.to);
      return { success: true, message: 'Email désactivé' };
    }

    try {
      const defaultFrom = process.env.SENDGRID_VERIFIED_SENDER || getSecret('SMTP_USER', process.env.SMTP_USER);
      const info = await this.transporter.sendMail({
        from: msg.from || `"EQuizz Platform" <${defaultFrom}>`,
        to: msg.to,
        subject: msg.subject,
        html: msg.html
      });
      console.log('✅ Email envoyé:', info.messageId);
      return info;
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
      throw new Error('Le service d\'email n\'a pas pu envoyer le message.');
    }
  }

  async sendAccountClaimEmail(etudiant, password) {
    const utilisateur = etudiant.Utilisateur;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
    
    const defaultFrom = process.env.SENDGRID_VERIFIED_SENDER || getSecret('SMTP_USER', process.env.SMTP_USER);
    const msg = {
      to: utilisateur.email,
      from: `"EQuizz Platform" <${defaultFrom}>`,
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

    return this._sendMail(msg);
  }

  async sendNotificationEmail(email, titre, message) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
    
    const msg = {
      to: email,
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

    return this._sendMail(msg);
  }

  async sendCardLinkConfirmation(etudiant, idCarte) {
    const utilisateur = etudiant.Utilisateur;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
    
    const msg = {
      to: utilisateur.email,
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

    return this._sendMail(msg);
  }

  async sendWelcomeEmail(user, temporaryPassword) {
    const roleLabel = (user.role === 'SUPER-ADMIN') ? 'Administrateur' : 'Enseignant';
    const roleIcon = (user.role === 'SUPER-ADMIN') ? '👨‍💼' : '👨‍🏫';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';

    const msg = {
      to: user.email,
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

    return this._sendMail(msg);
  }

  async sendPasswordResetEmail(utilisateur, token) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    const msg = {
      to: utilisateur.email,
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

    return this._sendMail(msg);
  }
}

module.exports = new EmailService();