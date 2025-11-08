import apiClient from '../../core/api';
import { Course } from '../../domain/entities/Course.entity';
import { EvaluationPeriod } from '../../domain/entities/EvaluationPeriod.entity';
import { ErrorHandlerService } from '../../core/services/errorHandler.service';

export interface CourseDataSource {
  getCourses(): Promise<Course[]>;
  getCourseById(id: string): Promise<Course | null>;
  getEvaluationPeriod(): Promise<EvaluationPeriod>;
}

export class CourseDataSourceImpl implements CourseDataSource {
  async getCourses(): Promise<Course[]> {
    try {
      const response = await apiClient.get<Course[]>('/student/courses');
      return response.data;
    } catch (error) {
      ErrorHandlerService.logError(error, 'CourseDataSource.getCourses');
      const userError = ErrorHandlerService.handleError(error);
      throw new Error(userError.message);
    }
  }

  async getCourseById(id: string): Promise<Course | null> {
    try {
      const response = await apiClient.get<Course>(`/student/courses/${id}`);
      return response.data;
    } catch (error) {
      ErrorHandlerService.logError(error, 'CourseDataSource.getCourseById');
      const userError = ErrorHandlerService.handleError(error);
      
      // Pour les 404, retourner null au lieu de throw
      if (userError.code === 'NOT_FOUND') {
        return null;
      }
      
      throw new Error(userError.message);
    }
  }

  async getEvaluationPeriod(): Promise<EvaluationPeriod> {
    try {
      const response = await apiClient.get<EvaluationPeriod>('/student/evaluation-period');
      return response.data;
    } catch (error) {
      ErrorHandlerService.logError(error, 'CourseDataSource.getEvaluationPeriod');
      const userError = ErrorHandlerService.handleError(error);
      throw new Error(userError.message);
    }
  }
}
