import { SQLiteDatabase } from '../database/SQLiteDatabase';
import { Evaluation } from '../../domain/entities/Evaluation';
import { Quizz } from '../../domain/entities/Quizz';
import { QuizzQuestion } from '../../domain/entities/QuizzQuestion';

/**
 * Repository pour la gestion offline des quizz et évaluations
 * Gère le cache local et la queue de synchronisation
 */
export class OfflineQuizRepository {
  private db: SQLiteDatabase;

  constructor() {
    this.db = SQLiteDatabase.getInstance();
  }

  // ==================== COURS ====================

  /**
   * Sauvegarde un cours en cache local
   */
  async saveCourse(course: any): Promise<void> {
    const query = `
      INSERT OR REPLACE INTO courses (id, nom, description, synced, updated_at)
      VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)
    `;
    
    await this.db.executeUpdate(query, [
      course.id,
      course.nom,
      course.description || null
    ]);
  }

  /**
   * Récupère un cours depuis le cache local
   */
  async getCourse(courseId: string): Promise<any | null> {
    const query = 'SELECT * FROM courses WHERE id = ?';
    const results = await this.db.executeQuery(query, [courseId]);
    return results.length > 0 ? results[0] : null;
  }

  // ==================== ÉVALUATIONS ====================

  /**
   * Sauvegarde plusieurs évaluations en cache local
   */
  async saveEvaluations(evaluations: Evaluation[]): Promise<void> {
    for (const evaluation of evaluations) {
      const query = `
        INSERT OR REPLACE INTO evaluations 
        (id, titre, description, cours_id, date_debut, date_fin, duree_minutes, status, synced, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
      `;
      
      await this.db.executeUpdate(query, [
        evaluation.id,
        evaluation.titre,
        evaluation.description || null,
        evaluation.coursId || null,
        evaluation.dateDebut || null,
        evaluation.dateFin || null,
        evaluation.dureeMinutes || null,
        evaluation.status || 'active'
      ]);
    }
  }

  /**
   * Récupère toutes les évaluations depuis le cache local
   */
  async getAllEvaluations(): Promise<Evaluation[]> {
    const query = `
      SELECT e.*, c.nom as cours_nom 
      FROM evaluations e
      LEFT JOIN courses c ON e.cours_id = c.id
      ORDER BY e.date_debut DESC
    `;
    
    const results = await this.db.executeQuery(query);
    return results.map(row => this.mapRowToEvaluation(row));
  }

