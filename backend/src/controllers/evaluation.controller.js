// backend/src/controllers/evaluation.controller.js

const evaluationService = require('../services/evaluation.service');
const asyncHandler = require('../utils/asyncHandler');
const ErrorHandler = require('../middlewares/errorHandler.middleware');
const ResponseFormatter = require('../utils/ResponseFormatter');

class EvaluationController {
  create = asyncHandler(async (req, res) => {
    // Récupérer l'ID de l'administrateur depuis le token JWT
    const adminId = req.user.id;
    const evaluation = await evaluationService.create(req.body, adminId);
    return ResponseFormatter.created(res, evaluation, 'Évaluation créée avec succès');
  });

  findAll = asyncHandler(async (req, res) => {
    const result = await evaluationService.findAll(req.query);
    return ResponseFormatter.compatibilityFormat(res, result.evaluations, result.pagination, 'evaluations');
  });

  findOne = asyncHandler(async (req, res) => {
    const evaluation = await evaluationService.findOne(req.params.id);
    if (!evaluation) {
      throw ErrorHandler.createError('Évaluation non trouvée.', 404, 'NOT_FOUND');
    }
    return ResponseFormatter.success(res, evaluation, 'Évaluation récupérée avec succès');
  });

  update = asyncHandler(async (req, res) => {
    const updatedEvaluation = await evaluationService.update(req.params.id, req.body);
    return ResponseFormatter.success(res, updatedEvaluation, 'Évaluation mise à jour avec succès');
  });

  delete = asyncHandler(async (req, res) => {
    console.log('🗑️ Controller - Requête DELETE reçue pour l\'évaluation:', req.params.id);
    console.log('👤 Controller - Utilisateur:', req.user?.id, req.user?.email);
    
    const result = await evaluationService.delete(req.params.id);
    console.log('✅ Controller - Suppression réussie, envoi de la réponse');
    return ResponseFormatter.success(res, result, 'Évaluation supprimée avec succès');
  });

  addQuestionToQuizz = asyncHandler(async (req, res) => {
    const { quizzId } = req.params;
    const question = await evaluationService.addQuestionToQuizz(quizzId, req.body);
    return ResponseFormatter.created(res, question, 'Question ajoutée au quiz avec succès');
  });

  updateQuestion = asyncHandler(async (req, res) => {
    const { questionId } = req.params;
    const updatedQuestion = await evaluationService.updateQuestion(questionId, req.body);
    return ResponseFormatter.success(res, updatedQuestion, 'Question mise à jour avec succès');
  });

  removeQuestion = asyncHandler(async (req, res) => {
    const { questionId } = req.params;
    const result = await evaluationService.removeQuestion(questionId);
    return ResponseFormatter.success(res, result, 'Question supprimée avec succès');
  });

  getQuestionsByQuizz = asyncHandler(async (req, res) => {
    const { quizzId } = req.params;
    const questions = await evaluationService.getQuestionsByQuizz(quizzId);
    return ResponseFormatter.success(res, questions, 'Questions récupérées avec succès');
  });

  importQuestions = asyncHandler(async (req, res) => {
    const { quizzId } = req.params;
    
    // Validation du paramètre quizzId
    if (!quizzId || quizzId === 'null' || quizzId === 'undefined') {
      throw ErrorHandler.createError('ID du quiz requis et valide.', 400, 'QUIZZ_ID_REQUIRED');
    }
    
    if (!req.file) {
      throw ErrorHandler.createError('Aucun fichier fourni.', 400, 'FILE_REQUIRED');
    }

    const result = await evaluationService.importQuestionsFromExcel(quizzId, req.file.buffer);
    
    return ResponseFormatter.created(res, result.questions, `${result.count} questions ont été importées avec succès.`);
  });

  publish = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const evaluation = await evaluationService.publish(id);
    return ResponseFormatter.success(res, evaluation, 'Évaluation publiée avec succès. Les notifications ont été envoyées.');
  });

  close = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await evaluationService.close(id);
    
    // Gérer le cas où l'évaluation est déjà clôturée
    if (result.message) {
      return ResponseFormatter.success(res, result, result.message);
    } else {
      return ResponseFormatter.success(res, result, 'Évaluation clôturée avec succès.');
    }
  });

  getSubmissions = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const submissions = await evaluationService.getSubmissions(id);
    return ResponseFormatter.success(res, submissions, 'Soumissions récupérées avec succès');
  });

  duplicate = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const adminId = req.user.id; // Récupérer l'ID de l'admin connecté
    const duplicatedEvaluation = await evaluationService.duplicate(id, adminId);
    return ResponseFormatter.created(res, duplicatedEvaluation, 'Évaluation dupliquée avec succès.');
  });

  analyzeSentiments = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const sentimentAnalysis = await evaluationService.analyzeSentiments(id);
    return ResponseFormatter.success(res, sentimentAnalysis, 'Analyse de sentiment effectuée avec succès');
  });

  exportReport = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { format = 'excel', includeSentimentAnalysis = true, includeChartData = true } = req.query;
    
    const options = {
      includeSentimentAnalysis: includeSentimentAnalysis === 'true',
      includeChartData: includeChartData === 'true'
    };

    const reportBuffer = await evaluationService.exportReport(id, format, options);
    
    const filename = `rapport_evaluation_${id}_${new Date().toISOString().split('T')[0]}`;
    const extension = format === 'pdf' ? 'pdf' : 'xlsx';
    const mimeType = format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.${extension}"`);
    res.send(reportBuffer);
  });

  generateAdvancedReport = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const advancedReport = await evaluationService.generateAdvancedReport(id);
    return ResponseFormatter.success(res, advancedReport, 'Rapport avancé généré avec succès');
  });
}

module.exports = new EvaluationController();