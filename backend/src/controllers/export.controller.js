// backend/src/controllers/export.controller.js

const exportService = require('../services/export.service');
const asyncHandler = require('../utils/asyncHandler');

class ExportController {
  /**
   * Exporte une évaluation en Excel
   */
  exportEvaluationExcel = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { classeId } = req.query;
    
    const buffer = await exportService.exportEvaluationToExcel(id, classeId);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=evaluation-${id}.xlsx`);
    res.send(buffer);
  });

  /**
   * Exporte la liste des étudiants en Excel
   */
  exportStudentsExcel = asyncHandler(async (req, res) => {
    const { classeId } = req.query;
    
    const buffer = await exportService.exportStudentsToExcel(classeId);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=etudiants.xlsx');
    res.send(buffer);
  });

  /**
   * Exporte la liste des cours en Excel
   */
  exportCoursesExcel = asyncHandler(async (req, res) => {
    const buffer = await exportService.exportCoursesToExcel();
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=cours.xlsx');
    res.send(buffer);
  });

  /**
   * Exporte les statistiques globales en Excel
   */
  exportGlobalStatsExcel = asyncHandler(async (req, res) => {
    const buffer = await exportService.exportGlobalStatsToExcel();
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=statistiques.xlsx');
    res.send(buffer);
  });
}

module.exports = new ExportController();
