// backend/src/services/sync.service.js

const quizzService = require('./quizz.service');
const etudiantRepository = require('../repositories/etudiant.repository');
const quizzRepository = require('../repositories/quizz.repository');
const { Utilisateur, Etudiant, Classe } = require('../models');

class SyncService {
  /**
   * Traite un lot d'opérations d'upload depuis le mobile.
   * Idempotent : appeler plusieurs fois avec les mêmes données ne crée pas de doublons
   * (la couche quizzService gère les SessionToken/SessionReponse en findOrCreate).
   *
   * @param {Array<{operationId, type, payload}>} operations
   * @param {string} etudiantId
   * @returns {Promise<Array<{operationId, status, data?, error?}>>}
   */
  async processBatchUpload(operations, etudiantId) {
    const results = [];

    for (const operation of operations) {
      try {
        const data = await this._processOperation(operation, etudiantId);
        results.push({ operationId: operation.operationId, status: 'success', data });
      } catch (error) {
        results.push({
          operationId: operation.operationId,
          status: 'error',
          error: error.message || 'Erreur inconnue'
        });
      }
    }

    return results;
  }

  /**
   * Route chaque opération vers le handler approprié.
   * @private
   */
  async _processOperation(operation, etudiantId) {
    switch (operation.type) {
    case 'submission':
      return this._processSubmission(operation.payload, etudiantId);
    default:
      throw new Error(`Type d'opération non supporté : ${operation.type}`);
    }
  }

  /**
   * Traite une soumission de quizz.
   * @private
   */
  async _processSubmission(payload, etudiantId) {
    const { quizzId, reponses, estFinal = true } = payload;

    if (!quizzId || !Array.isArray(reponses) || reponses.length === 0) {
      throw new Error('Payload de soumission invalide : quizzId et reponses sont requis.');
    }

    return quizzService.submitReponses(quizzId, etudiantId, reponses, estFinal);
  }

  /**
   * Retourne un snapshot des données étudiant.
   * Sans `since` : snapshot complet (premier lancement, réinstallation).
   * Avec `since`  : pour compatibilité future — actuellement on retourne toujours
   *                 l'état courant complet car les évaluations sont déjà filtrées
   *                 par date active côté DB.
   *
   * @param {string} etudiantId
   * @param {number|null} since - timestamp ms (optionnel)
   * @returns {Promise<{evaluations, quizzes, user, serverTime}>}
   */
  async downloadDelta(etudiantId, since) {
    const etudiant = await etudiantRepository.findById(etudiantId);
    if (!etudiant || !etudiant.classe_id) {
      throw new Error('Profil étudiant non trouvé ou non associé à une classe.');
    }

    // 1. Évaluations actives + statut étudiant
    const evaluations = await quizzRepository.findAvailableEvaluationsForClass(
      etudiant.classe_id,
      etudiantId
    );

    // 2. Détails complets (questions) de chaque quizz associé
    const quizzes = await this._fetchQuizzDetails(evaluations);

    // 3. Profil étudiant complet
    const user = await this._fetchStudentProfile(etudiantId);

    return {
      evaluations,
      quizzes,
      user,
      serverTime: Date.now()
    };
  }

  /**
   * Pour chaque évaluation qui possède un Quizz, récupère le détail avec ses questions.
   * @private
   */
  async _fetchQuizzDetails(evaluations) {
    const quizzIds = evaluations
      .map(ev => ev.Quizz?.id)
      .filter(Boolean);

    const details = await Promise.all(
      quizzIds.map(id => quizzRepository.findQuizzWithQuestionsById(id))
    );

    return details
      .filter(q => q !== null)
      .map(q => q.toJSON());
  }

  /**
   * Retourne le profil étudiant formaté (même structure que GET /student/me).
   * @private
   */
  async _fetchStudentProfile(etudiantId) {
    const utilisateur = await Utilisateur.findByPk(etudiantId, {
      include: [
        {
          model: Etudiant,
          include: [{ model: Classe, attributes: ['id', 'nom', 'niveau'] }]
        }
      ]
    });

    if (!utilisateur || !utilisateur.Etudiant) return null;

    return {
      id: utilisateur.id,
      nom: utilisateur.nom,
      prenom: utilisateur.prenom,
      email: utilisateur.email,
      matricule: utilisateur.Etudiant.matricule,
      idCarte: utilisateur.Etudiant.idCarte,
      classe: utilisateur.Etudiant.Classe
        ? {
          id: utilisateur.Etudiant.Classe.id,
          nom: utilisateur.Etudiant.Classe.nom,
          niveau: utilisateur.Etudiant.Classe.niveau
        }
        : null
    };
  }
}

module.exports = new SyncService();
