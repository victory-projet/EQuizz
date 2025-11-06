// backend/src/services/auth.service.js
const etudiantRepository = require('../repositories/etudiant.repository');
const emailService = require('./email.service');
const generatePassword = require('generate-password');
const utilisateurRepository = require('../repositories/utilisateur.repository');
const jwtService = require('./jwt.service');

class AuthService {
  async processAccountClaim(matricule, email, classeId) {
    // 1. Le service appelle le repository pour trouver l'étudiant
    const etudiant = await etudiantRepository.findStudentForClaim(matricule, email, classeId);
    if (!etudiant) {
      throw new Error('Les informations fournies ne correspondent à aucun étudiant pré-enregistré.');
    }

    // 2. Vérifier si le compte est déjà activé
    if (etudiant.Utilisateur.motDePasseHash) {
      throw new Error('Ce compte a déjà été activé.');
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
      throw new Error('Identifiants invalides.'); // Message générique pour la sécurité
    }

    // 2. Le service utilise la méthode du modèle pour vérifier le mot de passe
    const isMatch = await utilisateur.isPasswordMatch(password);
    if (!isMatch) {
      throw new Error('Identifiants invalides.'); // Même message générique
    }

    // 3. Le service appelle le service JWT pour générer le token
    const token = jwtService.generateToken(utilisateur);

    return { token, utilisateur }; // On retourne le token et les infos utilisateur
  }
  
}

module.exports = new AuthService();