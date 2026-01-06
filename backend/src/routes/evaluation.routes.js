// backend/src/routes/evaluation.routes.js

const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middlewares/auth.middleware');
const evaluationController = require('../controllers/evaluation.controller');
const upload = require('../middlewares/upload.middleware');
const asyncHandler = require('../utils/asyncHandler');
const db = require('../models');

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

// GET /api/evaluations/quizz/:quizzId/questions - Récupérer les questions d'un quizz
router.get('/quizz/:quizzId/questions', evaluationController.getQuestionsByQuizz);

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

// =========================================================
// --- Routes pour l'analyse des sentiments et export ---
// =========================================================

// GET /api/evaluations/:id/sentiment-analysis - Analyser les sentiments des réponses
router.get('/:id/sentiment-analysis', evaluationController.analyzeSentiments);

// GET /api/evaluations/:id/export - Exporter un rapport complet
// Query params: format (excel|pdf), includeSentimentAnalysis (true|false), includeChartData (true|false)
router.get('/:id/export', evaluationController.exportReport);

// GET /api/evaluations/:id/advanced-report - Générer un rapport d'analyse avancé
router.get('/:id/advanced-report', evaluationController.generateAdvancedReport);

// GET /api/evaluations/:id/debug-delete - Debug de suppression (temporaire)
router.get('/:id/debug-delete', asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log('🔍 Debug - Test de suppression pour l\'évaluation:', id);
  
  try {
    // Vérifier que l'évaluation existe
    const evaluation = await db.Evaluation.findByPk(id, {
      include: [
        { model: db.Cours, required: false },
        { model: db.Quizz, include: [db.Question], required: false }
      ]
    });

    if (!evaluation) {
      return res.status(404).json({ error: 'Évaluation non trouvée' });
    }

    console.log('✅ Debug - Évaluation trouvée:', {
      id: evaluation.id,
      titre: evaluation.titre,
      statut: evaluation.statut,
      hasQuizz: !!evaluation.Quizz,
      quizzId: evaluation.Quizz?.id
    });

    // Vérifier les soumissions
    let submissionsCount = 0;
    if (evaluation.Quizz) {
      submissionsCount = await db.SessionReponse.count({
        where: { quizz_id: evaluation.Quizz.id }
      });
      console.log('📊 Debug - Nombre de soumissions:', submissionsCount);
    }

    // Vérifier les contraintes de clés étrangères
    const constraints = await db.sequelize.query(`
      SELECT 
        tc.constraint_name, 
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
      WHERE constraint_type = 'FOREIGN KEY' 
        AND (ccu.table_name = 'Evaluation' OR tc.table_name = 'Evaluation');
    `, { type: db.sequelize.QueryTypes.SELECT });

    console.log('🔗 Debug - Contraintes de clés étrangères:', constraints);

    res.json({
      evaluation: {
        id: evaluation.id,
        titre: evaluation.titre,
        statut: evaluation.statut,
        hasQuizz: !!evaluation.Quizz,
        quizzId: evaluation.Quizz?.id,
        questionsCount: evaluation.Quizz?.Questions?.length || 0
      },
      submissionsCount,
      constraints,
      canDelete: submissionsCount === 0,
      message: submissionsCount > 0 ? 'Suppression bloquée par les soumissions' : 'Suppression possible'
    });

  } catch (error) {
    console.error('❌ Debug - Erreur:', error);
    res.status(500).json({ 
      error: error.message,
      stack: error.stack 
    });
  }
}));

// Endpoint de test sans authentification (temporaire)
router.get('/test/:id/debug-delete', asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log('🔍 Test Debug - Test de suppression pour l\'évaluation:', id);
  
  try {
    // Vérifier que l'évaluation existe
    const evaluation = await db.Evaluation.findByPk(id, {
      include: [
        { model: db.Cours, required: false },
        { model: db.Quizz, include: [db.Question], required: false }
      ]
    });

    if (!evaluation) {
      return res.status(404).json({ error: 'Évaluation non trouvée' });
    }

    console.log('✅ Test Debug - Évaluation trouvée:', {
      id: evaluation.id,
      titre: evaluation.titre,
      statut: evaluation.statut,
      hasQuizz: !!evaluation.Quizz,
      quizzId: evaluation.Quizz?.id
    });

    // Vérifier les soumissions
    let submissionsCount = 0;
    if (evaluation.Quizz) {
      submissionsCount = await db.SessionReponse.count({
        where: { quizz_id: evaluation.Quizz.id }
      });
      console.log('📊 Test Debug - Nombre de soumissions:', submissionsCount);
    }

    res.json({
      evaluation: {
        id: evaluation.id,
        titre: evaluation.titre,
        statut: evaluation.statut,
        hasQuizz: !!evaluation.Quizz,
        quizzId: evaluation.Quizz?.id,
        questionsCount: evaluation.Quizz?.Questions?.length || 0
      },
      submissionsCount,
      canDelete: submissionsCount === 0,
      message: submissionsCount > 0 ? 'Suppression bloquée par les soumissions' : 'Suppression possible'
    });

  } catch (error) {
    console.error('❌ Test Debug - Erreur:', error);
    res.status(500).json({ 
      error: error.message,
      stack: error.stack 
    });
  }
}));

module.exports = router;