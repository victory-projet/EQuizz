import { ValidationError } from '../entities/question.entity';

// Validation error codes
export const VALIDATION_ERROR_CODES = {
  QUESTION_TEXT_REQUIRED: 'QUESTION_TEXT_REQUIRED',
  QUESTION_TEXT_TOO_SHORT: 'QUESTION_TEXT_TOO_SHORT',
  QUESTION_TEXT_TOO_LONG: 'QUESTION_TEXT_TOO_LONG',
  INSUFFICIENT_ANSWERS: 'INSUFFICIENT_ANSWERS',
  NO_CORRECT_ANSWER: 'NO_CORRECT_ANSWER',
  DUPLICATE_ANSWERS: 'DUPLICATE_ANSWERS',
  ANSWER_TEXT_REQUIRED: 'ANSWER_TEXT_REQUIRED',
  INVALID_POINTS: 'INVALID_POINTS',
  INVALID_QUESTION_TYPE: 'INVALID_QUESTION_TYPE'
} as const;

// Validation error messages
export const VALIDATION_ERROR_MESSAGES: Record<string, string> = {
  [VALIDATION_ERROR_CODES.QUESTION_TEXT_REQUIRED]: 'Le texte de la question est obligatoire',
  [VALIDATION_ERROR_CODES.QUESTION_TEXT_TOO_SHORT]: 'Le texte de la question doit contenir au moins 10 caractères',
  [VALIDATION_ERROR_CODES.QUESTION_TEXT_TOO_LONG]: 'Le texte de la question ne peut pas dépasser 500 caractères',
  [VALIDATION_ERROR_CODES.INSUFFICIENT_ANSWERS]: 'Une question à choix multiples doit avoir au moins 2 réponses',
  [VALIDATION_ERROR_CODES.NO_CORRECT_ANSWER]: 'Au moins une réponse correcte doit être sélectionnée',
  [VALIDATION_ERROR_CODES.DUPLICATE_ANSWERS]: 'Les réponses ne peuvent pas être identiques',
  [VALIDATION_ERROR_CODES.ANSWER_TEXT_REQUIRED]: 'Le texte de la réponse est obligatoire',
  [VALIDATION_ERROR_CODES.INVALID_POINTS]: 'Le nombre de points doit être un nombre positif',
  [VALIDATION_ERROR_CODES.INVALID_QUESTION_TYPE]: 'Le type de question sélectionné n\'est pas valide'
};

// Validation constraints
export const VALIDATION_CONSTRAINTS = {
  QUESTION_TEXT_MIN_LENGTH: 10,
  QUESTION_TEXT_MAX_LENGTH: 500,
  ANSWER_TEXT_MAX_LENGTH: 200,
  MIN_ANSWERS_FOR_MCQ: 2,
  MAX_ANSWERS_FOR_MCQ: 6,
  MIN_POINTS: 0.5,
  MAX_POINTS: 100
} as const;

// Helper function to create validation errors
export function createValidationError(
  field: string, 
  code: keyof typeof VALIDATION_ERROR_CODES, 
  customMessage?: string
): ValidationError {
  return {
    field,
    code,
    message: customMessage || VALIDATION_ERROR_MESSAGES[code] || 'Erreur de validation inconnue'
  };
}