  /**
   * Récupère une évaluation spécifique
   */
  async getEvaluation(evaluationId: string): Promise<Evaluation | null> {
    const query = `
      SELECT e.*, c.nom as cours_nom 
      FROM evaluations e
      LEFT JOIN courses c ON e.cours_id = c.id
      WHERE e.id = ?
    `;
    
    const results = await this.db.executeQuery(query, [evaluationId]);
    return results.length > 0 ? this.mapRowToEvaluation(results[0]) : null;
  }
  /**
   * Met à jour le statut d'une évaluation
   */
  async updateEvaluationStatus(evaluationId: string, status: string): Promise<void> {
    const query = `
      UPDATE evaluations 
      SET status = ?, synced = 0, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    await this.db.executeUpdate(query, [status, evaluationId]);
  }

  // ==================== QUIZZ (DÉTAILS) ====================

  /**
   * Sauvegarde les détails d'un quizz
   */
  async saveQuizDetails(quizz: Quizz): Promise<void> {
    const query = `
      INSERT OR REPLACE INTO quizzes 
      (id, evaluation_id, titre, description, questions_data, synced, updated_at)
      VALUES (?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
    `;
    
    await this.db.executeUpdate(query, [
      quizz.id,
      quizz.evaluationId,
      quizz.titre,
      quizz.description || null,
      JSON.stringify(quizz.questions || [])
    ]);
  }

  /**
   * Récupère les détails d'un quizz
   */
  async getQuizDetails(quizzId: string): Promise<Quizz | null> {
    const query = 'SELECT * FROM quizzes WHERE id = ?';
    const results = await this.db.executeQuery(query, [quizzId]);
    
    if (results.length === 0) return null;
    
    const row = results[0];
    return {
      id: row.id,
      evaluationId: row.evaluation_id,
      titre: row.titre,
      description: row.description,
      questions: row.questions_data ? JSON.parse(row.questions_data) : []
    } as Quizz;
  }

  /**
   * Vérifie si les détails d'un quizz sont disponibles localement
   */
  async hasQuizDetails(quizzId: string): Promise<boolean> {
    const query = 'SELECT COUNT(*) as count FROM quizzes WHERE id = ?';
    const results = await this.db.executeQuery(query, [quizzId]);
    return results[0]?.count > 0;
  }

  // ==================== QUESTIONS ====================

  /**
   * Sauvegarde les questions d'un quizz
   */
  async saveQuestions(questions: QuizzQuestion[]): Promise<void> {
    for (const question of questions) {
      const query = `
        INSERT OR REPLACE INTO questions 
        (id, quizz_id, type, question, options, bonne_reponse, points, ordre, synced)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
      `;
      
      await this.db.executeUpdate(query, [
        question.id,
        question.quizzId,
        question.type,
        question.question,
        question.options ? JSON.stringify(question.options) : null,
        question.bonneReponse || null,
        question.points || 1,
        question.ordre || 0
      ]);
    }
  }

  /**
   * Récupère les questions d'un quizz
   */
  async getQuestions(quizzId: string): Promise<QuizzQuestion[]> {
    const query = `
      SELECT * FROM questions 
      WHERE quizz_id = ? 
      ORDER BY ordre ASC, id ASC
    `;
    
    const results = await this.db.executeQuery(query, [quizzId]);
    return results.map(row => this.mapRowToQuestion(row));
  }
  // ==================== RÉPONSES BROUILLONS ====================

  /**
   * Sauvegarde une réponse brouillon
   */
  async saveAnswer(questionId: string, quizzId: string, userId: string, content: string): Promise<void> {
    const query = `
      INSERT OR REPLACE INTO answers (question_id, quizz_id, user_id, content, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;
    
    await this.db.executeUpdate(query, [questionId, quizzId, userId, content]);
  }

  /**
   * Récupère les réponses brouillons d'un quizz pour un utilisateur
   */
  async getAnswers(quizzId: string, userId: string): Promise<any[]> {
    const query = `
      SELECT * FROM answers 
      WHERE quizz_id = ? AND user_id = ?
      ORDER BY question_id
    `;
    
    return await this.db.executeQuery(query, [quizzId, userId]);
  }

  /**
   * Supprime les réponses brouillons d'un quizz (après soumission)
   */
  async deleteAnswers(quizzId: string, userId: string): Promise<void> {
    const query = 'DELETE FROM answers WHERE quizz_id = ? AND user_id = ?';
    await this.db.executeUpdate(query, [quizzId, userId]);
  }

  // ==================== SOUMISSIONS ====================

  /**
   * Sauvegarde une soumission de quizz (en attente de sync)
   */
  async saveSubmission(
    quizzId: string, 
    evaluationId: string, 
    userId: string, 
    responses: any[]
  ): Promise<void> {
    const query = `
      INSERT INTO submissions (quizz_id, evaluation_id, user_id, responses, completed_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;
    
    await this.db.executeUpdate(query, [
      quizzId,
      evaluationId,
      userId,
      JSON.stringify(responses)
    ]);
  }

  /**
   * Récupère les soumissions en attente de synchronisation
   */
  async getPendingSubmissions(): Promise<any[]> {
    const query = `
      SELECT * FROM submissions 
      WHERE synced = 0 AND retry_count < 3
      ORDER BY created_at ASC
    `;
    
    const results = await this.db.executeQuery(query);
    return results.map(row => ({
      ...row,
      responses: JSON.parse(row.responses)
    }));
  }

  /**
   * Marque une soumission comme synchronisée
   */
  async markSubmissionAsSynced(submissionId: number): Promise<void> {
    const query = `
      UPDATE submissions 
      SET synced = 1, synced_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    await this.db.executeUpdate(query, [submissionId]);
  }

  /**
   * Incrémente le compteur de tentatives d'une soumission
   */
  async incrementSubmissionRetries(submissionId: number, errorMessage: string): Promise<void> {
    const query = `
      UPDATE submissions 
      SET retry_count = retry_count + 1, last_error = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    await this.db.executeUpdate(query, [errorMessage, submissionId]);
  }
  // ==================== MÉTHODES UTILITAIRES ====================

  /**
   * Convertit une ligne de base de données en objet Evaluation
   */
  private mapRowToEvaluation(row: any): Evaluation {
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
    } as Evaluation;
  }

  /**
   * Convertit une ligne de base de données en objet QuizzQuestion
   */
  private mapRowToQuestion(row: any): QuizzQuestion {
    return {
      id: row.id,
      quizzId: row.quizz_id,
      type: row.type,
      question: row.question,
      options: row.options ? JSON.parse(row.options) : null,
      bonneReponse: row.bonne_reponse,
      points: row.points,
      ordre: row.ordre
    } as QuizzQuestion;
  }

  // ==================== STATISTIQUES ====================

  /**
   * Récupère les statistiques de synchronisation
   */
  async getSyncStats(): Promise<{
    pendingSubmissions: number;
    failedSubmissions: number;
    totalEvaluations: number;
    cachedQuizzes: number;
  }> {
    const [pending, failed, evaluations, quizzes] = await Promise.all([
      this.db.executeQuery('SELECT COUNT(*) as count FROM submissions WHERE synced = 0 AND retry_count < 3'),
      this.db.executeQuery('SELECT COUNT(*) as count FROM submissions WHERE retry_count >= 3'),
      this.db.executeQuery('SELECT COUNT(*) as count FROM evaluations'),
      this.db.executeQuery('SELECT COUNT(*) as count FROM quizzes')
    ]);

    return {
      pendingSubmissions: pending[0]?.count || 0,
      failedSubmissions: failed[0]?.count || 0,
      totalEvaluations: evaluations[0]?.count || 0,
      cachedQuizzes: quizzes[0]?.count || 0
    };
  }

  /**
   * Nettoie les données obsolètes
   */
  async cleanupOldData(): Promise<void> {
    // Supprimer les soumissions synchronisées de plus de 7 jours
    await this.db.executeUpdate(`
      DELETE FROM submissions 
      WHERE synced = 1 AND synced_at < datetime('now', '-7 days')
    `);

    // Supprimer les réponses brouillons de plus de 30 jours
    await this.db.executeUpdate(`
      DELETE FROM answers 
      WHERE created_at < datetime('now', '-30 days')
    `);

    console.log('🧹 Nettoyage des données de quizz terminé');
  }
}