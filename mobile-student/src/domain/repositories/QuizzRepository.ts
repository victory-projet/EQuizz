import { Evaluation } from '../entities/Evaluation';
import { Quizz, QuizzSubmission } from '../entities/Quizz';

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
}
