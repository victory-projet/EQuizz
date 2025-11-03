// API Configuration
export const API_CONFIG = {
    BASE_URL: process.env.API_URL || 'http://localhost:3000/api',
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3
};

// API Endpoints
export const API_ENDPOINTS = {
    COURSES: '/courses',
    QUESTIONS: '/questions',
    SUBMIT_QUIZ: '/quiz/submit',
    EVALUATION_PERIOD: '/evaluation-period'
};
