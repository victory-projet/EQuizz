import apiClient from '../../core/api';
import { Utilisateur } from '../../domain/entities/Utilisateur';
import { ErrorHandlerService } from '../../core/services/errorHandler.service';

/**
 * Interface de la source de données d'authentification
 */
export interface AuthDataSource {
  claimAccount(matricule: string, email: string, classeId: string): Promise<void>;
  login(matricule: string, motDePasse: string): Promise<{ token: string; refreshToken: string; utilisateur: Utilisateur }>;
  refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }>;
}

/**
 * Implémentation de la source de données d'authentification
 * Gère les appels API concrets avec l'API de production
 */
export class AuthDataSourceImpl implements AuthDataSource {

  async claimAccount(matricule: string, email: string, classeId: string): Promise<void> {
    try {
      await apiClient.post('/auth/claim-account', {
        matricule,
        email,
        classeId,
      });
    } catch (error) {
      ErrorHandlerService.logError(error, 'AuthDataSource.claimAccount');
      const userError = ErrorHandlerService.handleError(error);
      throw new Error(userError.message);
    }
  }

  async login(
    matricule: string,
    motDePasse: string
  ): Promise<{ token: string; refreshToken: string; utilisateur: Utilisateur }> {
    try {
      const response = await apiClient.post('/auth/login', {
        matricule,
        motDePasse,
      });

      return {
        token: response.data.token,
        refreshToken: response.data.refreshToken,
        utilisateur: response.data.utilisateur,
      };
    } catch (error) {
      ErrorHandlerService.logError(error, 'AuthDataSource.login');
      const userError = ErrorHandlerService.handleError(error);
      throw new Error(userError.message);
    }
  }

  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    try {
      const response = await apiClient.post('/auth/refresh', {
        refreshToken,
      });

      return {
        token: response.data.token,
        refreshToken: response.data.refreshToken,
      };
    } catch (error) {
      ErrorHandlerService.logError(error, 'AuthDataSource.refreshToken');
      const userError = ErrorHandlerService.handleError(error);
      throw new Error(userError.message);
    }
  }
}
