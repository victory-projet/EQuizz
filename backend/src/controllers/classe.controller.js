// backend/src/controllers/classe.controller.js

const classeService = require('../services/classe.service');
const asyncHandler = require('../utils/asyncHandler');

class ClasseController {
  create = asyncHandler(async (req, res) => {
    const classe = await classeService.create(req.body);
    res.status(201).json(classe);
  });

  findAll = asyncHandler(async (req, res) => {
    const classes = await classeService.findAll();
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
}

module.exports = new ClasseController();