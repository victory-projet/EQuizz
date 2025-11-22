// backend/src/controllers/report.controller.js

const reportService = require('../services/report.service');
const asyncHandler = require('../utils/asyncHandler');

class ReportController {
  getReport = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { classeId } = req.query;
    
    const report = await reportService.generateReport(id, classeId);
    res.status(200).json(report);
  });

  exportPDF = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { classeId } = req.query;
    
    const pdfBuffer = await reportService.generatePDF(id, classeId);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=rapport-evaluation-${id}.pdf`);
    res.send(pdfBuffer);
  });
}

module.exports = new ReportController();
