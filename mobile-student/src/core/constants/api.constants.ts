// API Configuration - Réexporte depuis config.ts pour compatibilité
export { API_CONFIG } from '../config';

// API Endpoints
export const API_ENDPOINTS = {
    // Student endpoints (utilisés par l'application)
    STUDENT_COURSES: '/student/courses',
    STUDENT_QUIZZES: '/student/quizzes',
    STUDENT_EVALUATION_PERIOD: '/student/evaluation-period',
    
    // Auth endpoints
    AUTH_LOGIN: '/auth/login',
    AUTH_CLAIM_ACCOUNT: '/auth/claim-account',
};
