// API Configuration - Réexporte depuis config.ts pour compatibilité
export { API_CONFIG } from '../config';

// API Endpoints
export const API_ENDPOINTS = {
    // Quiz endpoints
    COURSES: '/courses',
    QUESTIONS: '/questions',
    SUBMIT_QUIZ: '/quiz/submit',
    EVALUATION_PERIOD: '/evaluation-period',
    
    // Auth endpoints
    AUTH_LOGIN: '/auth/login',
    AUTH_CLAIM_ACCOUNT: '/auth/claim-account',
};
