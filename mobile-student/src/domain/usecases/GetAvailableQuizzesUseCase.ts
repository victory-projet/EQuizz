import { Evaluation } from '../entities/Evaluation';
import { QuizzRepository } from '../repositories/QuizzRepository';

/**
 * Cas d'utilisation : Récupérer les quizz disponibles
 * Permet à un étudiant de voir tous les quizz qu'il peut passer
 */
export class GetAvailableQuizzesUseCase {
  constructor(private quizzRepository: QuizzRepository) {}

  async execute(): Promise<Evaluation[]> {
    return this.quizzRepository.getAvailableQuizzes();
  }
}
