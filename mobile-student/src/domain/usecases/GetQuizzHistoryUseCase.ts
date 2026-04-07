import { QuizzRepository } from '../repositories/QuizzRepository';
import { QuizzHistory } from '../entities/QuizzHistory';

/**
 * Cas d'utilisation pour récupérer l'historique complet des quizz de l'étudiant.
 * L'historique est lié au compte étudiant et non à l'établissement :
 * un étudiant peut voir tous ses quizz passés même s'il a changé d'établissement.
 */
export class GetQuizzHistoryUseCase {
  constructor(private quizzRepository: QuizzRepository) {}

  async execute(): Promise<QuizzHistory[]> {
    return this.quizzRepository.getQuizzHistory();
  }
}
