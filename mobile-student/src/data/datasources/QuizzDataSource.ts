import apiClient from '../../core/api';
import { Evaluation } from '../../domain/entities/Evaluation';
import { Quizz, QuizzSubmission } from '../../domain/entities/Quizz';
import axios from 'axios';

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
      console.error('❌ Error fetching quizzes:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Non authentifié. Veuillez vous reconnecter.');
        } else if (error.response) {
          console.error('Response error:', error.response.status, error.response.data);
          const message = error.response.data?.message || 'Erreur lors de la récupération des quizz';
          throw new Error(message);
        } else if (error.request) {
          console.error('Request error - no response received');
          throw new Error('Impossible de contacter le serveur. Vérifiez votre connexion.');
        }
      }
      throw new Error('Une erreur inattendue est survenue');
    }
  }

  async getQuizzDetails(id: string): Promise<Quizz> {
    try {
      console.log(`📡 Fetching quiz details from /student/quizzes/${id}...`);
      const response = await apiClient.get<Quizz>(`/student/quizzes/${id}`);
      console.log('✅ Quiz details fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching quiz details:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Non authentifié. Veuillez vous reconnecter.');
        } else if (error.response?.status === 404) {
          console.error('404 Error details:', error.response.data);
          throw new Error('Quizz non trouvé');
        } else if (error.response) {
          console.error('Response error:', error.response.status, error.response.data);
          const message = error.response.data?.message || 'Erreur lors de la récupération du quizz';
          throw new Error(message);
        } else if (error.request) {
          throw new Error('Impossible de contacter le serveur. Vérifiez votre connexion.');
        }
      }
      throw new Error('Une erreur inattendue est survenue');
    }
  }

  async submitAnswers(quizzId: string, submission: QuizzSubmission): Promise<void> {
    try {
      await apiClient.post(`/student/quizzes/${quizzId}/submit`, submission);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Non authentifié. Veuillez vous reconnecter.');
        } else if (error.response?.status === 404) {
          throw new Error('Quizz non trouvé');
        } else if (error.response) {
          const message = error.response.data?.message || 'Erreur lors de la soumission des réponses';
          throw new Error(message);
        } else if (error.request) {
          throw new Error('Impossible de contacter le serveur. Vérifiez votre connexion.');
        }
      }
      throw new Error('Une erreur inattendue est survenue');
    }
  }
}
