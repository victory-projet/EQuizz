// backend/src/controllers/enseignant.controller.js

const enseignantService = require('../services/enseignant.service');
const asyncHandler = require('../utils/asyncHandler');

class EnseignantController {
  findAll = asyncHandler(async (req, res) => {
    const enseignants = await enseignantService.findAll();
    res.status(200).json(enseignants);
  });

  findOne = asyncHandler(async (req, res) => {
    const enseignant = await enseignantService.findOne(req.params.id);
    res.status(200).json(enseignant);
  });

  create = asyncHandler(async (req, res) => {
    const enseignant = await enseignantService.create(req.body);
    res.status(201).json(enseignant);
  });

  update = asyncHandler(async (req, res) => {
    const enseignant = await enseignantService.update(req.params.id, req.body);
    res.status(200).json(enseignant);
  });

  delete = asyncHandler(async (req, res) => {
    await enseignantService.delete(req.params.id);
    res.status(200).json({ message: 'Enseignant supprimé avec succès' });
  });
}

module.exports = new EnseignantController();
