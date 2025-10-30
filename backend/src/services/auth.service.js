// backend/src/services/auth.service.js
const etudiantRepository = require('../repositories/etudiant.repository');
const emailService = require('./email.service');
const generatePassword = require('generate-password');

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
}

module.exports = new AuthService();