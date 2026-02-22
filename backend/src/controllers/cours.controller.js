// backend/src/controllers/cours.controller.js

const coursService = require('../services/cours.service');
const asyncHandler = require('../utils/asyncHandler');

class CoursController {
  create = asyncHandler(async (req, res) => {
    const cours = await coursService.create(req.body);
    res.status(201).json(cours);
  });

  findAll = asyncHandler(async (req, res) => {
    const includeArchived = req.query.includeArchived === 'true';
    const coursList = await coursService.findAll(includeArchived);
    res.status(200).json(coursList);
  });

  findOne = asyncHandler(async (req, res) => {
    const cours = await coursService.findOne(req.params.id);
    res.status(200).json(cours);
  });

  update = asyncHandler(async (req, res) => {
    const updatedCours = await coursService.update(req.params.id, req.body);
    res.status(200).json(updatedCours);
  });

  delete = asyncHandler(async (req, res) => {
    const result = await coursService.delete(req.params.id);
    res.status(200).json(result);
  });

  // --- Endpoints d'archivage ---

  archive = asyncHandler(async (req, res) => {
    const cours = await coursService.archive(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Cours archivé avec succès',
      data: cours
    });
  });

  restore = asyncHandler(async (req, res) => {
    const cours = await coursService.restore(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Cours restauré avec succès',
      data: cours
    });
  });
}

module.exports = new CoursController();