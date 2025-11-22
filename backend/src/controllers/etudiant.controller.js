// backend/src/controllers/etudiant.controller.js

const etudiantService = require('../services/etudiant.service');
const asyncHandler = require('../utils/asyncHandler');

class EtudiantController {
  findAll = asyncHandler(async (req, res) => {
    const etudiants = await etudiantService.findAll();
    res.status(200).json(etudiants);
  });

  findOne = asyncHandler(async (req, res) => {
    const etudiant = await etudiantService.findOne(req.params.id);
    res.status(200).json(etudiant);
  });

  create = asyncHandler(async (req, res) => {
    const etudiant = await etudiantService.create(req.body);
    res.status(201).json(etudiant);
  });

  update = asyncHandler(async (req, res) => {
    const etudiant = await etudiantService.update(req.params.id, req.body);
    res.status(200).json(etudiant);
  });

  delete = asyncHandler(async (req, res) => {
    await etudiantService.delete(req.params.id);
    res.status(200).json({ message: 'Étudiant supprimé avec succès' });
  });
}

module.exports = new EtudiantController();
