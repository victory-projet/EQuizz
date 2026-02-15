// backend/src/controllers/etudiant.controller.js

const etudiantService = require('../services/etudiant.service');
const etudiantImportService = require('../services/etudiant-import.service');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

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

  getHistorique = asyncHandler(async (req, res) => {
    const historique = await etudiantService.getHistorique(req.params.id);
    res.status(200).json(historique);
  });

  transferer = asyncHandler(async (req, res) => {
    const { nouvelleClasseId, dateTransfert } = req.body;
    const resultat = await etudiantService.transferer(
      req.params.id, 
      nouvelleClasseId, 
      dateTransfert ? new Date(dateTransfert) : undefined
    );
    res.status(200).json(resultat);
  });

  importFromExcel = asyncHandler(async (req, res) => {
    if (!req.file) {
      throw AppError.badRequest('Aucun fichier fourni.', 'FILE_REQUIRED');
    }

    const defaultClasseId = req.body.classeId || null;
    const result = await etudiantImportService.importFromExcel(req.file.buffer, defaultClasseId);

    res.status(200).json({
      message: `Import terminé: ${result.stats.created} créé(s), ${result.stats.updated} mis à jour, ${result.stats.errors} erreur(s)`,
      ...result
    });
  });

  validateExcel = asyncHandler(async (req, res) => {
    if (!req.file) {
      throw AppError.badRequest('Aucun fichier fourni.', 'FILE_REQUIRED');
    }

    const defaultClasseId = req.body.classeId || null;
    const validations = await etudiantImportService.validateExcel(req.file.buffer, defaultClasseId);

    res.status(200).json({
      message: `Validation: ${validations.valid.length} ligne(s) valide(s), ${validations.errors.length} erreur(s)`,
      ...validations
    });
  });
}

module.exports = new EtudiantController();
