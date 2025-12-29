// backend/src/routes/evaluation.routes.js

const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middlewares/auth.middleware');
const evaluationController = require('../controllers/evaluation.controller');
const upload = require('../middlewares/upload.middleware');

// Sécuriser toutes les routes de ce fichier
router.use(authenticate, isAdmin);

// =========================================================
// --- Routes pour la gestion des Évaluations (CRUD) ---
// =========================================================

// POST /api/evaluations/ - Créer une nouvelle évaluation (et son quizz)
router.post('/', evaluationController.create);

// GET /api/evaluations/ - Obtenir la liste de toutes les évaluations
router.get('/', evaluationController.findAll);

// GET /api/evaluations/:id - Obtenir une évaluation par son ID
router.get('/:id', evaluationController.findOne);

// PUT /api/evaluations/:id - Mettre à jour une évaluation
router.put('/:id', evaluationController.update);

// DELETE /api/evaluations/:id - Supprimer une évaluation (et son quizz)
router.delete('/:id', evaluationController.delete);

// =========================================================
// --- Routes pour la gestion manuelle des Questions ---
// =========================================================

// POST /api/evaluations/quizz/:quizzId/questions - Ajouter une question à un quizz
router.post('/quizz/:quizzId/questions', evaluationController.addQuestionToQuizz);

// PUT /api/evaluations/questions/:questionId - Modifier une question
router.put('/questions/:questionId', evaluationController.updateQuestion);

// DELETE /api/evaluations/questions/:questionId - Supprimer une question
router.delete('/questions/:questionId', evaluationController.removeQuestion);

// --- Route pour l'import de Questions depuis Excel ---

// POST /api/evaluations/quizz/:quizzId/import
// Le middleware 'upload.single('file')' intercepte un fichier envoyé
// dans un champ de formulaire nommé 'file'.
router.post('/quizz/:quizzId/import', upload.single('file'), evaluationController.importQuestions);

// =========================================================
// --- Route pour publier une évaluation ---
// =========================================================

// POST /api/evaluations/:id/publish - Publier une évaluation
router.post('/:id/publish', evaluationController.publish);

// POST /api/evaluations/:id/close - Clôturer une évaluation
router.post('/:id/close', evaluationController.close);

// GET /api/evaluations/:id/submissions - Récupérer les soumissions d'une évaluation
router.get('/:id/submissions', evaluationController.getSubmissions);

// POST /api/evaluations/:id/duplicate - Dupliquer une évaluation en brouillon
router.post('/:id/duplicate', evaluationController.duplicate);

module.exports = router;