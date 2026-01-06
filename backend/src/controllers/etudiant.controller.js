// backend/src/controllers/etudiant.controller.js

const etudiantService = require('../services/etudiant.service');
const asyncHandler = require('../utils/asyncHandler');

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
    
    res.status(200).json({
      success: true,
      data: result.etudiants,
      pagination: result.pagination
    });
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

  toggleStatus = asyncHandler(async (req, res) => {
    const etudiant = await etudiantService.toggleStatus(req.params.id);
    res.status(200).json(etudiant);
  });

  changeClasse = asyncHandler(async (req, res) => {
    const { classeId } = req.body;
    const etudiant = await etudiantService.changeClasse(req.params.id, classeId);
    res.status(200).json(etudiant);
  });

  findByClasse = asyncHandler(async (req, res) => {
    const etudiants = await etudiantService.findByClasse(req.params.classeId);
    res.status(200).json(etudiants);
  });
}

module.exports = new EtudiantController();
