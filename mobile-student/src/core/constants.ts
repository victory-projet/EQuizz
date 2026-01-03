import { API_CONFIG } from './config';

/**
 * Constantes de l'application
 */

// URL de base de l'API
export const API_BASE_URL = API_CONFIG.BASE_URL;

// Clés de stockage
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  PUSH_TOKEN: 'push_token',
  NOTIFICATION_PREFERENCES: 'notification_preferences',
} as const;

// Couleurs de l'application
export const COLORS = {
  primary: '#3A5689',
  primaryLight: '#5A76A9',
  primaryDark: '#2A4669',
  background: '#F5F5F5',
  white: '#FFFFFF',
  error: '#E74C3C',
  success: '#27AE60',
  text: '#2C3E50',
  textLight: '#7F8C8D',
} as const;
