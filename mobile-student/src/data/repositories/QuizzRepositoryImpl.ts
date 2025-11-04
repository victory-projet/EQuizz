import { QuizzRepository } from '../../domain/repositories/QuizzRepository';
import { Evaluation } from '../../domain/entities/Evaluation';
import { Quizz, QuizzSubmission } from '../../domain/entities/Quizz';
import { QuizzDataSource } from '../datasources/QuizzDataSource';

/**
 * Implémentation du repository pour les quizz
 * Fait le pont entre la couche domain et la couche data
 */
export class QuizzRepositoryImpl implements QuizzRepository {
  constructor(private quizzDataSource: QuizzDataSource) {}

  async getAvailableQuizzes(): Promise<Evaluation[]> {
    return this.quizzDataSource.getAvailableQuizzes();
  }

  async getQuizzDetails(id: string): Promise<Quizz> {
    return this.quizzDataSource.getQuizzDetails(id);
  }

  async submitAnswers(quizzId: string, submission: QuizzSubmission): Promise<void> {
    return this.quizzDataSource.submitAnswers(quizzId, submission);
  }
}
