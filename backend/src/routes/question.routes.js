const express = require('express');
const router = express.Router();
const questionController = require('../controllers/question.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

// Toutes les routes nécessitent une authentification et le rôle ADMIN
router.use(authenticate);
router.use(authorize(['ADMIN']));

// Routes pour les questions d'un quiz spécifique
router.get('/quizz/:quizz_id/questions', questionController.getQuestionsByQuizz);
router.post('/quizz/:quizz_id/questions', questionController.createQuestion);
router.post('/quizz/:quizz_id/questions/import', questionController.importQuestions);
router.put('/quizz/:quizz_id/questions/reorder', questionController.reorderQuestions);

// Routes pour une question spécifique
router.get('/questions/:id', questionController.getQuestionById);
router.put('/questions/:id', questionController.updateQuestion);
router.delete('/questions/:id', questionController.deleteQuestion);

module.exports = router;