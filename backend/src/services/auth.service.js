// backend/src/services/auth.service.js
const etudiantRepository = require('../repositories/etudiant.repository');
const emailService = require('./email.service');
const generatePassword = require('generate-password');
const utilisateurRepository = require('../repositories/utilisateur.repository');
const jwtService = require('./jwt.service');
const AppError = require('../utils/AppError');

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
  
}

module.exports = new AuthService();