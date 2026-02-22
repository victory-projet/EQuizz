// backend/src/controllers/classe.controller.js

const classeService = require('../services/classe.service');
const asyncHandler = require('../utils/asyncHandler');

class ClasseController {
  create = asyncHandler(async (req, res) => {
    const classe = await classeService.create(req.body);
    res.status(201).json(classe);
  });

  findAll = asyncHandler(async (req, res) => {
    const includeArchived = req.query.includeArchived === 'true';
    const classes = await classeService.findAll(includeArchived);
    res.status(200).json(classes);
  });

  findOne = asyncHandler(async (req, res) => {
    const classe = await classeService.findOne(req.params.id);
    res.status(200).json(classe);
  });

  update = asyncHandler(async (req, res) => {
    const updatedClasse = await classeService.update(req.params.id, req.body);
    res.status(200).json(updatedClasse);
  });

  delete = asyncHandler(async (req, res) => {
    const result = await classeService.delete(req.params.id);
    res.status(200).json(result);
  });

  addCoursToClasse = asyncHandler(async (req, res) => {
    const { classeId, coursId } = req.params;
    const result = await classeService.addCoursToClasse(classeId, coursId);
    res.status(200).json(result);
  });

  removeCoursFromClasse = asyncHandler(async (req, res) => {
    const { classeId, coursId } = req.params;
    const result = await classeService.removeCoursFromClasse(classeId, coursId);
    res.status(200).json(result);
  });

  addEtudiantToClasse = asyncHandler(async (req, res) => {
    const { classeId, etudiantId } = req.params;
    const result = await classeService.addEtudiantToClasse(classeId, etudiantId);
    res.status(200).json(result);
  });

  removeEtudiantFromClasse = asyncHandler(async (req, res) => {
    const { classeId, etudiantId } = req.params;
    const result = await classeService.removeEtudiantFromClasse(classeId, etudiantId);
    res.status(200).json(result);
  });

  // --- Endpoints d'archivage ---

  archive = asyncHandler(async (req, res) => {
    const classe = await classeService.archive(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Classe archivée avec succès',
      data: classe
    });
  });

  restore = asyncHandler(async (req, res) => {
    const classe = await classeService.restore(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Classe restaurée avec succès',
      data: classe
    });
  });
}

module.exports = new ClasseController();