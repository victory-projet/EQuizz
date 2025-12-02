// backend/src/controllers/semestre.controller.js

const semestreService = require('../services/semestre.service');
const asyncHandler = require('../utils/asyncHandler');

class SemestreController {
  create = asyncHandler(async (req, res) => {
    const semestre = await semestreService.create(req.body);
    res.status(201).json(semestre);
  });

  findAllByAnnee = asyncHandler(async (req, res) => {
    const { anneeId } = req.params;
    const semestres = await semestreService.findAllByAnnee(anneeId);
    res.status(200).json(semestres);
  });

  findOne = asyncHandler(async (req, res) => {
    const semestre = await semestreService.findOne(req.params.id);
    res.status(200).json(semestre);
  });

  update = asyncHandler(async (req, res) => {
    const updatedSemestre = await semestreService.update(req.params.id, req.body);
    res.status(200).json(updatedSemestre);
  });

  delete = asyncHandler(async (req, res) => {
    const result = await semestreService.delete(req.params.id);
    res.status(200).json(result);
  });
}

module.exports = new SemestreController();