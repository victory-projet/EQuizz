// backend/src/controllers/import.controller.js

const importService = require('../services/excel-import.service');
const exportService = require('../services/export.service');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

class ImportController {
  /**
   * Télécharge un template Excel pour une entité
   */
  downloadTemplate = asyncHandler(async (req, res) => {
    const { entityType } = req.params;
    
    const validTypes = ['ecoles', 'classes', 'etudiants', 'enseignants', 'cours'];
    if (!validTypes.includes(entityType)) {
      throw new AppError('Type d\'entité invalide', 400);
    }

    const workbook = await importService.generateTemplate(entityType);
    
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=template_${entityType}_${Date.now()}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  });

  /**
   * Importe des écoles depuis Excel
   */
  importEcoles = asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new AppError('Aucun fichier fourni', 400);
    }

    const results = await importService.importEcoles(req.file.buffer);

    res.status(200).json({
      success: true,
      message: 'Import terminé',
      data: results
    });
  });

  /**
   * Importe des classes depuis Excel
   */
  importClasses = asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new AppError('Aucun fichier fourni', 400);
    }

    const results = await importService.importClasses(req.file.buffer);

    res.status(200).json({
      success: true,
      message: 'Import terminé',
      data: results
    });
  });

  /**
   * Importe des étudiants depuis Excel
   */
  importEtudiants = asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new AppError('Aucun fichier fourni', 400);
    }

    const results = await importService.importEtudiants(req.file.buffer);

    res.status(200).json({
      success: true,
      message: 'Import terminé',
      data: results
    });
  });

  /**
   * Importe des enseignants depuis Excel
   */
  importEnseignants = asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new AppError('Aucun fichier fourni', 400);
    }

    const results = await importService.importEnseignants(req.file.buffer);

    res.status(200).json({
      success: true,
      message: 'Import terminé',
      data: results
    });
  });

  /**
   * Importe des cours depuis Excel
   */
  importCours = asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new AppError('Aucun fichier fourni', 400);
    }

    const results = await importService.importCours(req.file.buffer);

    res.status(200).json({
      success: true,
      message: 'Import terminé',
      data: results
    });
  });

  /**
   * Exporte des écoles vers Excel
   */
  exportEcoles = asyncHandler(async (req, res) => {
    const workbook = await exportService.exportEcoles();
    
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=ecoles_${Date.now()}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  });

  /**
   * Exporte des classes vers Excel
   */
  exportClasses = asyncHandler(async (req, res) => {
    const workbook = await exportService.exportClasses();
    
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=classes_${Date.now()}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  });

  /**
   * Exporte des étudiants vers Excel
   */
  exportEtudiants = asyncHandler(async (req, res) => {
    const { classeId } = req.query;

    const workbook = await exportService.exportStudentsList(classeId || null);
    
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=etudiants_${Date.now()}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  });

  /**
   * Exporte des enseignants vers Excel
   */
  exportEnseignants = asyncHandler(async (req, res) => {
    const workbook = await exportService.exportEnseignants();
    
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=enseignants_${Date.now()}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  });

  /**
   * Exporte des cours vers Excel
   */
  exportCours = asyncHandler(async (req, res) => {
    const workbook = await exportService.exportCours();
    
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=cours_${Date.now()}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  });
}

module.exports = new ImportController();
