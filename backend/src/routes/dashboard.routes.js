// backend/src/routes/dashboard.routes.js

const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middlewares/auth.middleware');
const dashboardController = require('../controllers/dashboard.controller');

// Dashboard admin
router.get('/admin', authenticate, isAdmin, dashboardController.getAdminDashboard);

// Dashboard étudiant
router.get('/student', authenticate, dashboardController.getStudentDashboard);

// Statistiques d'une évaluation
router.get('/evaluation/:id', authenticate, isAdmin, dashboardController.getEvaluationStats);

module.exports = router;
