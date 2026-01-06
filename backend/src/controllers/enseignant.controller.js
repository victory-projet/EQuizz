const { Utilisateur, Cours, CoursEnseignant } = require('../models');
const { Op } = require('sequelize');
const ResponseFormatter = require('../utils/ResponseFormatter');

// Récupérer tous les enseignants
exports.getAllEnseignants = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      estActif: true
    };

    // Filtrer par email contenant "enseignant" ou par des critères spécifiques
    if (search) {
      whereClause[Op.or] = [
        { nom: { [Op.like]: `%${search}%` } },
        { prenom: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    // Pour identifier les enseignants, on peut utiliser des critères comme:
    // - Email contenant certains mots-clés
    // - Ou tous les utilisateurs actifs pour le moment
    const { count, rows: enseignants } = await Utilisateur.findAndCountAll({
      where: whereClause,
      attributes: ['id', 'nom', 'prenom', 'email', 'estActif', 'created_at'],
      order: [['nom', 'ASC'], ['prenom', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Format compatible avec le frontend Angular
    return ResponseFormatter.compatibilityFormat(res, enseignants, {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit)
    }, 'enseignants');
  } catch (error) {
    console.error('Erreur lors de la récupération des enseignants:', error);
    return ResponseFormatter.error(res, 'Erreur lors de la récupération des enseignants', 500);
  }
};

// Récupérer un enseignant par ID
exports.getEnseignantById = async (req, res) => {
  try {
    const { id } = req.params;

    const enseignant = await Utilisateur.findOne({
      where: { id },
      attributes: ['id', 'nom', 'prenom', 'email', 'estActif', 'createdAt'],
      include: [{
        model: Enseignant,
        required: true, // Assure qu'on récupère seulement les utilisateurs qui sont des enseignants
        include: [{
          model: CoursEnseignant,
          include: [{
            model: Cours,
            attributes: ['id', 'nom', 'code', 'description']
          }]
        }]
      }]
    });

    if (!enseignant) {
      return ResponseFormatter.notFound(res, 'Enseignant');
    }

    return ResponseFormatter.success(res, enseignant, 'Enseignant récupéré avec succès');
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'enseignant:', error);
    return ResponseFormatter.error(res, 'Erreur lors de la récupération de l\'enseignant', 500);
  }
};

// Créer un nouvel enseignant
exports.createEnseignant = async (req, res) => {
  try {
    const { nom, prenom, email, matricule, motDePasse } = req.body;

    // Validation des données
    if (!nom || !prenom || !email) {
      return ResponseFormatter.validationError(res, [
        { field: 'nom', message: 'Le nom est requis' },
        { field: 'prenom', message: 'Le prénom est requis' },
        { field: 'email', message: 'L\'email est requis' }
      ]);
    }

    // Vérifier si l'email existe déjà
    const existingUser = await Utilisateur.findOne({ where: { email } });
    if (existingUser) {
      return ResponseFormatter.validationError(res, [
        { field: 'email', message: 'Un utilisateur avec cet email existe déjà' }
      ]);
    }

    // Vérifier si le matricule existe déjà (s'il est fourni)
    if (matricule) {
      const existingMatricule = await Enseignant.findOne({ where: { matricule } });
      if (existingMatricule) {
        return ResponseFormatter.validationError(res, [
          { field: 'matricule', message: 'Un enseignant avec ce matricule existe déjà' }
        ]);
      }
    }

    // Créer l'utilisateur
    const utilisateur = await Utilisateur.create({
      nom,
      prenom,
      email,
      motDePasseHash: motDePasse || 'password123', // Mot de passe par défaut
      estActif: true
    });

    // Créer l'entrée enseignant
    await Enseignant.create({
      id: utilisateur.id,
      matricule: matricule || `ENS${Date.now()}`
    });

    // Récupérer l'enseignant complet
    const enseignantComplet = await Utilisateur.findByPk(utilisateur.id, {
      include: [{ model: Enseignant }]
    });

    // Retourner l'enseignant sans le mot de passe
    const { motDePasseHash, ...enseignantData } = enseignantComplet.toJSON();

    return ResponseFormatter.created(res, enseignantData, 'Enseignant créé avec succès');
  } catch (error) {
    console.error('Erreur lors de la création de l\'enseignant:', error);
    return ResponseFormatter.error(res, 'Erreur lors de la création de l\'enseignant', 500);
  }
};

// Mettre à jour un enseignant
exports.updateEnseignant = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, prenom, email, matricule, actif } = req.body;

    const utilisateur = await Utilisateur.findOne({
      where: { id },
      include: [{ model: Enseignant, required: true }]
    });

    if (!utilisateur) {
      return ResponseFormatter.notFound(res, 'Enseignant');
    }

    // Vérifier si l'email existe déjà (pour un autre utilisateur)
    if (email && email !== utilisateur.email) {
      const existingUser = await Utilisateur.findOne({ 
        where: { 
          email,
          id: { [Op.ne]: id }
        }
      });
      if (existingUser) {
        return ResponseFormatter.validationError(res, [
          { field: 'email', message: 'Un utilisateur avec cet email existe déjà' }
        ]);
      }
    }

    // Vérifier si le matricule existe déjà (pour un autre enseignant)
    if (matricule && matricule !== utilisateur.Enseignant.matricule) {
      const existingMatricule = await Enseignant.findOne({ 
        where: { 
          matricule,
          id: { [Op.ne]: id }
        }
      });
      if (existingMatricule) {
        return ResponseFormatter.validationError(res, [
          { field: 'matricule', message: 'Un enseignant avec ce matricule existe déjà' }
        ]);
      }
    }

    // Mettre à jour l'utilisateur
    await utilisateur.update({
      nom: nom || utilisateur.nom,
      prenom: prenom || utilisateur.prenom,
      email: email || utilisateur.email,
      estActif: actif !== undefined ? actif : utilisateur.estActif
    });

    // Mettre à jour l'enseignant
    if (matricule) {
      await utilisateur.Enseignant.update({ matricule });
    }

    // Récupérer l'enseignant mis à jour
    const updatedEnseignant = await Utilisateur.findByPk(id, {
      include: [{ model: Enseignant }]
    });

    // Retourner l'enseignant sans le mot de passe
    const { motDePasseHash, ...enseignantData } = updatedEnseignant.toJSON();

    return ResponseFormatter.success(res, enseignantData, 'Enseignant mis à jour avec succès');
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'enseignant:', error);
    return ResponseFormatter.error(res, 'Erreur lors de la mise à jour de l\'enseignant', 500);
  }
};

