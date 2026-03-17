// backend/src/controllers/sync.controller.js

const syncService = require('../services/sync.service');
const asyncHandler = require('../utils/asyncHandler');
const ErrorHandler = require('../middlewares/errorHandler.middleware');

class SyncController {
  /**
   * POST /api/student/sync/upload
   *
   * Reçoit un lot d'opérations (submissions…) depuis le mobile et les traite.
   * Retourne un résultat individuel par opération (succès partiel possible).
   *
   * Body : { operations: [{ operationId, type, payload }] }
   * Réponse : { results: [{ operationId, status, data?, error? }] }
   */
  upload = asyncHandler(async (req, res) => {
    const { operations } = req.body;
    const etudiantId = req.user.id;

    if (!Array.isArray(operations) || operations.length === 0) {
      throw ErrorHandler.createError(
        'Le champ "operations" doit être un tableau non vide.',
        400,
        'VALIDATION_ERROR'
      );
    }

    const results = await syncService.processBatchUpload(operations, etudiantId);
    res.status(200).json({ results });
  });

  /**
   * GET /api/student/sync/download?since=<timestamp_ms>
   *
   * Retourne les données nécessaires au mobile pour mettre à jour son cache local :
   *   - evaluations : évaluations actives avec statut étudiant
   *   - quizzes     : détails + questions de chaque quizz
   *   - user        : profil étudiant complet
   *   - serverTime  : timestamp serveur à stocker pour la prochaine sync
   *
   * Le paramètre `since` est accepté pour compatibilité future.
   * Actuellement les évaluations sont déjà filtrées par date active côté DB.
   */
  download = asyncHandler(async (req, res) => {
    const etudiantId = req.user.id;
    const since = req.query.since ? parseInt(req.query.since, 10) : null;

    const data = await syncService.downloadDelta(etudiantId, since);
    res.status(200).json(data);
  });
}

module.exports = new SyncController();
