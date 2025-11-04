import { Quizz } from '../entities/Quizz';
import { QuizzRepository } from '../repositories/QuizzRepository';

/**
 * Cas d'utilisation : Récupérer le détail d'un quizz
 * Permet à un étudiant de voir les questions d'un quizz spécifique
 */
export class GetQuizzDetailsUseCase {
  constructor(private quizzRepository: QuizzRepository) {}

  async execute(quizzId: string): Promise<Quizz> {
    if (!quizzId) {
      throw new Error('L\'ID du quizz est requis');
    }

    return this.quizzRepository.getQuizzDetails(quizzId);
  }
}
