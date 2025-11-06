// backend/src/controllers/quizz.controller.js

const quizzService = require('../services/quizz.service');

class QuizzController {
  
  async getAvailableQuizzes(req, res) {
    try {
      // req.user.id est fourni par le middleware d'authentification
      const userId = req.user.id;
      const quizzes = await quizzService.getAvailableQuizzesForStudent(userId);
      res.status(200).json(quizzes);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getQuizzDetails(req, res) {
    try {
      const { id } = req.params;
      const etudiantId = req.user.id;
      const quizzDetails = await quizzService.getQuizzDetails(id, etudiantId);
      res.status(200).json(quizzDetails);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async submitReponses(req, res) {
    try {
      const { id } = req.params; // ID du quizz
      const { reponses, estFinal } = req.body; // Tableau de réponses et flag final
      const etudiantId = req.user.id;

      if (!reponses || !Array.isArray(reponses) || reponses.length === 0) {
        return res.status(400).json({ message: 'Le tableau de réponses est invalide ou vide.' });
      }

      const result = await quizzService.submitReponses(id, etudiantId, reponses, estFinal !== false);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = new QuizzController();