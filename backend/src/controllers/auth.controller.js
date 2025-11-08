const authService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');

class AuthController {
  claimAccount = asyncHandler(async (req, res) => {
    const { matricule, email, classeId } = req.body;
    await authService.processAccountClaim(matricule, email, classeId);
    res.status(200).json({ message: 'Si vos informations sont valides, vous recevrez un email avec vos identifiants de connexion.' });
  });

  login = asyncHandler(async (req, res) => {
    const { email, matricule, motDePasse } = req.body;
    const loginIdentifier = email || matricule;

    const { token, utilisateur } = await authService.login(loginIdentifier, motDePasse);
    
    // Déterminer le rôle et préparer les informations complètes
    let role = 'etudiant';
    let additionalInfo = {};

    if (utilisateur.Administrateur) {
      role = 'admin';
    } else if (utilisateur.Enseignant) {
      role = 'enseignant';
      additionalInfo = {
        specialite: utilisateur.Enseignant.specialite
      };
    } else if (utilisateur.Etudiant) {
      role = 'etudiant';
      additionalInfo = {
        matricule: utilisateur.Etudiant.matricule,
        idCarte: utilisateur.Etudiant.idCarte,
        classe: utilisateur.Etudiant.Classe ? {
          id: utilisateur.Etudiant.Classe.id,
          nom: utilisateur.Etudiant.Classe.nom,
          niveau: utilisateur.Etudiant.Classe.niveau
        } : null
      };
    }
    
    // Retourner toutes les informations non sensibles
    res.status(200).json({
      token,
      utilisateur: {
        id: utilisateur.id,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        role,
        ...additionalInfo
      }
    });
  });
}

module.exports = new AuthController();