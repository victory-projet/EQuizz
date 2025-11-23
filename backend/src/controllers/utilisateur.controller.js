const { Utilisateur, Administrateur, Enseignant, Etudiant } = require('../models');
const bcrypt = require('bcryptjs');

// Récupérer tous les utilisateurs avec leurs rôles
exports.getAllUtilisateurs = async (req, res) => {
  try {
    const utilisateurs = await Utilisateur.findAll({
      include: [
        { model: Administrateur, as: 'administrateur' },
        { model: Enseignant, as: 'enseignant' },
        { model: Etudiant, as: 'etudiant' }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Ajouter le rôle à chaque utilisateur
    const utilisateursAvecRole = utilisateurs.map(user => {
      const userData = user.toJSON();
      if (userData.administrateur) {
        userData.role = 'ADMIN';
      } else if (userData.enseignant) {
        userData.role = 'ENSEIGNANT';
      } else if (userData.etudiant) {
        userData.role = 'ETUDIANT';
      }
      return userData;
    });

    res.json(utilisateursAvecRole);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer un utilisateur par ID
exports.getUtilisateurById = async (req, res) => {
  try {
    const { id } = req.params;
    const utilisateur = await Utilisateur.findByPk(id, {
      include: [
        { model: Administrateur, as: 'administrateur' },
        { model: Enseignant, as: 'enseignant' },
        { model: Etudiant, as: 'etudiant' }
      ]
    });

    if (!utilisateur) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const userData = utilisateur.toJSON();
    if (userData.administrateur) {
      userData.role = 'ADMIN';
    } else if (userData.enseignant) {
      userData.role = 'ENSEIGNANT';
    } else if (userData.etudiant) {
      userData.role = 'ETUDIANT';
    }

    res.json(userData);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Créer un nouvel utilisateur
exports.createUtilisateur = async (req, res) => {
  try {
    const { nom, prenom, email, motDePasse, role, specialite, matricule } = req.body;

    // Vérifier si l'email existe déjà
    const existingUser = await Utilisateur.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Pour les étudiants, le mot de passe est null (sera défini lors du claim account)
    // Pour les admins et enseignants, le mot de passe est requis
    let motDePasseHash = null;
    if (role === 'ETUDIANT') {
      // Les étudiants n'ont pas de mot de passe à la création
      motDePasseHash = null;
    } else {
      // Admin et Enseignant doivent avoir un mot de passe
      if (!motDePasse) {
        return res.status(400).json({ message: 'Le mot de passe est requis pour les administrateurs et enseignants' });
      }
      motDePasseHash = motDePasse;
    }

    // Créer l'utilisateur
    const utilisateur = await Utilisateur.create({
      nom,
      prenom,
      email,
      motDePasseHash: motDePasseHash,
      estActif: true
    });

    // Créer le rôle correspondant
    if (role === 'ADMIN') {
      await Administrateur.create({ id: utilisateur.id });
    } else if (role === 'ENSEIGNANT') {
      await Enseignant.create({ 
        id: utilisateur.id,
        specialite: specialite || null
      });
    } else if (role === 'ETUDIANT') {
      if (!matricule) {
        return res.status(400).json({ message: 'Le matricule est requis pour un étudiant' });
      }
      
      // Vérifier si le matricule existe déjà
      const existingMatricule = await Etudiant.findOne({ where: { matricule } });
      if (existingMatricule) {
        await utilisateur.destroy();
        return res.status(400).json({ message: 'Ce matricule est déjà utilisé' });
      }
      
      await Etudiant.create({ 
        id: utilisateur.id,
        matricule
      });
    }

    // Récupérer l'utilisateur complet avec son rôle
    const utilisateurComplet = await Utilisateur.findByPk(utilisateur.id, {
      include: [
        { model: Administrateur, as: 'administrateur' },
        { model: Enseignant, as: 'enseignant' },
        { model: Etudiant, as: 'etudiant' }
      ]
    });

    const userData = utilisateurComplet.toJSON();
    userData.role = role;

    res.status(201).json(userData);
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    res.status(500).json({ message: error.message || 'Erreur serveur' });
  }
};

// Mettre à jour un utilisateur
exports.updateUtilisateur = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, prenom, email, estActif, specialite } = req.body;

    const utilisateur = await Utilisateur.findByPk(id, {
      include: [
        { model: Administrateur, as: 'administrateur' },
        { model: Enseignant, as: 'enseignant' },
        { model: Etudiant, as: 'etudiant' }
      ]
    });

    if (!utilisateur) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Mettre à jour les informations de base
    await utilisateur.update({
      nom: nom || utilisateur.nom,
      prenom: prenom || utilisateur.prenom,
      email: email || utilisateur.email,
      estActif: estActif !== undefined ? estActif : utilisateur.estActif
    });

    // Mettre à jour la spécialité si c'est un enseignant
    if (utilisateur.enseignant && specialite !== undefined) {
      await utilisateur.enseignant.update({ specialite });
    }

    // Récupérer l'utilisateur mis à jour
    const utilisateurMisAJour = await Utilisateur.findByPk(id, {
      include: [
        { model: Administrateur, as: 'administrateur' },
        { model: Enseignant, as: 'enseignant' },
        { model: Etudiant, as: 'etudiant' }
      ]
    });

    const userData = utilisateurMisAJour.toJSON();
    if (userData.administrateur) {
      userData.role = 'ADMIN';
    } else if (userData.enseignant) {
      userData.role = 'ENSEIGNANT';
    } else if (userData.etudiant) {
      userData.role = 'ETUDIANT';
    }

    res.json(userData);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    res.status(500).json({ message: error.message || 'Erreur serveur' });
  }
};

// Supprimer un utilisateur
exports.deleteUtilisateur = async (req, res) => {
  try {
    const { id } = req.params;

    const utilisateur = await Utilisateur.findByPk(id);
    if (!utilisateur) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    await utilisateur.destroy();
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Réinitialiser le mot de passe d'un utilisateur
exports.resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { nouveauMotDePasse } = req.body;

    if (!nouveauMotDePasse) {
      return res.status(400).json({ message: 'Le nouveau mot de passe est requis' });
    }

    const utilisateur = await Utilisateur.findByPk(id);
    if (!utilisateur) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    await utilisateur.update({ motDePasseHash: nouveauMotDePasse });
    res.json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
