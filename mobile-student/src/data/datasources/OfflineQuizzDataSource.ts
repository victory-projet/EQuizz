import { SQLiteDatabase } from '../database/SQLiteDatabase';
import { Evaluation } from '../../domain/entities/Evaluation';
import { Quizz, QuizzSubmission } from '../../domain/entities/Quizz';

/**
 * Source de données offline pour les quizz
 * Lit et écrit dans la base de données SQLite locale
 */
export class OfflineQuizzDataSource {
  private get db(): SQLiteDatabase {
    return SQLiteDatabase.getInstance();
  }

  // ─── Liste des évaluations ───────────────────────────────────────────────

  async cacheEvaluations(evaluations: Evaluation[]): Promise<void> {
    for (const ev of evaluations) {
      const coursNom =
        ev.Cours?.nom ?? ev.Cour?.nom ?? null;
      const quizzId = ev.Quizz?.id ?? null;

      await this.db.executeUpdate(
        `INSERT INTO evaluations
           (id, titre, date_debut, date_fin, status, synced,
            cours_nom, quizz_id, statut_etudiant, evaluation_json)
         VALUES (?, ?, ?, ?, 'active', 1, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           titre           = excluded.titre,
           date_debut      = excluded.date_debut,
           date_fin        = excluded.date_fin,
           cours_nom       = excluded.cours_nom,
           quizz_id        = excluded.quizz_id,
           statut_etudiant = excluded.statut_etudiant,
           evaluation_json = excluded.evaluation_json,
           synced          = 1`,
        [
          ev.id,
          ev.titre,
          ev.dateDebut,
          ev.dateFin,
          coursNom,
          quizzId,
          ev.statutEtudiant ?? 'NOUVEAU',
          JSON.stringify(ev),
        ],
      );
    }
  }

  async getCachedEvaluations(): Promise<Evaluation[]> {
    const rows = await this.db.executeQuery(
      `SELECT evaluation_json FROM evaluations
       WHERE status = 'active'
       ORDER BY date_fin ASC`,
    );
    return rows.map((r) => JSON.parse(r.evaluation_json) as Evaluation);
  }

  async updateEvaluationStatus(
    evaluationId: string,
    statut: 'NOUVEAU' | 'EN_COURS' | 'TERMINE',
  ): Promise<void> {
    // Met à jour le statut en base ET régénère le JSON embarqué
    const rows = await this.db.executeQuery(
      'SELECT evaluation_json FROM evaluations WHERE id = ?',
      [evaluationId],
    );
    if (rows.length === 0) return;

    const ev: Evaluation = JSON.parse(rows[0].evaluation_json);
    ev.statutEtudiant = statut;

    await this.db.executeUpdate(
      `UPDATE evaluations
       SET statut_etudiant = ?, evaluation_json = ?
       WHERE id = ?`,
      [statut, JSON.stringify(ev), evaluationId],
    );
  }

  // ─── Détail d'un quizz ────────────────────────────────────────────────────

  async cacheQuizzDetails(quizz: Quizz): Promise<void> {
    await this.db.executeUpdate(
      `INSERT INTO quizzes
         (id, evaluation_id, titre, questions_data, synced)
       VALUES (?, '', ?, ?, 1)
       ON CONFLICT(id) DO UPDATE SET
         titre          = excluded.titre,
         questions_data = excluded.questions_data,
         synced         = 1`,
      [quizz.id, quizz.titre, JSON.stringify(quizz.Questions)],
    );
  }

  async getCachedQuizzDetails(quizzId: string): Promise<Quizz | null> {
    const rows = await this.db.executeQuery(
      'SELECT * FROM quizzes WHERE id = ?',
      [quizzId],
    );
    if (rows.length === 0) return null;

    const row = rows[0];
    return {
      id: row.id,
      titre: row.titre,
      Questions: JSON.parse(row.questions_data ?? '[]'),
    };
  }

  // ─── Soumissions en file d'attente ────────────────────────────────────────

  async savePendingSubmission(
    quizzId: string,
    evaluationId: string,
    userId: string,
    submission: QuizzSubmission,
  ): Promise<number> {
    const result = await this.db.executeUpdate(
      `INSERT INTO submissions
         (quizz_id, evaluation_id, user_id, responses, synced)
       VALUES (?, ?, ?, ?, 0)`,
      [quizzId, evaluationId, userId, JSON.stringify(submission)],
    );
    return result.lastInsertRowId as number;
  }

  async getPendingSubmissions(): Promise<
    Array<{
      id: number;
      quizzId: string;
      evaluationId: string;
      userId: string;
      submission: QuizzSubmission;
      retryCount: number;
    }>
  > {
    const rows = await this.db.executeQuery(
      `SELECT * FROM submissions WHERE synced = 0 ORDER BY created_at ASC`,
    );
    return rows.map((r) => ({
      id: r.id,
      quizzId: r.quizz_id,
      evaluationId: r.evaluation_id,
      userId: r.user_id,
      submission: JSON.parse(r.responses) as QuizzSubmission,
      retryCount: r.retry_count,
    }));
  }

  async markSubmissionSynced(id: number): Promise<void> {
    await this.db.executeUpdate(
      `UPDATE submissions
       SET synced = 1, synced_at = datetime('now')
       WHERE id = ?`,
      [id],
    );
  }

  async markSubmissionError(id: number, error: string): Promise<void> {
    await this.db.executeUpdate(
      `UPDATE submissions
       SET retry_count = retry_count + 1, last_error = ?
       WHERE id = ?`,
      [error, id],
    );
  }

  async hasPendingSubmissions(): Promise<boolean> {
    const rows = await this.db.executeQuery(
      `SELECT COUNT(*) as count FROM submissions WHERE synced = 0`,
    );
    return (rows[0]?.count ?? 0) > 0;
  }
}
