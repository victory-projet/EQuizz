import apiClient from '../../core/api';
import { Question, QuizSubmission } from '../../domain/entities/Question.entity';
import { ErrorHandlerService } from '../../core/services/errorHandler.service';

/**
 * Interface de la source de données pour les questions
 */
export interface QuestionDataSource {
  getQuestionsByCourse(courseId: string): Promise<Question[]>;
  submitQuiz(submission: QuizSubmission): Promise<boolean>;
}

/**
 * Implémentation de la source de données pour les questions
 * Utilise l'API de production
 */
export class QuestionDataSourceImpl implements QuestionDataSource {
  async getQuestionsByCourse(courseId: string): Promise<Question[]> {
    try {
      const response = await apiClient.get<Question[]>(`/student/courses/${courseId}/questions`);
      return response.data;
    } catch (error) {
      ErrorHandlerService.logError(error, 'QuestionDataSource.getQuestionsByCourse');
      const userError = ErrorHandlerService.handleError(error);
      throw new Error(userError.message);
    }
  }

  async submitQuiz(submission: QuizSubmission): Promise<boolean> {
    try {
      await apiClient.post(`/student/courses/${submission.courseId}/submit`, {
        answers: submission.answers,
        completedAt: submission.completedAt
      });
      return true;
    } catch (error) {
      ErrorHandlerService.logError(error, 'QuestionDataSource.submitQuiz');
      const userError = ErrorHandlerService.handleError(error);
      throw new Error(userError.message);
    }
  }
}
