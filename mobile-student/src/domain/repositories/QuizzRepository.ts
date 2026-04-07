import { Evaluation } from '../entities/Evaluation';
import { Quizz, QuizzSubmission } from '../entities/Quizz';
import { QuizzHistory } from '../entities/QuizzHistory';

/**
 * Interface du repository pour les quizz
 * Définit le contrat pour les opérations liées aux quizz
 */
export interface QuizzRepository {
  /**
   * Récupère la liste des quizz disponibles pour l'étudiant
   */
  getAvailableQuizzes(): Promise<Evaluation[]>;

  /**
   * Récupère le détail d'un quizz avec ses questions
   */
  getQuizzDetails(id: string): Promise<Quizz>;

  /**
   * Soumet les réponses d'un quizz
   */
  submitAnswers(quizzId: string, submission: QuizzSubmission): Promise<void>;

  /**
   * Récupère l'historique complet de tous les quizz terminés par l'étudiant
   * Inclut les quizz de tous les établissements fréquentés
   */
  getQuizzHistory(): Promise<QuizzHistory[]>;
}
