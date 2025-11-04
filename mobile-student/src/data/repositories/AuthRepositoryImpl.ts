import * as SecureStore from 'expo-secure-store';
import { AuthRepository } from '../../domain/repositories/AuthRepository';
import { Utilisateur } from '../../domain/entities/Utilisateur';
import { AuthDataSource } from '../datasources/AuthDataSource';
import { STORAGE_KEYS } from '../../core/constants';

/**
 * Implémentation du repository d'authentification
 * Fait le pont entre la couche domain et la couche data
 */
export class AuthRepositoryImpl implements AuthRepository {
  constructor(private authDataSource: AuthDataSource) {}

  async claimAccount(matricule: string, email: string, classeId: string): Promise<void> {
    return this.authDataSource.claimAccount(matricule, email, classeId);
  }

  async login(
    matricule: string,
    motDePasse: string
  ): Promise<{ token: string; utilisateur: Utilisateur }> {
    const result = await this.authDataSource.login(matricule, motDePasse);
    
    // Stockage sécurisé du token
    await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, result.token);
    await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(result.utilisateur));
    
    return result;
  }

  async logout(): Promise<void> {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
  }

  async getStoredToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
  }
}
