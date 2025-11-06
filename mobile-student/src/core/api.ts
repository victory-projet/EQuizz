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
          console.log(`🔐 Request to ${config.url} with token: ${token.substring(0, 20)}...`);
        } else {
          console.log(`⚠️ Request to ${config.url} WITHOUT token`);
        }
      } else {
        console.log(`🔓 Auth request to ${config.url} (no token needed)`);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
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
    console.log(`✅ Response from ${response.config.url}:`, {
      status: response.status,
      dataLength: Array.isArray(response.data) ? response.data.length : 'not array',
      data: response.data
    });
    return response;
  },
  async (error) => {
    console.error(`❌ Error response:`, {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      // Token expiré ou invalide - nettoyer le stockage
      console.log('🔓 Token invalide, déconnexion...');
      try {
        await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
        await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
      } catch (e) {
        console.error('Erreur lors du nettoyage du token:', e);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
