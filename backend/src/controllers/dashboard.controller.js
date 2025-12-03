// backend/src/controllers/dashboard.controller.js

const dashboardService = require('../services/dashboard.service');
const asyncHandler = require('../utils/asyncHandler');

class DashboardController {
  getAdminDashboard = asyncHandler(async (req, res) => {
    const { year, semester, classe, cours, enseignant } = req.query;
    
    const filters = {};
    
    // N'ajouter les filtres que s'ils sont fournis
    if (year) filters.year = year;
    if (semester && semester !== 'all') filters.semester = semester;
    if (classe && classe !== 'all') filters.classeId = classe;
    if (cours && cours !== 'all') filters.coursId = cours;
    if (enseignant && enseignant !== 'all') filters.enseignantId = enseignant;

    console.log('📊 Dashboard filters received:', filters);

    const dashboard = await dashboardService.getAdminDashboard(filters);
    res.status(200).json(dashboard);
  });

  getStudentDashboard = asyncHandler(async (req, res) => {
    const etudiantId = req.user.id;
    const dashboard = await dashboardService.getStudentDashboard(etudiantId);
    res.status(200).json(dashboard);
  });

  getEvaluationStats = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const stats = await dashboardService.getEvaluationStats(id);
    res.status(200).json(stats);
  });
}

module.exports = new DashboardController();
