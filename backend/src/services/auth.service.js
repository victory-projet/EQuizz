// backend/src/services/auth.service.js
const etudiantRepository = require('../repositories/etudiant.repository');
const emailService = require('./email.service');
const generatePassword = require('generate-password');
const utilisateurRepository = require('../repositories/utilisateur.repository');
const jwtService = require('./jwt.service');
const AppError = require('../utils/AppError');
const db = require('../models');

class AuthService {
  async processAccountClaim(matricule, email, classeId) {
    // 1. Le service appelle le repository pour trouver l'étudiant
    const etudiant = await etudiantRepository.findStudentForClaim(matricule, email, classeId);
    if (!etudiant) {
      throw AppError.notFound('Les informations fournies ne correspondent à aucun étudiant pré-enregistré.', 'STUDENT_NOT_FOUND');
    }

    // 2. Vérifier si le compte est déjà activé
    if (etudiant.Utilisateur.motDePasseHash) {
      throw AppError.conflict('Ce compte a déjà été activé.', 'ACCOUNT_ALREADY_ACTIVATED');
    }
    
    // 3. Générer le mot de passe
    const password = generatePassword.generate({ length: 10, numbers: true, strict: true });
    
    // 4. Mettre à jour le mot de passe (le hachage est automatique grâce au Hook)
    await etudiantRepository.setPassword(etudiant.Utilisateur, password);
    
    // 5. Le service appelle le service d'email pour envoyer la notification
    await emailService.sendAccountClaimEmail(etudiant, password);

    return true;
  }

  async login(loginIdentifier, password) {
    // 1. Le service appelle le repository pour trouver l'utilisateur
    const utilisateur = await utilisateurRepository.findByLogin(loginIdentifier);
    
    if (!utilisateur) {
      throw AppError.unauthorized('Identifiants invalides.', 'INVALID_CREDENTIALS');
    }

    // 2. Le service utilise la méthode du modèle pour vérifier le mot de passe
    const isMatch = await utilisateur.isPasswordMatch(password);
    
    if (!isMatch) {
      throw AppError.unauthorized('Identifiants invalides.', 'INVALID_CREDENTIALS');
    }

    // 3. Le service appelle le service JWT pour générer le token
    const token = jwtService.generateToken(utilisateur);

    return { token, utilisateur }; // On retourne le token et les infos utilisateur
  }

  async linkCardToAccount(matricule, idCarte) {
    // 1. Trouver l'étudiant par matricule
    const etudiant = await etudiantRepository.findByMatricule(matricule);
    if (!etudiant) {
      throw AppError.notFound('Étudiant non trouvé.', 'STUDENT_NOT_FOUND');
    }

    // 2. Vérifier que le compte est activé
    if (!etudiant.Utilisateur.motDePasseHash) {
      throw AppError.badRequest('Vous devez d\'abord activer votre compte avant de lier une carte.', 'ACCOUNT_NOT_ACTIVATED');
    }

    // 3. Vérifier que la carte n'est pas déjà utilisée
    const existingCard = await etudiantRepository.findByIdCarte(idCarte);
    if (existingCard) {
      throw AppError.conflict('Cette carte est déjà associée à un autre compte.', 'CARD_ALREADY_LINKED');
    }

    // 4. Associer la carte à l'étudiant
    await etudiantRepository.updateIdCarte(etudiant.id, idCarte);

    // 5. Envoyer un email de confirmation
    await emailService.sendCardLinkConfirmation(etudiant, idCarte);

    return true;
  }

  async requestPasswordReset(email, ipAddress) {
    const crypto = require('crypto');
    const db = require('../models');

    // 1. Trouver l'utilisateur par email
    const utilisateur = await utilisateurRepository.findByEmail(email);
    if (!utilisateur) {
      // Pour des raisons de sécurité, on ne révèle pas si l'email existe ou non
      return { success: true, message: 'Si votre email est enregistré, vous recevrez un lien de réinitialisation.' };
    }

    // 2. Vérifier le rate limiting (max 3 tentatives par heure)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentTokens = await db.PasswordResetToken.count({
      where: {
        utilisateurId: utilisateur.id,
        createdAt: { [db.Sequelize.Op.gte]: oneHourAgo }
      }
    });

    if (recentTokens >= 3) {
      throw AppError.tooManyRequests('Trop de tentatives. Veuillez réessayer dans 1 heure.', 'TOO_MANY_REQUESTS');
    }

    // 3. Générer un token sécurisé
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

    // 4. Sauvegarder le token en base
    await db.PasswordResetToken.create({
      utilisateurId: utilisateur.id,
      token,
      expiresAt,
      ipAddress
    });

    // 5. Envoyer l'email de réinitialisation
    await emailService.sendPasswordResetEmail(utilisateur, token);

    return { success: true, message: 'Un email de réinitialisation a été envoyé à votre adresse.' };
  }

  async validateResetToken(token) {
    const db = require('../models');

    // 1. Trouver le token en base
    const resetToken = await db.PasswordResetToken.findOne({
      where: { token },
      include: [{ model: db.Utilisateur }]
    });

    if (!resetToken) {
      return { valid: false };
    }

    // 2. Vérifier si le token a expiré
    if (new Date() > resetToken.expiresAt) {
      return { valid: false };
    }

    // 3. Vérifier si le token a déjà été utilisé
    if (resetToken.usedAt) {
      return { valid: false };
    }

    return { valid: true, email: resetToken.Utilisateur.email };
  }

  async resetPassword(token, newPassword, confirmPassword) {
    const db = require('../models');

    // 1. Valider que les mots de passe correspondent
    if (newPassword !== confirmPassword) {
      throw AppError.badRequest('Les mots de passe ne correspondent pas.', 'PASSWORDS_MISMATCH');
    }

    // 2. Valider la complexité du mot de passe
    if (newPassword.length < 8) {
      throw AppError.badRequest('Le mot de passe doit contenir au moins 8 caractères.', 'PASSWORD_TOO_SHORT');
    }

    // 3. Trouver et valider le token
    const resetToken = await db.PasswordResetToken.findOne({
      where: { token },
      include: [{ model: db.Utilisateur }]
    });

    if (!resetToken) {
      throw AppError.badRequest('Token invalide ou expiré.', 'INVALID_TOKEN');
    }

    if (new Date() > resetToken.expiresAt) {
      throw AppError.badRequest('Token invalide ou expiré.', 'TOKEN_EXPIRED');
    }

    if (resetToken.usedAt) {
      throw AppError.badRequest('Ce token a déjà été utilisé.', 'TOKEN_ALREADY_USED');
    }

    // 4. Mettre à jour le mot de passe
    const utilisateur = resetToken.Utilisateur;
    utilisateur.motDePasseHash = newPassword; // Le hook beforeSave va hasher automatiquement
    await utilisateur.save();

    // 5. Marquer le token comme utilisé
    resetToken.usedAt = new Date();
    await resetToken.save();

    // 6. Invalider tous les autres tokens de cet utilisateur
    await db.PasswordResetToken.update(
      { usedAt: new Date() },
      {
        where: {
          utilisateurId: utilisateur.id,
          usedAt: null,
          id: { [db.Sequelize.Op.ne]: resetToken.id }
        }
      }
    );

    return { success: true, message: 'Votre mot de passe a été réinitialisé avec succès.' };
  }
  
}

module.exports = new AuthService();