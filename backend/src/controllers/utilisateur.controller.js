const { Utilisateur, Superadministrateur, Administrateur, Enseignant, Etudiant, Ecole, Classe } = require('../models');
const bcrypt = require('bcryptjs');
const emailService = require('../services/email.service');

// Récupérer tous les utilisateurs avec leurs rôles
exports.getAllUtilisateurs = async (req, res) => {
  try {
    // Déterminer si l'utilisateur connecté est un admin (pas super-admin)
    const isAdmin = req.user && req.user.role === 'admin';
    const ecoleId = isAdmin
      ? (req.user.Administrateur?.ecole_id || req.user.Administrateur?.dataValues?.ecole_id)
      : null;

    // Pour les étudiants, filtrer par école via la classe si admin
    const etudiantInclude = {
      model: Etudiant,
      as: 'Etudiant',
      ...(ecoleId ? {
        required: false,
        include: [{
          model: Classe,
          as: 'Classe',
          where: { ecole_id: ecoleId },
          required: true
        }]
      } : {})
    };

    const utilisateurs = await Utilisateur.findAll({
      include: [
        { model: Superadministrateur, as: 'Superadministrateur' },
        { 
          model: Administrateur,
          as: 'Administrateur',
          include: [{ model: Ecole, as: 'Ecole' }]
        },
        { model: Enseignant, as: 'Enseignant' },
        etudiantInclude
      ],
      order: [['created_at', 'DESC']]
    });

    // Ajouter le rôle à chaque utilisateur
    let utilisateursAvecRole = utilisateurs.map(user => {
      const userData = user.toJSON();
      if (userData.Superadministrateur) {
        userData.role = 'SUPER-ADMIN';
      } else if (userData.Administrateur) {
        userData.role = 'ADMIN';
        userData.ecole = userData.Administrateur.Ecole;
      } else if (userData.Enseignant) {
        userData.role = 'ENSEIGNANT';
      } else if (userData.Etudiant) {
        userData.role = 'ETUDIANT';
        userData.matricule = userData.Etudiant.matricule;
      }
      return userData;
    });

    // Si admin, exclure les étudiants qui n'appartiennent pas à son école
    if (ecoleId) {
      utilisateursAvecRole = utilisateursAvecRole.filter(u => {
        if (u.role === 'ETUDIANT') {
          return u.Etudiant?.Classe != null;
        }
        return true;
      });
    }

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
        { model: Superadministrateur, as: 'Superadministrateur' },
        { 
          model: Administrateur,
          as: 'Administrateur',
          include: [{ model: Ecole, as: 'Ecole' }]
        },
        { model: Enseignant, as: 'Enseignant' },
        { model: Etudiant, as: 'Etudiant' }
      ]
    });

    if (!utilisateur) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const userData = utilisateur.toJSON();
    if (userData.Superadministrateur) {
      userData.role = 'SUPER-ADMIN';
    } else if (userData.Administrateur) {
      userData.role = 'ADMIN';
      userData.ecole = userData.Administrateur.Ecole;
    } else if (userData.Enseignant) {
      userData.role = 'ENSEIGNANT';
    } else if (userData.Etudiant) {
      userData.role = 'ETUDIANT';
      userData.matricule = userData.Etudiant.matricule;
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
    const { nom, prenom, email, motDePasse, role, specialite, matricule, ecoleId } = req.body;
    console.log('📝 createUtilisateur body:', { nom, prenom, email, role, ecoleId, hasMotDePasse: !!motDePasse, matricule });

    // Vérifier si l'email existe déjà
    const existingUser = await Utilisateur.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Pour les étudiants, le mot de passe est null (sera défini lors du claim account)
    // Pour les admins et enseignants, le mot de passe est requis ou généré automatiquement
    let motDePasseHash = null;
    if (role === 'ETUDIANT') {
      motDePasseHash = null;
    } else if (role === 'ENSEIGNANT') {
      // Générer un mot de passe temporaire si non fourni
      motDePasseHash = motDePasse || (Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8));
    } else {
      // ADMIN et SUPER-ADMIN doivent avoir un mot de passe
      if (!motDePasse) {
        return res.status(400).json({ message: 'Le mot de passe est requis pour les administrateurs' });
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
    if (role === 'SUPER-ADMIN') {
      await Superadministrateur.create({ id: utilisateur.id });
    } else if (role === 'ADMIN') {
      if (!ecoleId || ecoleId === 'null' || ecoleId === 'undefined') {
        await utilisateur.destroy();
        return res.status(400).json({ message: 'L\'ID de l\'école est requis pour un administrateur' });
      }
      await Administrateur.create({
        id: utilisateur.id,
        ecole_id: ecoleId
      });
    } else if (role === 'ENSEIGNANT') {
      await Enseignant.create({
        id: utilisateur.id,
        specialite: specialite || null
      });
    } else if (role === 'ETUDIANT') {
      // Générer un matricule unique si non fourni
      let finalMatricule = matricule;
      if (!finalMatricule) {
        const year = new Date().getFullYear();
        const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        finalMatricule = `${year}${randomNum}`;
      }

      // Vérifier si le matricule existe déjà
      const existingMatricule = await Etudiant.findOne({ where: { matricule: finalMatricule } });
      if (existingMatricule) {
        await utilisateur.destroy();
        return res.status(400).json({ message: 'Ce matricule est déjà utilisé' });
      }

      // matriculeUniv = même valeur que matricule si non fourni séparément
      await Etudiant.create({
        id: utilisateur.id,
        matricule: finalMatricule,
        matriculeUniv: finalMatricule
      });
    }

    // Récupérer l'utilisateur complet avec son rôle
    const utilisateurComplet = await Utilisateur.findByPk(utilisateur.id, {
      include: [
        { model: Superadministrateur, as: 'Superadministrateur' },
        { 
          model: Administrateur,
          as: 'Administrateur',
          include: [{ model: Ecole, as: 'Ecole' }]
        },
        { model: Enseignant, as: 'Enseignant' },
        { model: Etudiant, as: 'Etudiant' }
      ]
    });

    const userData = utilisateurComplet.toJSON();
    userData.role = role;
    if (role === 'ADMIN' && userData.Administrateur) {
      userData.ecole = userData.Administrateur.Ecole;
    } else if (role === 'ETUDIANT' && userData.Etudiant) {
      userData.matricule = userData.Etudiant.matricule;
    }

    // Envoyer un email de bienvenue si c'est un admin ou enseignant avec mot de passe
    if ((role === 'SUPER-ADMIN' || role === 'ADMIN' || role === 'ENSEIGNANT') && motDePasse) {
      try {
        await emailService.sendWelcomeEmail(userData, motDePasse);
      } catch (emailError) {
        console.warn('⚠️ L\'utilisateur a été créé mais l\'email n\'a pas pu être envoyé:', emailError.message);
        // Ne pas faire échouer la création de l'utilisateur si l'email échoue
      }
    }

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
    const { nom, prenom, email, estActif, specialite, adminType, ecoleId } = req.body;

    const utilisateur = await Utilisateur.findByPk(id, {
      include: [
        { model: Superadministrateur, as: 'Superadministrateur' },
        { 
          model: Administrateur,
          as: 'Administrateur',
          include: [{ model: Ecole, as: 'Ecole' }]
        },
        { model: Enseignant, as: 'Enseignant' },
        { model: Etudiant, as: 'Etudiant' }
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
    if (utilisateur.Enseignant && specialite !== undefined) {
      await utilisateur.Enseignant.update({ specialite });
    }

    // Mettre à jour le type et école de l'admin si c'est un administrateur
    if (utilisateur.Administrateur) {
      const updateData = {};
      if (adminType !== undefined) {
        updateData.type = adminType;
      }
      if (ecoleId !== undefined) {
        updateData.ecole_id = ecoleId;
      }
      if (Object.keys(updateData).length > 0) {
        await utilisateur.Administrateur.update(updateData);
      }
    }

    // Récupérer l'utilisateur mis à jour
    const utilisateurMisAJour = await Utilisateur.findByPk(id, {
      include: [
        { model: Superadministrateur, as: 'Superadministrateur' },
        { 
          model: Administrateur,
          as: 'Administrateur',
          include: [{ model: Ecole, as: 'Ecole' }]
        },
        { model: Enseignant, as: 'Enseignant' },
        { model: Etudiant, as: 'Etudiant' }
      ]
    });

    const userData = utilisateurMisAJour.toJSON();
    if (userData.Superadministrateur) {
      userData.role = 'SUPER-ADMIN';
    } else if (userData.Administrateur) {
      userData.role = 'ADMIN';
      userData.ecole = userData.Administrateur.Ecole;
    } else if (userData.Enseignant) {
      userData.role = 'ENSEIGNANT';
    } else if (userData.Etudiant) {
      userData.role = 'ETUDIANT';
      userData.matricule = userData.Etudiant.matricule;
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

    // Envoyer un email avec le nouveau mot de passe
    const userData = utilisateur.toJSON();
    await emailService.sendPasswordResetEmail(userData, nouveauMotDePasse);

    res.json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Importer des utilisateurs depuis un fichier Excel
exports.importUtilisateurs = async (req, res) => {
  try {
    const { users } = req.body;

    if (!users || !Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ message: 'Aucun utilisateur à importer' });
    }

    let imported = 0;
    const errors = [];

    for (let i = 0; i < users.length; i++) {
      const userData = users[i];

      try {
        // Validation des données requises
        if (!userData.nom || !userData.prenom || !userData.email) {
          errors.push(`Ligne ${i + 1}: Nom, prénom et email sont requis`);
          continue;
        }

        // Vérifier si l'email existe déjà
        const existingUser = await Utilisateur.findOne({ where: { email: userData.email } });
        if (existingUser) {
          errors.push(`Ligne ${i + 1}: L'email ${userData.email} existe déjà`);
          continue;
        }

        // Déterminer le rôle (par défaut ETUDIANT)
        const role = userData.type?.toUpperCase() || 'ETUDIANT';
        if (!['SUPER-ADMIN', 'ADMIN', 'ENSEIGNANT', 'ETUDIANT'].includes(role)) {
          errors.push(`Ligne ${i + 1}: Rôle invalide "${userData.type}"`);
          continue;
        }

        // Générer un mot de passe temporaire pour les admins et enseignants
        let motDePasseHash = null;
        if (role === 'SUPER-ADMIN' || role === 'ENSEIGNANT') {
          motDePasseHash = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
        }

        // Créer l'utilisateur
        const utilisateur = await Utilisateur.create({
          nom: userData.nom.trim(),
          prenom: userData.prenom.trim(),
          email: userData.email.trim().toLowerCase(),
          motDePasseHash: motDePasseHash,
          estActif: true
        });

        // Créer le rôle correspondant
        if (role === 'SUPER-ADMIN') {
          await Superadministrateur.create({ id: utilisateur.id });
        } else if (role === 'ENSEIGNANT') {
          await Enseignant.create({
            id: utilisateur.id,
            specialite: userData.specialite || null
          });
        } else if (role === 'ETUDIANT') {
          // Générer un matricule unique si non fourni
          let matricule = userData.matricule;
          if (!matricule) {
            const year = new Date().getFullYear();
            const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            matricule = `${year}${randomNum}`;
          }

          // Vérifier l'unicité du matricule
          const existingMatricule = await Etudiant.findOne({ where: { matricule } });
          if (existingMatricule) {
            // Générer un nouveau matricule
            const year = new Date().getFullYear();
            const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            matricule = `${year}${randomNum}`;
          }

          await Etudiant.create({
            id: utilisateur.id,
            matricule: matricule,
            matriculeUniv: matricule
          });
        }

        imported++;

        // Envoyer un email de bienvenue si c'est un admin ou enseignant avec mot de passe
        if ((role === 'SUPER-ADMIN' || role === 'ENSEIGNANT') && motDePasseHash) {
          try {
            const userData = utilisateur.toJSON();
            userData.role = role;
            await emailService.sendWelcomeEmail(userData, motDePasseHash);
          } catch (emailError) {
            console.warn(`⚠️ Email non envoyé pour ${userData.email}:`, emailError.message);
            // Ne pas faire échouer l'import si l'email échoue
          }
        }

      } catch (userError) {
        console.error(`Erreur lors de l'import de l'utilisateur ligne ${i + 1}:`, userError);
        errors.push(`Ligne ${i + 1}: ${userError.message}`);
      }
    }

    res.json({
      imported,
      errors,
      message: `${imported} utilisateur(s) importé(s) avec succès${errors.length > 0 ? `, ${errors.length} erreur(s)` : ''}`
    });

  } catch (error) {
    console.error('Erreur lors de l\'import des utilisateurs:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'import' });
  }
};
