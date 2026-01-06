// backend/src/controllers/etudiant.controller.js

const etudiantService = require('../services/etudiant.service');
const asyncHandler = require('../utils/asyncHandler');
const ResponseFormatter = require('../utils/ResponseFormatter');

class EtudiantController {
  findAll = asyncHandler(async (req, res) => {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 50,
      search: req.query.search || '',
      classeId: req.query.classeId || null,
      estActif: req.query.estActif !== undefined ? req.query.estActif === 'true' : null,
      orderBy: req.query.orderBy || 'createdAt',
      orderDirection: req.query.orderDirection || 'DESC'
    };

    const result = await etudiantService.findAll(options);
    
    // Format uniforme pour cohérence avec les autres endpoints
    return ResponseFormatter.successWithPagination(res, result.etudiants, result.pagination, 'Étudiants récupérés avec succès', 'etudiants');
  });

  findOne = asyncHandler(async (req, res) => {
    const etudiant = await etudiantService.findOne(req.params.id);
    return ResponseFormatter.success(res, etudiant, 'Étudiant récupéré avec succès');
  });

  create = asyncHandler(async (req, res) => {
    const etudiant = await etudiantService.create(req.body);
    return ResponseFormatter.created(res, etudiant, 'Étudiant créé avec succès');
  });

  update = asyncHandler(async (req, res) => {
    const etudiant = await etudiantService.update(req.params.id, req.body);
    return ResponseFormatter.success(res, etudiant, 'Étudiant mis à jour avec succès');
  });

  delete = asyncHandler(async (req, res) => {
    await etudiantService.delete(req.params.id);
    return ResponseFormatter.deleted(res, 'Étudiant supprimé avec succès');
  });

  toggleStatus = asyncHandler(async (req, res) => {
    const etudiant = await etudiantService.toggleStatus(req.params.id);
    return ResponseFormatter.success(res, etudiant, 'Statut de l\'étudiant modifié avec succès');
  });

  changeClasse = asyncHandler(async (req, res) => {
    const { classeId } = req.body;
    const etudiant = await etudiantService.changeClasse(req.params.id, classeId);
    return ResponseFormatter.success(res, etudiant, 'Classe de l\'étudiant modifiée avec succès');
  });

  findByClasse = asyncHandler(async (req, res) => {
    const etudiants = await etudiantService.findByClasse(req.params.classeId);
    return ResponseFormatter.success(res, etudiants, 'Étudiants de la classe récupérés avec succès');
  });
}

module.exports = new EtudiantController();
