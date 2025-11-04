import axios, { AxiosInstance } from 'axios';
import { API_BASE_URL } from '../../core/constants';
import { Utilisateur } from '../../domain/entities/Utilisateur';

/**
 * Interface de la source de données d'authentification
 */
export interface AuthDataSource {
  claimAccount(matricule: string, email: string, classeId: string): Promise<void>;
  login(matricule: string, motDePasse: string): Promise<{ token: string; utilisateur: Utilisateur }>;
}

/**
 * Implémentation de la source de données d'authentification
 * Gère les appels API concrets
 */
export class AuthDataSourceImpl implements AuthDataSource {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
  }

  async claimAccount(matricule: string, email: string, classeId: string): Promise<void> {
    try {
      await this.axiosInstance.post('/auth/claim-account', {
        matricule,
        email,
        classeId,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Erreur de validation ou logique métier
          const message = error.response.data?.message || 
                         error.response.data?.errors?.[0]?.msg ||
                         'Une erreur est survenue';
          throw new Error(message);
        } else if (error.request) {
          throw new Error('Impossible de contacter le serveur. Vérifiez votre connexion.');
        }
      }
      throw new Error('Une erreur inattendue est survenue');
    }
  }

  async login(
    matricule: string,
    motDePasse: string
  ): Promise<{ token: string; utilisateur: Utilisateur }> {
    try {
      const response = await this.axiosInstance.post('/auth/login', {
        matricule,
        motDePasse,
      });

      return {
        token: response.data.token,
        utilisateur: response.data.utilisateur,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Identifiants invalides');
        } else if (error.response) {
          const message = error.response.data?.message || 'Une erreur est survenue';
          throw new Error(message);
        } else if (error.request) {
          throw new Error('Impossible de contacter le serveur. Vérifiez votre connexion.');
        }
      }
      throw new Error('Une erreur inattendue est survenue');
    }
  }
}
