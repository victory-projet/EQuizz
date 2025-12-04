// backend/src/controllers/evaluation.controller.js

const evaluationService = require('../services/evaluation.service');
const asyncHandler = require('../utils/asyncHandler');
const ErrorHandler = require('../middlewares/errorHandler.middleware');

class EvaluationController {
  create = asyncHandler(async (req, res) => {
    // Récupérer l'ID de l'administrateur depuis le token JWT
    const adminId = req.user.id;
    const evaluation = await evaluationService.create(req.body, adminId);
    res.status(201).json(evaluation);
  });

  findAll = asyncHandler(async (req, res) => {
    const evaluations = await evaluationService.findAll();
    res.status(200).json(evaluations);
  });

  findOne = asyncHandler(async (req, res) => {
    const evaluation = await evaluationService.findOne(req.params.id);
    if (!evaluation) {
      throw ErrorHandler.createError('Évaluation non trouvée.', 404, 'NOT_FOUND');
    }
    res.status(200).json(evaluation);
  });

  update = asyncHandler(async (req, res) => {
    const updatedEvaluation = await evaluationService.update(req.params.id, req.body);
    res.status(200).json(updatedEvaluation);
  });

  delete = asyncHandler(async (req, res) => {
    const result = await evaluationService.delete(req.params.id);
    res.status(200).json(result);
  });

  addQuestionToQuizz = asyncHandler(async (req, res) => {
    const { quizzId } = req.params;
    const question = await evaluationService.addQuestionToQuizz(quizzId, req.body);
    res.status(201).json(question);
  });

  updateQuestion = asyncHandler(async (req, res) => {
    const { questionId } = req.params;
    const updatedQuestion = await evaluationService.updateQuestion(questionId, req.body);
    res.status(200).json(updatedQuestion);
  });

  removeQuestion = asyncHandler(async (req, res) => {
    const { questionId } = req.params;
    const result = await evaluationService.removeQuestion(questionId);
    res.status(200).json(result);
  });

  importQuestions = asyncHandler(async (req, res) => {
    const { quizzId } = req.params;
    
    if (!req.file) {
      throw ErrorHandler.createError('Aucun fichier fourni.', 400, 'FILE_REQUIRED');
    }

    const result = await evaluationService.importQuestionsFromExcel(quizzId, req.file.buffer);
    
    res.status(201).json({ 
      message: `${result.count} questions ont été importées avec succès.`,
      questions: result.questions 
    });
  });

  publish = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const evaluation = await evaluationService.publish(id);
    res.status(200).json({
      message: 'Évaluation publiée avec succès. Les notifications ont été envoyées.',
      evaluation
    });
  });

  close = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const evaluation = await evaluationService.close(id);
    res.status(200).json({
      message: 'Évaluation clôturée avec succès.',
      evaluation
    });
  });

  getSubmissions = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const submissions = await evaluationService.getSubmissions(id);
    res.status(200).json(submissions);
  });
}

module.exports = new EvaluationController();