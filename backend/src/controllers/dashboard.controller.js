// backend/src/controllers/dashboard.controller.js

const dashboardService = require('../services/dashboard.service');
const asyncHandler = require('../utils/asyncHandler');

class DashboardController {
  getAdminDashboard = asyncHandler(async (req, res) => {
    const dashboard = await dashboardService.getAdminDashboard();
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
