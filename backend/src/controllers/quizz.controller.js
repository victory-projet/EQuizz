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
      const quizzDetails = await quizzService.getQuizzDetails(id);
      res.status(200).json(quizzDetails);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async submitReponses(req, res) {
    try {
      const { id } = req.params; // ID du quizz
      const { reponses } = req.body; // Tableau de réponses

      if (!reponses || !Array.isArray(reponses) || reponses.length === 0) {
        return res.status(400).json({ message: 'Le tableau de réponses est invalide ou vide.' });
      }

      const result = await quizzService.submitReponses(id, reponses);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = new QuizzController();