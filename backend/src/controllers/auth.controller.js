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
    let role = 'ETUDIANT';
    let additionalInfo = {};

    if (utilisateur.Administrateur) {
      role = 'ADMIN';
    } else if (utilisateur.Enseignant) {
      role = 'ENSEIGNANT';
      additionalInfo = {
        specialite: utilisateur.Enseignant.specialite
      };
    } else if (utilisateur.Etudiant) {
      role = 'ETUDIANT';
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

  linkCard = asyncHandler(async (req, res) => {
    const { matricule, idCarte } = req.body;
    await authService.linkCardToAccount(matricule, idCarte);
    res.status(200).json({ 
      message: 'Un email de confirmation a été envoyé. Veuillez vérifier votre boîte de réception pour valider l\'association de votre carte.' 
    });
  });
}

module.exports = new AuthController();