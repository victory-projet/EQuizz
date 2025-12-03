const { Utilisateur, Administrateur, Enseignant, Etudiant } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const bcrypt = require('bcryptjs');
const utilisateurRepository = require('../repositories/utilisateur.repository');

class UtilisateurController {
  // Récupérer tous les utilisateurs
  getAllUtilisateurs = asyncHandler(async (req, res) => {
    const utilisateurs = await Utilisateur.findAll({
      attributes: { exclude: ['motDePasse'] },
      include: [
        { model: Administrateur, required: false },
        { model: Enseignant, required: false },
        { model: Etudiant, required: false }
      ]
    });

    res.status(200).json({
      success: true,
      count: utilisateurs.length,
      data: utilisateurs
    });
  });

  // Récupérer un utilisateur par ID
  getUtilisateurById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const utilisateur = await Utilisateur.findByPk(id, {
      attributes: { exclude: ['motDePasse'] },
      include: [
        { model: Administrateur, required: false },
        { model: Enseignant, required: false },
        { model: Etudiant, required: false }
      ]
    });

    if (!utilisateur) {
      const error = new Error('Utilisateur non trouvé');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      data: utilisateur
    });
  });

  // Créer un nouvel utilisateur
  createUtilisateur = asyncHandler(async (req, res) => {
    const { nom, prenom, email, motDePasse, role } = req.body;

    // Valider les champs requis
    if (!nom || !prenom || !email || !motDePasse || !role) {
      const error = new Error('Tous les champs requis doivent être remplis');
      error.statusCode = 400;
      throw error;
    }

    // Vérifier si l'email existe déjà
    const existingUtilisateur = await Utilisateur.findOne({ where: { email } });
    if (existingUtilisateur) {
      const error = new Error('Cet email est déjà utilisé');
      error.statusCode = 409;
      throw error;
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(motDePasse, 10);

    // Créer l'utilisateur
    const utilisateur = await Utilisateur.create({
      nom,
      prenom,
      email,
      motDePasse: hashedPassword,
      estActif: true
    });

    // Créer l'enregistrement correspondant au rôle
    if (role === 'ADMIN') {
      await Administrateur.create({ utilisateurId: utilisateur.id });
    } else if (role === 'ENSEIGNANT') {
      const { specialite } = req.body;
      if (!specialite) {
        const error = new Error('La spécialité est requise pour un enseignant');
        error.statusCode = 400;
        throw error;
      }
      await Enseignant.create({ utilisateurId: utilisateur.id, specialite });
    } else if (role === 'ETUDIANT') {
      const { matricule, classeId } = req.body;
      if (!matricule || !classeId) {
        const error = new Error('Le matricule et la classe sont requis pour un étudiant');
        error.statusCode = 400;
        throw error;
      }
      await Etudiant.create({
        utilisateurId: utilisateur.id,
        matricule,
        classeId
      });
    } else {
      const error = new Error('Rôle invalide');
      error.statusCode = 400;
      throw error;
    }

    // Récupérer l'utilisateur créé avec ses associations
    const nouvelUtilisateur = await Utilisateur.findByPk(utilisateur.id, {
      attributes: { exclude: ['motDePasse'] },
      include: [
        { model: Administrateur, required: false },
        { model: Enseignant, required: false },
        { model: Etudiant, required: false }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      data: nouvelUtilisateur
    });
  });

  // Mettre à jour un utilisateur
  updateUtilisateur = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { nom, prenom, email, estActif } = req.body;

    const utilisateur = await Utilisateur.findByPk(id);

    if (!utilisateur) {
      const error = new Error('Utilisateur non trouvé');
      error.statusCode = 404;
      throw error;
    }

    // Vérifier si le nouvel email n'existe pas déjà
    if (email && email !== utilisateur.email) {
      const existingUtilisateur = await Utilisateur.findOne({ where: { email } });
      if (existingUtilisateur) {
        const error = new Error('Cet email est déjà utilisé');
        error.statusCode = 409;
        throw error;
      }
    }

    // Mettre à jour l'utilisateur
    await utilisateur.update({
      ...(nom && { nom }),
      ...(prenom && { prenom }),
      ...(email && { email }),
      ...(estActif !== undefined && { estActif })
    });

    // Récupérer l'utilisateur mis à jour
    const utilisateurUpdated = await Utilisateur.findByPk(id, {
      attributes: { exclude: ['motDePasse'] },
      include: [
        { model: Administrateur, required: false },
        { model: Enseignant, required: false },
        { model: Etudiant, required: false }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Utilisateur mis à jour avec succès',
      data: utilisateurUpdated
    });
  });

  // Supprimer un utilisateur
  deleteUtilisateur = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const utilisateur = await Utilisateur.findByPk(id);

    if (!utilisateur) {
      const error = new Error('Utilisateur non trouvé');
      error.statusCode = 404;
      throw error;
    }

    // Supprimer les associations avant de supprimer l'utilisateur
    await Administrateur.destroy({ where: { utilisateurId: id } });
    await Enseignant.destroy({ where: { utilisateurId: id } });
    await Etudiant.destroy({ where: { utilisateurId: id } });

    // Supprimer l'utilisateur
    await utilisateur.destroy();

    res.status(200).json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });
  });

  // Réinitialiser le mot de passe
  resetPassword = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { motDePasse } = req.body;

    if (!motDePasse) {
      const error = new Error('Le mot de passe est requis');
      error.statusCode = 400;
      throw error;
    }

    const utilisateur = await Utilisateur.findByPk(id);

    if (!utilisateur) {
      const error = new Error('Utilisateur non trouvé');
      error.statusCode = 404;
      throw error;
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(motDePasse, 10);

    // Mettre à jour le mot de passe
    await utilisateur.update({ motDePasse: hashedPassword });

    res.status(200).json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès'
    });
  });
}

module.exports = new UtilisateurController();
