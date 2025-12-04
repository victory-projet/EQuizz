/**
 * Configuration de l'application
 * 
 * IMPORTANT: Modifiez l'URL de l'API selon votre environnement
 * Cette configuration est partagée avec api.constants.ts
 */

// Configuration de l'URL de l'API
// Production: Render
// Développement local: Remplacez par votre IP locale (ex: 'http://192.168.1.100:8080/api')
export const API_CONFIG = {
  BASE_URL: process.env.API_URL || 'https://equizz-backend.onrender.com/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
} as const;
