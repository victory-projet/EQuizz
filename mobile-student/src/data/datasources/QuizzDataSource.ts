import NetInfo from '@react-native-community/netinfo';
import apiClient from '../../core/api';
import { Evaluation } from '../../domain/entities/Evaluation';
import { Quizz, QuizzSubmission } from '../../domain/entities/Quizz';
import { ErrorHandlerService } from '../../core/services/errorHandler.service';
import { SQLiteDatabase } from '../database/SQLiteDatabase';
import { SyncEngine } from '../services/SyncEngine';

/**
 * Interface de la source de données pour les quizz
 */
export interface QuizzDataSource {
  getAvailableQuizzes(): Promise<Evaluation[]>;
  getQuizzDetails(id: string): Promise<Quizz>;
  submitAnswers(quizzId: string, submission: QuizzSubmission): Promise<void>;
}

/**
 * Vérifie si l'appareil est connecté à Internet.
 */
async function isOnline(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return state.isConnected === true && state.isInternetReachable === true;
}

/**
 * Implémentation offline-first de la source de données pour les quizz.
 *
 * Stratégie :
 *  - Lectures : retourne immédiatement depuis SQLite, puis rafraîchit en arrière-plan si en ligne.
 *  - Soumissions : sauvegarde localement d'abord, envoie au serveur si en ligne,
 *    sinon place dans la queue du SyncEngine pour retry automatique.
 */
export class QuizzDataSourceImpl implements QuizzDataSource {
  private db: SQLiteDatabase;
  private syncEngine: SyncEngine;

  constructor() {
    this.db = SQLiteDatabase.getInstance();
    this.syncEngine = SyncEngine.getInstance();
  }

  // ─────────────────────────────────────────────
  // LECTURE : évaluations disponibles
  // ─────────────────────────────────────────────

  async getAvailableQuizzes(): Promise<Evaluation[]> {
    // 1. Lire le cache local immédiatement
    const cached = await this._getCachedEvaluations();

    // 2. Rafraîchir depuis le serveur en arrière-plan si en ligne
    this._refreshEvaluationsInBackground();

    // 3. Si le cache est vide et qu'on est en ligne, attendre le chargement initial
    if (cached.length === 0) {
      return this._fetchEvaluationsFromServer();
    }

    return cached;
  }

  private async _getCachedEvaluations(): Promise<Evaluation[]> {
    try {
      const rows = await this.db.executeQuery(`
        SELECT e.*, c.nom as cours_nom
        FROM evaluations e
        LEFT JOIN courses c ON e.cours_id = c.id
        ORDER BY e.date_fin ASC
      `);
      return rows.map(this._mapRowToEvaluation);
    } catch {
      return [];
    }
  }

  private _refreshEvaluationsInBackground(): void {
    isOnline().then(online => {
      if (!online) return;
      this._fetchEvaluationsFromServer().catch(err =>
        console.warn('⚠️ Refresh évaluations en arrière-plan échoué:', err.message)
      );
    });
  }

  private async _fetchEvaluationsFromServer(): Promise<Evaluation[]> {
    console.log('📡 Fetching available quizzes from /student/quizzes...');
    const response = await apiClient.get<Evaluation[]>('/student/quizzes');
    const evaluations: Evaluation[] = response.data;
    console.log('✅ Quizzes fetched:', evaluations.length, 'quiz(zes)');

    // Mettre en cache
    await this._cacheEvaluations(evaluations);
    return evaluations;
  }

  private async _cacheEvaluations(evaluations: Evaluation[]): Promise<void> {
    for (const ev of evaluations) {
      await this.db.executeUpdate(
        `INSERT OR REPLACE INTO evaluations
         (id, titre, description, cours_id, date_debut, date_fin, duree_minutes, status, synced, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)`,
        [
          ev.id,
          ev.titre,
          (ev as any).description || null,
          (ev as any).coursId || (ev as any).cours_id || null,
          (ev as any).dateDebut || null,
          (ev as any).dateFin || null,
          (ev as any).dureeMinutes || null,
          (ev as any).statut || (ev as any).status || 'PUBLIEE'
        ]
      );
    }
  }

  private _mapRowToEvaluation(row: any): Evaluation {
    return {
      id: row.id,
      titre: row.titre,
      description: row.description,
      coursId: row.cours_id,
      coursNom: row.cours_nom,
      dateDebut: row.date_debut,
      dateFin: row.date_fin,
      dureeMinutes: row.duree_minutes,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    } as unknown as Evaluation;
  }

  // ─────────────────────────────────────────────
  // LECTURE : détails d'un quizz
  // ─────────────────────────────────────────────

  async getQuizzDetails(id: string): Promise<Quizz> {
    // 1. Essayer le cache local
    const cached = await this._getCachedQuizz(id);

    if (cached) {
      // Rafraîchir en arrière-plan si en ligne
      this._refreshQuizzInBackground(id);
      return cached;
    }

    // 2. Cache vide → charger depuis le réseau (bloquant)
    return this._fetchQuizzFromServer(id);
  }

