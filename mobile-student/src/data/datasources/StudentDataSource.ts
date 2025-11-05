import apiClient from '../../core/api';
import { Utilisateur } from '../../domain/entities/Utilisateur';
import axios from 'axios';

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
      console.log('📡 Fetching student info from /student/me...');
      const response = await apiClient.get<any>('/student/me');
      console.log('✅ Student info fetched:', response.data);
      
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
      console.error('❌ Error fetching student info:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Non authentifié. Veuillez vous reconnecter.');
        } else if (error.response) {
          const message = error.response.data?.message || 'Erreur lors de la récupération des informations';
          throw new Error(message);
        } else if (error.request) {
          throw new Error('Impossible de contacter le serveur. Vérifiez votre connexion.');
        }
      }
      throw new Error('Une erreur inattendue est survenue');
    }
  }
}
