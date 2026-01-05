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

// Test endpoint (no auth required)
router.get('/health', dashboardController.getHealth);

// Métriques système
router.get('/metrics', authenticate, isAdmin, dashboardController.getMetrics);

// Alertes du dashboard
router.get('/alerts', authenticate, isAdmin, dashboardController.getAlerts);

// Activités récentes
router.get('/activities/recent', authenticate, isAdmin, dashboardController.getRecentActivities);

module.exports = router;
