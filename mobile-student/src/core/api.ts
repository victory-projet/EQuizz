import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import * as SecureStore from "expo-secure-store";
import { API_CONFIG } from "./config";
import { STORAGE_KEYS } from "./constants";

/**
 * Instance axios centralisée pour toutes les requêtes API
 * Configure automatiquement l'URL de base et les headers d'authentification
 */

const API_URL = API_CONFIG.BASE_URL;

console.log("🌐 API URL configurée:", API_URL);

// Variable pour éviter les appels multiples de refresh
let isRefreshing = false;
let failedQueue: {
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

// Instance axios principale
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur pour ajouter automatiquement le token JWT
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // Ne pas ajouter le token pour les routes d'authentification
      const isAuthRoute =
        config.url?.includes("/auth/login") ||
        config.url?.includes("/auth/claim-account");

      if (!isAuthRoute) {
        const token = await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      if (__DEV__) {
        console.error("Erreur lors de la récupération du token:", error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Intercepteur pour gérer les erreurs globalement et le refresh automatique
apiClient.interceptors.response.use(
  (response) => {
    // Log minimal en développement uniquement
    if (__DEV__) {
      console.log(
        `✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`,
      );
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log détaillé en développement uniquement
    if (__DEV__) {
      console.error(
        `❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status || "Network Error"}`,
      );
      if (error.response?.status === 500) {
        console.error("📋 Détails de l'erreur 500:");
        console.error("URL:", error.config?.url);
        console.error("Headers:", error.config?.headers);
        console.error("Response data:", error.response?.data);
      }
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Si un refresh est déjà en cours, mettre la requête en attente
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await SecureStore.getItemAsync(
          STORAGE_KEYS.REFRESH_TOKEN,
        );

        if (!refreshToken) {
          throw new Error("Aucun refresh token disponible");
        }

        // Appeler l'endpoint de refresh
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const { token: newToken, refreshToken: newRefreshToken } =
          response.data;

        // Sauvegarder les nouveaux tokens
        await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, newToken);
        await SecureStore.setItemAsync(
          STORAGE_KEYS.REFRESH_TOKEN,
          newRefreshToken,
        );

        // Traiter la queue des requêtes en attente
        processQueue(null, newToken);

        // Réessayer la requête originale avec le nouveau token
        originalRequest.headers["Authorization"] = "Bearer " + newToken;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Le refresh a échoué, nettoyer le stockage et rediriger vers login
        processQueue(refreshError, null);

        try {
          await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
          await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
          await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
        } catch (e) {
          if (__DEV__) {
            console.error("Erreur lors du nettoyage des tokens:", e);
          }
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
