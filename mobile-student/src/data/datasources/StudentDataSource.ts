import apiClient from '../../core/api';
import { Utilisateur } from '../../domain/entities/Utilisateur';
import { ErrorHandlerService } from '../../core/services/errorHandler.service';

/**
 * Interface de la source de données pour les informations de l'étudiant
 */
export interface StudentDataSource {
  getMe(): Promise<Utilisateur>;
}

/**
 * Implémentation de la source de données pour les informations de l'étudiant
 */
export class StudentDataSourceImpl implements StudentDataSource {
  async getMe(): Promise<Utilisateur> {
    try {
      const response = await apiClient.get<any>('/student/me');
      
      // Mapper la réponse du backend vers notre entité Utilisateur
      return {
        id: response.data.id,
        nom: response.data.nom,
        prenom: response.data.prenom,
        email: response.data.email,
        matricule: response.data.matricule,
        role: 'etudiant',
        Classe: response.data.classe ? {
          nom: response.data.classe.nom,
          Niveau: {
            nom: response.data.classe.niveau
          }
        } : undefined
      };
    } catch (error) {
      ErrorHandlerService.logError(error, 'StudentDataSource.getMe');
      const userError = ErrorHandlerService.handleError(error);
      throw new Error(userError.message);
    }
  }
}
