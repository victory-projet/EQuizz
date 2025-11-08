import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from './constants';

/**
 * Instance axios centralisée pour toutes les requêtes API
 * Configure automatiquement l'URL de base et les headers d'authentification
 */

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://equizz-production.up.railway.app/api';

console.log('🌐 API URL configurée:', API_URL);

// Instance axios principale
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter automatiquement le token JWT
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // Ne pas ajouter le token pour les routes d'authentification
      const isAuthRoute = config.url?.includes('/auth/');
      
      if (!isAuthRoute) {
        const token = await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Erreur lors de la récupération du token:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs globalement
apiClient.interceptors.response.use(
  (response) => {
    // Log minimal en développement uniquement
    if (__DEV__) {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    }
    return response;
  },
  async (error) => {
    // Log minimal en développement uniquement
    if (__DEV__) {
      console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status || 'Network Error'}`);
    }
    
    if (error.response?.status === 401) {
      // Token expiré ou invalide - nettoyer le stockage
      try {
        await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
        await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
      } catch (e) {
        if (__DEV__) {
          console.error('Erreur lors du nettoyage du token:', e);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
