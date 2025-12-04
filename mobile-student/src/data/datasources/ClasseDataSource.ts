import apiClient from '../../core/api';
import { Classe } from '../../domain/entities/Classe.entity';
import { ErrorHandlerService } from '../../core/services/errorHandler.service';

export interface ClasseDataSource {
  getClasses(): Promise<Classe[]>;
}

export class ClasseDataSourceImpl implements ClasseDataSource {
  async getClasses(): Promise<Classe[]> {
    try {
      const response = await apiClient.get<Classe[]>('/academic/classes/public');
      return response.data;
    } catch (error) {
      ErrorHandlerService.logError(error, 'ClasseDataSource.getClasses');
      const userError = ErrorHandlerService.handleError(error);
      throw new Error(userError.message);
    }
  }
}
