// backend/src/controllers/quizz.controller.js

const quizzService = require('../services/quizz.service');
const asyncHandler = require('../utils/asyncHandler');
const ErrorHandler = require('../middlewares/errorHandler.middleware');

class QuizzController {
  
  getAvailableQuizzes = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const quizzes = await quizzService.getAvailableQuizzesForStudent(userId);
    res.status(200).json(quizzes);
  });

  getQuizzDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const etudiantId = req.user.id;
    const quizzDetails = await quizzService.getQuizzDetails(id, etudiantId);
    res.status(200).json(quizzDetails);
  });

  submitReponses = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reponses, estFinal } = req.body;
    const etudiantId = req.user.id;

    if (!reponses || !Array.isArray(reponses) || reponses.length === 0) {
      throw ErrorHandler.createError('Le tableau de réponses est invalide ou vide.', 400, 'VALIDATION_ERROR');
    }

    const result = await quizzService.submitReponses(id, etudiantId, reponses, estFinal !== false);
    res.status(201).json(result);
  });
}

module.exports = new QuizzController();