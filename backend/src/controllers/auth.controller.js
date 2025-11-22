const authService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');
const db = require('../models');

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

  // Obtenir l'utilisateur connecté
  getCurrentUser = asyncHandler(async (req, res) => {
    const utilisateur = req.user; // Défini par le middleware authenticate
    
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
    
    res.status(200).json({
      id: utilisateur.id,
      nom: utilisateur.nom,
      prenom: utilisateur.prenom,
      email: utilisateur.email,
      role,
      estActif: true,
      createdAt: utilisateur.createdAt,
      updatedAt: utilisateur.updatedAt,
      ...additionalInfo
    });
  });

  // Déconnexion
  logout = asyncHandler(async (req, res) => {
    // Pour l'instant, la déconnexion est gérée côté client
    // On pourrait ajouter une blacklist de tokens ici si nécessaire
    res.status(200).json({ 
      message: 'Déconnexion réussie' 
    });
  });

  // Mettre à jour le profil
  updateProfile = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { nom, prenom, email } = req.body;
    
    const utilisateur = await db.Utilisateur.findByPk(userId);
    if (!utilisateur) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    await utilisateur.update({ nom, prenom, email });
    
    res.status(200).json({
      id: utilisateur.id,
      nom: utilisateur.nom,
      prenom: utilisateur.prenom,
      email: utilisateur.email,
      role: req.user.role,
      estActif: utilisateur.estActif
    });
  });

  // Changer le mot de passe
  changePassword = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    
    const utilisateur = await db.Utilisateur.findByPk(userId);
    if (!utilisateur) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Vérifier le mot de passe actuel
    const isMatch = await utilisateur.isPasswordMatch(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: 'Mot de passe actuel incorrect' });
    }

    // Mettre à jour le mot de passe
    utilisateur.motDePasseHash = newPassword;
    await utilisateur.save();
    
    res.status(200).json({ message: 'Mot de passe modifié avec succès' });
  });

  // Rafraîchir le token
  refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ 
        error: 'Refresh token manquant' 
      });
    }

    // Pour l'instant, on génère simplement un nouveau token
    // Dans une vraie application, on vérifierait le refresh token
    const jwtService = require('../services/jwt.service');
    
    try {
      // Vérifier le token
      const decoded = jwtService.verifyToken(refreshToken);
      
      // Générer un nouveau token
      const newToken = jwtService.generateToken({ 
        id: decoded.id, 
        email: decoded.email 
      });
      
      res.status(200).json({ 
        token: newToken 
      });
    } catch (error) {
      res.status(401).json({ 
        error: 'Refresh token invalide ou expiré' 
      });
    }
  });
}

module.exports = new AuthController();