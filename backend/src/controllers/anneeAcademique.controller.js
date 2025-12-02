// backend/src/controllers/anneeAcademique.controller.js

const anneeAcademiqueService = require('../services/anneeAcademique.service');
const asyncHandler = require('../utils/asyncHandler');

class AnneeAcademiqueController {
  create = asyncHandler(async (req, res) => {
    const annee = await anneeAcademiqueService.create(req.body);
    res.status(201).json(annee);
  });

  findAll = asyncHandler(async (req, res) => {
    const annees = await anneeAcademiqueService.findAll();
    res.status(200).json(annees);
  });

  findOne = asyncHandler(async (req, res) => {
    const annee = await anneeAcademiqueService.findOne(req.params.id);
    res.status(200).json(annee);
  });

  update = asyncHandler(async (req, res) => {
    const updatedAnnee = await anneeAcademiqueService.update(req.params.id, req.body);
    res.status(200).json(updatedAnnee);
  });

  delete = asyncHandler(async (req, res) => {
    const result = await anneeAcademiqueService.delete(req.params.id);
    res.status(200).json(result);
  });
}

module.exports = new AnneeAcademiqueController();