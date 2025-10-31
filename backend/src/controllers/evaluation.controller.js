// backend/src/controllers/evaluation.controller.js

const evaluationService = require('../services/evaluation.service');

class EvaluationController {
  async create(req, res) {
    try {
      const evaluation = await evaluationService.create(req.body);
      res.status(201).json(evaluation);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async findAll(req, res) {
    try {
      const evaluations = await evaluationService.findAll();
      res.status(200).json(evaluations);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des évaluations." });
    }
  }

  async findOne(req, res) {
    try {
      const evaluation = await evaluationService.findOne(req.params.id);
      res.status(200).json(evaluation);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const updatedEvaluation = await evaluationService.update(req.params.id, req.body);
      res.status(200).json(updatedEvaluation);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const result = await evaluationService.delete(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async addQuestionToQuizz(req, res) {
    try {
      const { quizzId } = req.params;
      const question = await evaluationService.addQuestionToQuizz(quizzId, req.body);
      res.status(201).json(question);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async updateQuestion(req, res) {
    try {
      const { questionId } = req.params;
      const updatedQuestion = await evaluationService.updateQuestion(questionId, req.body);
      res.status(200).json(updatedQuestion);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async removeQuestion(req, res) {
    try {
      const { questionId } = req.params;
      const result = await evaluationService.removeQuestion(questionId);
      res.status(200).json(result);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

   async importQuestions(req, res) {
    try {
      const { quizzId } = req.params;
      
      // Le middleware multer a placé les informations du fichier dans `req.file`
      if (!req.file) {
        return res.status(400).json({ message: 'Aucun fichier fourni.' });
      }

      const result = await evaluationService.importQuestionsFromExcel(quizzId, req.file.buffer);
      
      res.status(201).json({ 
        message: `${result.count} questions ont été importées avec succès.`,
        questions: result.questions 
      });

    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
  
}

module.exports = new EvaluationController();