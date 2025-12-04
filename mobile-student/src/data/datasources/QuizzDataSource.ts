import apiClient from '../../core/api';
import { Evaluation } from '../../domain/entities/Evaluation';
import { Quizz, QuizzSubmission } from '../../domain/entities/Quizz';
import { ErrorHandlerService } from '../../core/services/errorHandler.service';

/**
 * Interface de la source de données pour les quizz
 */
export interface QuizzDataSource {
  getAvailableQuizzes(): Promise<Evaluation[]>;
  getQuizzDetails(id: string): Promise<Quizz>;
  submitAnswers(quizzId: string, submission: QuizzSubmission): Promise<void>;
}

/**
 * Implémentation de la source de données pour les quizz
 * Utilise l'API de production
 */
export class QuizzDataSourceImpl implements QuizzDataSource {
  async getAvailableQuizzes(): Promise<Evaluation[]> {
    try {
      console.log('📡 Fetching available quizzes from /student/quizzes...');
      const response = await apiClient.get<Evaluation[]>('/student/quizzes');
      console.log('✅ Quizzes fetched:', response.data.length, 'quiz(zes)');
      return response.data;
    } catch (error) {
      ErrorHandlerService.logError(error, 'QuizzDataSource.getAvailableQuizzes');
      const userError = ErrorHandlerService.handleError(error);
      throw new Error(userError.message);
    }
  }

  async getQuizzDetails(id: string): Promise<Quizz> {
    try {
      console.log(`📡 Fetching quiz details from /student/quizzes/${id}...`);
      const response = await apiClient.get<Quizz>(`/student/quizzes/${id}`);
      console.log('✅ Quiz details fetched:', response.data);
      return response.data;
    } catch (error) {
      ErrorHandlerService.logError(error, 'QuizzDataSource.getQuizzDetails');
      const userError = ErrorHandlerService.handleError(error);
      throw new Error(userError.message);
    }
  }

  async submitAnswers(quizzId: string, submission: QuizzSubmission): Promise<void> {
    try {
      await apiClient.post(`/student/quizzes/${quizzId}/submit`, submission);
    } catch (error) {
      ErrorHandlerService.logError(error, 'QuizzDataSource.submitAnswers');
      const userError = ErrorHandlerService.handleError(error);
      throw new Error(userError.message);
    }
  }
}