  private async _getCachedQuizz(id: string): Promise<Quizz | null> {
    try {
      const rows = await this.db.executeQuery('SELECT * FROM quizzes WHERE id = ?', [id]);
      if (rows.length === 0) return null;

      const row = rows[0];
      const questions = row.questions_data ? JSON.parse(row.questions_data) : [];

      return {
        id: row.id,
        titre: row.titre,
        Questions: questions
      } as unknown as Quizz;
    } catch {
      return null;
    }
  }

  private _refreshQuizzInBackground(id: string): void {
    isOnline().then(online => {
      if (!online) return;
      this._fetchQuizzFromServer(id).catch(err =>
        console.warn(`⚠️ Refresh quizz ${id} en arrière-plan échoué:`, err.message)
      );
    });
  }

  private async _fetchQuizzFromServer(id: string): Promise<Quizz> {
    console.log(`📡 Fetching quiz details from /student/quizzes/${id}...`);
    const response = await apiClient.get<Quizz>(`/student/quizzes/${id}`);
    const quizz = response.data;
    console.log('✅ Quiz details fetched:', quizz.id);

    await this._cacheQuizz(quizz);
    return quizz;
  }

  private async _cacheQuizz(quizz: Quizz): Promise<void> {
    const questions: any[] = (quizz as any).Questions || [];

    await this.db.executeUpdate(
      `INSERT OR REPLACE INTO quizzes
       (id, evaluation_id, titre, description, questions_data, synced, updated_at)
       VALUES (?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)`,
      [
        quizz.id,
        (quizz as any).evaluation_id || null,
        quizz.titre,
        (quizz as any).instructions || null,
        JSON.stringify(questions)
      ]
    );

    // Persister chaque question individuellement
    for (const q of questions) {
      await this.db.executeUpdate(
        `INSERT OR REPLACE INTO questions
         (id, quizz_id, type, question, options, bonne_reponse, points, ordre, synced)
         VALUES (?, ?, ?, ?, ?, NULL, 1, 0, 1)`,
        [
          q.id,
          quizz.id,
          q.typeQuestion || q.type,
          q.enonce || q.question,
          q.options ? JSON.stringify(q.options) : null
        ]
      );
    }
  }

  // ─────────────────────────────────────────────
  // ÉCRITURE : soumission des réponses
  // ─────────────────────────────────────────────

  /**
   * Soumet les réponses d'un quizz avec stratégie offline-first :
   *  1. Sauvegarde locale dans `submissions` (toujours, garantit zéro perte).
   *  2. Si en ligne  → envoie directement au serveur.
   *  3. Si hors ligne → place dans la queue du SyncEngine pour retry automatique.
   *
   * La méthode retourne immédiatement dans tous les cas pour ne pas bloquer l'UI.
   */
  async submitAnswers(quizzId: string, submission: QuizzSubmission): Promise<void> {
    const online = await isOnline();

    // Toujours persister localement en premier
    await this._saveSubmissionLocally(quizzId, submission);

    if (online) {
      await this._sendSubmissionToServer(quizzId, submission);
    } else {
      // Mise en file : le SyncEngine enverra dès le retour en ligne
      await this.syncEngine.queueSubmission(
        quizzId,
        (submission as any).evaluationId || '',
        (submission as any).userId || '',
        submission.reponses
      );
      console.log('📦 Soumission mise en queue (hors ligne)');
    }
  }

  private async _saveSubmissionLocally(quizzId: string, submission: QuizzSubmission): Promise<void> {
    try {
      await this.db.executeUpdate(
        `INSERT OR REPLACE INTO submissions
         (quizz_id, evaluation_id, user_id, responses, completed_at)
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          quizzId,
          (submission as any).evaluationId || '',
          (submission as any).userId || '',
          JSON.stringify(submission.reponses)
        ]
      );
    } catch (error) {
      console.error('❌ Échec sauvegarde locale soumission:', error);
      // Ne pas bloquer : on essaie quand même l'envoi réseau
    }
  }

  private async _sendSubmissionToServer(quizzId: string, submission: QuizzSubmission): Promise<void> {
    try {
      await apiClient.post(`/student/quizzes/${quizzId}/submit`, {
        reponses: submission.reponses
      });
      console.log(`✅ Soumission quizz ${quizzId} envoyée au serveur`);

      // Marquer comme synchronisée
      await this.db.executeUpdate(
        `UPDATE submissions SET synced = 1, synced_at = CURRENT_TIMESTAMP
         WHERE quizz_id = ?`,
        [quizzId]
      );
    } catch (error: any) {
      ErrorHandlerService.logError(error, 'QuizzDataSource.submitAnswers');

      // Si l'erreur n'est pas réseau (ex: 400/422), ne pas requeue
      const status = error?.response?.status;
      if (status && status < 500) {
        throw new Error(ErrorHandlerService.handleError(error).message);
      }

      // Erreur réseau ou serveur → on met en queue pour retry
      await this.syncEngine.queueSubmission(
        quizzId,
        (submission as any).evaluationId || '',
        (submission as any).userId || '',
        submission.reponses
      );
      console.warn('⚠️ Soumission mise en queue après erreur réseau');
    }
  }
}
