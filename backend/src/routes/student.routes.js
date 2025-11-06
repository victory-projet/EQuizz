// backend/src/routes/student.routes.js

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth.middleware');
const quizzController = require('../controllers/quizz.controller');
const studentController = require('../controllers/student.controller');

// --- Sécurisation Globale des Routes Étudiantes ---

router.use(authenticate);

// =========================================================
// --- Routes pour les informations de l'étudiant ---
// =========================================================

// GET /api/student/me - Obtenir les informations complètes de l'étudiant connecté
router.get('/me', studentController.getMe);

// =========================================================
// --- Routes pour la consultation et la réponse aux Quizz ---
// =========================================================

// GET /api/student/quizzes - Obtenir la liste des quizz disponibles pour l'étudiant connecté
router.get('/quizzes', quizzController.getAvailableQuizzes);

// GET /api/student/quizzes/:id - Obtenir le détail d'un quizz (ses questions)
router.get('/quizzes/:id', quizzController.getQuizzDetails);

// POST /api/student/quizzes/:id/submit - Soumettre les réponses à un quizz
router.post('/quizzes/:id/submit', quizzController.submitReponses);


module.exports = router;