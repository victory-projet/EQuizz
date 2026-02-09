// backend/src/controllers/ecole.controller.js

const ecoleService = require('../services/ecole.service');
const asyncHandler = require('../utils/asyncHandler');

class EcoleController {
  create = asyncHandler(async (req, res) => {
    const ecole = await ecoleService.create(req.body);
    res.status(201).json(ecole);
  });

  findAll = asyncHandler(async (req, res) => {
    const result = await ecoleService.findAll(req.query);
    res.status(200).json(result);
  });

  findOne = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const ecole = await ecoleService.findOne(id);
    res.status(200).json(ecole);
  });

  update = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    const updatedEcole = await ecoleService.update(id, data);
    res.status(200).json(updatedEcole);
  });

  delete = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await ecoleService.delete(id);
    res.status(200).json(result);
  });
}

module.exports = new EcoleController();