// Enhanced Question Entity for Quiz Creation Step 2 Improvement
// Maintains backward compatibility with existing structure

// Legacy interface for backward compatibility
export interface Question {
  id?: string | number;
  enonce: string;
  typeQuestion: 'QCM' | 'VRAI_FAUX' | 'TEXTE_LIBRE' | 'NUMERIQUE' | 'OUI_NON' | 'ECHELLE';
  type?: 'QCM' | 'VRAI_FAUX' | 'TEXTE_LIBRE' | 'NUMERIQUE' | 'OUI_NON' | 'ECHELLE'; // Alias for compatibility
  options?: string[];
  bonneReponse?: string | number;
  points?: number;
  ordre: number;
  quizz_id?: string | number;
  quizzId?: string | number;
  explication?: string;
  obligatoire?: boolean;
}

// Enhanced Question interface for manual creation
export interface EnhancedQuestion {
  id: string;
  text: string;
  type: QuestionType;
  answers: Answer[];
  correctAnswerIds: string[];
  points: number;
  order: number;
  metadata?: QuestionMetadata;
}

// Answer interface for enhanced questions
export interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

// Question types enumeration
export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  SHORT_ANSWER = 'SHORT_ANSWER',
  ESSAY = 'ESSAY'
}

// Question metadata for additional information
export interface QuestionMetadata {
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  category?: string;
  estimatedTime?: number; // en minutes
}

// Validation interfaces
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// Legacy interfaces for backward compatibility
export interface QuestionFormData {
  enonce: string;
  typeQuestion: 'QCM' | 'VRAI_FAUX' | 'TEXTE_LIBRE' | 'NUMERIQUE' | 'OUI_NON' | 'ECHELLE';
  options?: string[];
  bonneReponse?: string | number;
  points?: number;
  ordre: number;
}

export interface QuestionImportData {
  questions: Question[];
  errors?: string[];
  warnings?: string[];
}

// Enhanced form data for manual creation
export interface EnhancedQuestionFormData {
  text: string;
  type: QuestionType;
  answers: Omit<Answer, 'id'>[];
  points: number;
  metadata?: Omit<QuestionMetadata, 'category'>;
}

// Utility type for creating new questions
export type CreateQuestionData = Omit<EnhancedQuestion, 'id' | 'order'>;

// Utility type for updating questions
export type UpdateQuestionData = Partial<Omit<EnhancedQuestion, 'id'>>;