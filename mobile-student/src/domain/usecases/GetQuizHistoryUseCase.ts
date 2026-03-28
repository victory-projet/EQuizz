import apiClient from '../../core/api';
import { SQLiteDatabase } from '../../data/database/SQLiteDatabase';
import { QuizHistoryEntry } from '../entities/QuizHistory';

/**
 * Use Case : Récupère tout l'historique des quizz soumis par l'étudiant.
 *
 * Stratégie :
 *   1. Charger immédiatement depuis SQLite (local, offline-first).
 *   2. Si en ligne, récupérer depuis le serveur (/student/submissions) et fusionner.
 *   3. Dé-dupliquer par quizz_id + evaluation_id.
 *
 * L'historique est lié au compte utilisateur (JWT), pas à l'établissement.
 * Ainsi les soumissions de tous les établissements précédents sont incluses
 * dans la réponse serveur.
 */
export class GetQuizHistoryUseCase {
  private db: SQLiteDatabase;

  constructor() {
    this.db = SQLiteDatabase.getInstance();
  }

  async execute(): Promise<QuizHistoryEntry[]> {
    const localEntries = await this._getLocalHistory();
    const serverEntries = await this._getServerHistory();

    // Fusionner : les entrées serveur ont la priorité sur les entrées locales
    const merged = this._mergeEntries(localEntries, serverEntries);

    // Trier par date décroissante (plus récent en premier)
    merged.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

    return merged;
  }

  // ─────────────────────────────────────
  // SOURCE LOCALE (SQLite)
  // ─────────────────────────────────────
  private async _getLocalHistory(): Promise<QuizHistoryEntry[]> {
    try {
      const rows = await this.db.executeQuery(`
        SELECT
          s.id,
          s.quizz_id,
          s.evaluation_id,
          s.responses,
          s.completed_at,
          s.synced,
          q.titre AS quizz_titre,
          e.titre AS eval_titre,
          e.date_debut,
          e.date_fin,
          c.nom  AS cours_nom
        FROM submissions s
        LEFT JOIN quizzes q      ON q.id = s.quizz_id
        LEFT JOIN evaluations e  ON e.id = s.evaluation_id
        LEFT JOIN courses c      ON c.id = e.cours_id
        ORDER BY s.completed_at DESC
      `);

      return rows.map((row: any) => {
        let responses: any[] = [];
        try {
          responses = JSON.parse(row.responses || '[]');
        } catch {
          responses = [];
        }

        return {
          id: `local_${row.id}`,
          quizzId: row.quizz_id,
          evaluationId: row.evaluation_id,
          titre: row.eval_titre || row.quizz_titre || 'Quiz sans titre',
          coursNom: row.cours_nom || undefined,
          nombreQuestions: undefined,
          nombreReponses: responses.length,
          completedAt: row.completed_at,
          synced: row.synced === 1,
          source: 'local' as const,
        };
      });
    } catch (error) {
      console.warn('⚠️ Impossible de charger l\'historique local:', error);
      return [];
    }
  }

  // ─────────────────────────────────────
  // SOURCE SERVEUR (API)
  // ─────────────────────────────────────
  private async _getServerHistory(): Promise<QuizHistoryEntry[]> {
    try {
      // Endpoint dédié à l'historique des soumissions de l'étudiant.
      // Retourne les soumissions de TOUS les établissements liés au compte.
      const response = await apiClient.get<any[]>('/student/submissions');
      const data: any[] = response.data;

      return data.map((item: any) => ({
        id: `server_${item.id || item.quizz_id}`,
        quizzId: item.quizz_id || item.quizzId || '',
        evaluationId: item.evaluation_id || item.evaluationId || '',
        titre: item.evaluation?.titre || item.titre || item.quizz?.titre || 'Quiz',
        coursNom: item.evaluation?.Cour?.nom || item.evaluation?.Cours?.nom || item.cours_nom,
        classeNom: item.classe?.nom || item.classe_nom,
        ecoleNom: item.ecole?.nom || item.ecole_nom,
        anneeScolaire: item.annee_scolaire || item.anneeScolaire,
        nombreQuestions: item.evaluation?.nombreQuestions || item.nombre_questions,
        nombreReponses: item.nombre_reponses || (item.reponses?.length ?? 0),
        completedAt: item.completed_at || item.completedAt || item.created_at,
        synced: true,
        source: 'server' as const,
      }));
    } catch (error: any) {
      // Si l'endpoint n'existe pas encore (404) ou si hors-ligne, on continue avec le local
      const status = error?.response?.status;
      if (status !== 404) {
        console.warn('⚠️ Impossible de charger l\'historique serveur:', error?.message);
      }
      return [];
    }
  }

  // ─────────────────────────────────────
  // FUSION & DÉDUPLICATION
  // ─────────────────────────────────────
  private _mergeEntries(
    local: QuizHistoryEntry[],
    server: QuizHistoryEntry[]
  ): QuizHistoryEntry[] {
    const map = new Map<string, QuizHistoryEntry>();

    // Clé de déduplication : quizzId + evaluationId
    const key = (e: QuizHistoryEntry) => `${e.quizzId}_${e.evaluationId}`;

    // Ajouter les entrées locales en premier
    for (const entry of local) {
      map.set(key(entry), entry);
    }

    // Les entrées serveur écrasent les locales (données plus complètes)
    for (const entry of server) {
      map.set(key(entry), entry);
    }

    return Array.from(map.values());
  }
}
