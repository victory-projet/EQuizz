import { QuizzSubmission } from '../entities/Quizz';
import { QuizzRepository } from '../repositories/QuizzRepository';

/**
 * Cas d'utilisation : Soumettre les réponses d'un quizz
 * Permet à un étudiant de soumettre ses réponses à un quizz
 */
export class SubmitQuizzAnswersUseCase {
  constructor(private quizzRepository: QuizzRepository) {}

  async execute(quizzId: string, submission: QuizzSubmission): Promise<void> {
    if (!quizzId) {
      throw new Error('L\'ID du quizz est requis');
    }

    if (!submission.reponses || submission.reponses.length === 0) {
      throw new Error('Au moins une réponse est requise');
    }

    return this.quizzRepository.submitAnswers(quizzId, submission);
  }
}
