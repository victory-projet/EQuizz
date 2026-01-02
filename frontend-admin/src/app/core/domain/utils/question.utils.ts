import { EnhancedQuestion, QuestionType, Answer, ValidationResult } from '../entities/question.entity';
import { 
  VALIDATION_ERROR_CODES, 
  VALIDATION_CONSTRAINTS, 
  createValidationError 
} from '../constants/question-validation.constants';

// Generate unique ID for questions and answers
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Create a new empty question
export function createEmptyQuestion(): Omit<EnhancedQuestion, 'id' | 'order'> {
  return {
    text: '',
    type: QuestionType.MULTIPLE_CHOICE,
    answers: [
      { id: generateId(), text: '', isCorrect: false, order: 0 },
      { id: generateId(), text: '', isCorrect: false, order: 1 }
    ],
    correctAnswerIds: [],
    points: 1,
    metadata: {
      difficulty: 'MEDIUM'
    }
  };
}

// Create a new empty answer
export function createEmptyAnswer(order: number): Answer {
  return {
    id: generateId(),
    text: '',
    isCorrect: false,
    order
  };
}

// Validate question data
export function validateQuestion(question: EnhancedQuestion): ValidationResult {
  const errors = [];

  // Validate question text
  if (!question.text || question.text.trim().length === 0) {
    errors.push(createValidationError('text', VALIDATION_ERROR_CODES.QUESTION_TEXT_REQUIRED));
  } else if (question.text.trim().length < VALIDATION_CONSTRAINTS.QUESTION_TEXT_MIN_LENGTH) {
    errors.push(createValidationError('text', VALIDATION_ERROR_CODES.QUESTION_TEXT_TOO_SHORT));
  } else if (question.text.length > VALIDATION_CONSTRAINTS.QUESTION_TEXT_MAX_LENGTH) {
    errors.push(createValidationError('text', VALIDATION_ERROR_CODES.QUESTION_TEXT_TOO_LONG));
  }

  // Validate question type
  if (!Object.values(QuestionType).includes(question.type)) {
    errors.push(createValidationError('type', VALIDATION_ERROR_CODES.INVALID_QUESTION_TYPE));
  }

  // Validate points
  if (question.points < VALIDATION_CONSTRAINTS.MIN_POINTS || question.points > VALIDATION_CONSTRAINTS.MAX_POINTS) {
    errors.push(createValidationError('points', VALIDATION_ERROR_CODES.INVALID_POINTS));
  }

  // Validate answers based on question type
  if (question.type === QuestionType.MULTIPLE_CHOICE || question.type === QuestionType.TRUE_FALSE) {
    // Check minimum number of answers
    if (question.answers.length < VALIDATION_CONSTRAINTS.MIN_ANSWERS_FOR_MCQ) {
      errors.push(createValidationError('answers', VALIDATION_ERROR_CODES.INSUFFICIENT_ANSWERS));
    }

    // Check for empty answer texts
    question.answers.forEach((answer, index) => {
      if (!answer.text || answer.text.trim().length === 0) {
        errors.push(createValidationError(`answers[${index}].text`, VALIDATION_ERROR_CODES.ANSWER_TEXT_REQUIRED));
      }
    });

    // Check for duplicate answers
    const answerTexts = question.answers.map(a => a.text.trim().toLowerCase());
    const uniqueAnswers = new Set(answerTexts);
    if (answerTexts.length !== uniqueAnswers.size) {
      errors.push(createValidationError('answers', VALIDATION_ERROR_CODES.DUPLICATE_ANSWERS));
    }

    // Check for at least one correct answer
    if (question.correctAnswerIds.length === 0) {
      errors.push(createValidationError('correctAnswerIds', VALIDATION_ERROR_CODES.NO_CORRECT_ANSWER));
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Update correct answer IDs based on answer isCorrect flags
export function updateCorrectAnswerIds(question: EnhancedQuestion): EnhancedQuestion {
  const correctAnswerIds = question.answers
    .filter(answer => answer.isCorrect)
    .map(answer => answer.id);

  return {
    ...question,
    correctAnswerIds
  };
}

// Reorder answers in a question
export function reorderAnswers(answers: Answer[], fromIndex: number, toIndex: number): Answer[] {
  const reorderedAnswers = [...answers];
  const [movedAnswer] = reorderedAnswers.splice(fromIndex, 1);
  reorderedAnswers.splice(toIndex, 0, movedAnswer);

  // Update order property
  return reorderedAnswers.map((answer, index) => ({
    ...answer,
    order: index
  }));
}

// Convert legacy Question to EnhancedQuestion
export function convertLegacyToEnhanced(legacyQuestion: any): EnhancedQuestion {
  const answers: Answer[] = [];
  
  if (legacyQuestion.options && Array.isArray(legacyQuestion.options)) {
    legacyQuestion.options.forEach((option: string, index: number) => {
      answers.push({
        id: generateId(),
        text: option,
        isCorrect: false, // Will be set based on bonneReponse
        order: index
      });
    });
  }

  // Set correct answer based on bonneReponse
  const correctAnswerIds: string[] = [];
  if (legacyQuestion.bonneReponse !== undefined && answers.length > 0) {
    if (typeof legacyQuestion.bonneReponse === 'number' && answers[legacyQuestion.bonneReponse]) {
      answers[legacyQuestion.bonneReponse].isCorrect = true;
      correctAnswerIds.push(answers[legacyQuestion.bonneReponse].id);
    }
  }

  // Map legacy question types to new enum
  const typeMapping: Record<string, QuestionType> = {
    'QCM': QuestionType.MULTIPLE_CHOICE,
    'VRAI_FAUX': QuestionType.TRUE_FALSE,
    'TEXTE_LIBRE': QuestionType.SHORT_ANSWER,
    'NUMERIQUE': QuestionType.SHORT_ANSWER,
    'OUI_NON': QuestionType.TRUE_FALSE,
    'ECHELLE': QuestionType.MULTIPLE_CHOICE
  };

  return {
    id: legacyQuestion.id?.toString() || generateId(),
    text: legacyQuestion.enonce || '',
    type: typeMapping[legacyQuestion.typeQuestion] || QuestionType.MULTIPLE_CHOICE,
    answers,
    correctAnswerIds,
    points: legacyQuestion.points || 1,
    order: legacyQuestion.ordre || 0,
    metadata: {
      difficulty: 'MEDIUM'
    }
  };
}

// Convert EnhancedQuestion to legacy format for API compatibility
export function convertEnhancedToLegacy(enhancedQuestion: EnhancedQuestion): any {
  const typeMapping: Record<QuestionType, string> = {
    [QuestionType.MULTIPLE_CHOICE]: 'QCM',
    [QuestionType.TRUE_FALSE]: 'VRAI_FAUX',
    [QuestionType.SHORT_ANSWER]: 'TEXTE_LIBRE',
    [QuestionType.ESSAY]: 'TEXTE_LIBRE'
  };

  const options = enhancedQuestion.answers.map(answer => answer.text);
  let bonneReponse: string | number | undefined;

  // Find the index of the first correct answer
  if (enhancedQuestion.correctAnswerIds.length > 0) {
    const correctAnswerId = enhancedQuestion.correctAnswerIds[0];
    const correctAnswerIndex = enhancedQuestion.answers.findIndex(a => a.id === correctAnswerId);
    if (correctAnswerIndex !== -1) {
      bonneReponse = correctAnswerIndex;
    }
  }

  return {
    id: enhancedQuestion.id,
    enonce: enhancedQuestion.text,
    typeQuestion: typeMapping[enhancedQuestion.type],
    type: typeMapping[enhancedQuestion.type], // Alias for compatibility
    options,
    bonneReponse,
    points: enhancedQuestion.points,
    ordre: enhancedQuestion.order
  };
}