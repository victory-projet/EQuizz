/**
 * Configuration de l'application
 * 
 * IMPORTANT: Modifiez l'URL de l'API selon votre environnement
 * Cette configuration est partagée avec api.constants.ts
 */

// Pour tester avec votre backend local, remplacez par votre IP locale
// Exemple: 'http://192.168.1.100:3000/api'
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'https://equizz-backend.onrender.com/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
} as const;
