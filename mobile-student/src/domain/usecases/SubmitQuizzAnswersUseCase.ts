import { QuizzSubmission } from '../entities/Quizz';
import { QuizzRepository } from '../repositories/QuizzRepository';

/**
 * Cas d'utilisation : Soumettre les réponses d'un quizz
 * Supporte le mode offline : les réponses sont mises en file d'attente
 * et envoyées automatiquement au retour de la connexion.
 */
export class SubmitQuizzAnswersUseCase {
  constructor(private quizzRepository: QuizzRepository) {}

  async execute(
    quizzId: string,
    submission: QuizzSubmission,
    options?: { evaluationId?: string; userId?: string },
  ): Promise<void> {
    if (!quizzId) {
      throw new Error('L\'ID du quizz est requis');
    }

    if (!submission.reponses || submission.reponses.length === 0) {
      throw new Error('Au moins une réponse est requise');
    }

    return this.quizzRepository.submitAnswers(quizzId, submission, options);
  }
}