// Supprimer un enseignant (désactivation)
exports.deleteEnseignant = async (req, res) => {
  try {
    const { id } = req.params;

    const utilisateur = await Utilisateur.findOne({
      where: { id },
      include: [{ model: Enseignant, required: true }]
    });

    if (!utilisateur) {
      return ResponseFormatter.notFound(res, 'Enseignant');
    }

    // Désactiver au lieu de supprimer
    await utilisateur.update({ estActif: false });

    return ResponseFormatter.success(res, null, 'Enseignant désactivé avec succès');
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'enseignant:', error);
    return ResponseFormatter.error(res, 'Erreur lors de la suppression de l\'enseignant', 500);
  }
};

// Récupérer les cours d'un enseignant
exports.getCoursEnseignant = async (req, res) => {
  try {
    const { id } = req.params;

    const utilisateur = await Utilisateur.findOne({
      where: { id },
      include: [{ model: Enseignant, required: true }]
    });

    if (!utilisateur) {
      return ResponseFormatter.notFound(res, 'Enseignant');
    }

    const coursEnseignant = await CoursEnseignant.findAll({
      where: { utilisateur_id: id },
      include: [{
        model: Cours,
        attributes: ['id', 'nom', 'code', 'description', 'credits']
      }]
    });

    const cours = coursEnseignant.map(ce => ce.Cours);

    return ResponseFormatter.success(res, { cours }, 'Cours de l\'enseignant récupérés avec succès');
  } catch (error) {
    console.error('Erreur lors de la récupération des cours de l\'enseignant:', error);
    return ResponseFormatter.error(res, 'Erreur lors de la récupération des cours de l\'enseignant', 500);
  }
};