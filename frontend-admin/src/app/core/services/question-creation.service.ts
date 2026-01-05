import { Injectable, signal, computed } from '@angular/core';
import { BehaviorSubject, Observable, timer, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

// Data Models based on design document
export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  answers: Answer[];
  correctAnswerIds: string[];
  points: number;
  order: number;
  metadata?: QuestionMetadata;
}

export interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  SHORT_ANSWER = 'SHORT_ANSWER',
  ESSAY = 'ESSAY'
}

export interface QuestionMetadata {
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  category?: string;
  estimatedTime?: number; // en minutes
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface QuestionDraft {
  questions: Question[];
  lastSaved: Date;
  evaluationId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class QuestionCreationService {
  // State management with signals
  private _questions = signal<Question[]>([]);
  private _currentQuestion = signal<Question | null>(null);
  private _isLoading = signal<boolean>(false);
  private _lastSaved = signal<Date | null>(null);

  // Auto-save functionality
  private autoSaveSubscription?: Subscription;
  private questionsSubject = new BehaviorSubject<Question[]>([]);
  private readonly AUTO_SAVE_DELAY = 2000; // 2 seconds

  // Public signals
  public readonly questions = this._questions.asReadonly();
  public readonly currentQuestion = this._currentQuestion.asReadonly();
  public readonly isLoading = this._isLoading.asReadonly();
  public readonly lastSaved = this._lastSaved.asReadonly();

  // Computed signals
  public readonly questionCount = computed(() => this._questions().length);
  public readonly hasQuestions = computed(() => this._questions().length > 0);
  public readonly canProceedToNextStep = computed(() => this.hasQuestions() && this.validateAllQuestions().isValid);

  constructor() {
    this.initializeAutoSave();
    this.loadDraftFromStorage();
  }

  // CRUD Operations

  /**
   * Create a new question
   */
  createQuestion(questionData: Partial<Question>): Question {
    const newQuestion: Question = {
      id: this.generateId(),
      text: questionData.text || '',
      type: questionData.type || QuestionType.MULTIPLE_CHOICE,
      answers: questionData.answers || [],
      correctAnswerIds: questionData.correctAnswerIds || [],
      points: questionData.points || 1,
      order: questionData.order ?? this._questions().length + 1,
      metadata: questionData.metadata
    };

    const validationResult = this.validateQuestion(newQuestion);
    if (!validationResult.isValid) {
      throw new Error(`Invalid question data: ${validationResult.errors.map(e => e.message).join(', ')}`);
    }

    const currentQuestions = this._questions();
    this._questions.set([...currentQuestions, newQuestion]);
    this.triggerAutoSave();

    return newQuestion;
  }

  /**
   * Read/Get a question by ID
   */
  getQuestion(id: string): Question | null {
    return this._questions().find(q => q.id === id) || null;
  }

  /**
   * Get all questions
   */
  getAllQuestions(): Question[] {
    return [...this._questions()];
  }

  /**
   * Update an existing question
   */
  updateQuestion(id: string, updates: Partial<Question>): Question {
    const currentQuestions = this._questions();
    const questionIndex = currentQuestions.findIndex(q => q.id === id);
    
    if (questionIndex === -1) {
      throw new Error(`Question with id ${id} not found`);
    }

    const updatedQuestion: Question = {
      ...currentQuestions[questionIndex],
      ...updates,
      id // Ensure ID cannot be changed
    };

    const validationResult = this.validateQuestion(updatedQuestion);
    if (!validationResult.isValid) {
      throw new Error(`Invalid question data: ${validationResult.errors.map(e => e.message).join(', ')}`);
    }

    const newQuestions = [...currentQuestions];
    newQuestions[questionIndex] = updatedQuestion;
    
    this._questions.set(newQuestions);
    this.triggerAutoSave();

    return updatedQuestion;
  }

  /**
   * Delete a question
   */
  deleteQuestion(id: string): boolean {
    const currentQuestions = this._questions();
    const questionIndex = currentQuestions.findIndex(q => q.id === id);
    
    if (questionIndex === -1) {
      return false;
    }

    const newQuestions = currentQuestions.filter(q => q.id !== id);
    
    // Reorder remaining questions
    const reorderedQuestions = newQuestions.map((q, index) => ({
      ...q,
      order: index + 1
    }));

    this._questions.set(reorderedQuestions);
    this.triggerAutoSave();

    return true;
  }

  // Question Order Management

  /**
   * Reorder questions
   */
  reorderQuestions(fromIndex: number, toIndex: number): void {
    const currentQuestions = [...this._questions()];
    
    if (fromIndex < 0 || fromIndex >= currentQuestions.length || 
        toIndex < 0 || toIndex >= currentQuestions.length) {
      throw new Error('Invalid indices for reordering');
    }

    // Move the question
    const [movedQuestion] = currentQuestions.splice(fromIndex, 1);
    currentQuestions.splice(toIndex, 0, movedQuestion);

    // Update order property for all questions
    const reorderedQuestions = currentQuestions.map((question, index) => ({
      ...question,
      order: index + 1
    }));

    this._questions.set(reorderedQuestions);
    this.triggerAutoSave();
  }

  /**
   * Move question up in order
   */
  moveQuestionUp(id: string): boolean {
    const currentQuestions = this._questions();
    const questionIndex = currentQuestions.findIndex(q => q.id === id);
    
    if (questionIndex <= 0) {
      return false; // Already at top or not found
    }

    this.reorderQuestions(questionIndex, questionIndex - 1);
    return true;
  }

  /**
   * Move question down in order
   */
  moveQuestionDown(id: string): boolean {
    const currentQuestions = this._questions();
    const questionIndex = currentQuestions.findIndex(q => q.id === id);
    
    if (questionIndex === -1 || questionIndex >= currentQuestions.length - 1) {
      return false; // Not found or already at bottom
    }

    this.reorderQuestions(questionIndex, questionIndex + 1);
    return true;
  }

  // Validation

  /**
   * Validate a single question
   */
  validateQuestion(question: Question): ValidationResult {
    const errors: ValidationError[] = [];

    // Validate question text
    if (!question.text || question.text.trim().length === 0) {
      errors.push({
        field: 'text',
        message: 'Le texte de la question est obligatoire',
        code: 'REQUIRED_FIELD'
      });
    }

    if (question.text && question.text.length > 500) {
      errors.push({
        field: 'text',
        message: 'Le texte de la question ne peut pas dépasser 500 caractères',
        code: 'MAX_LENGTH_EXCEEDED'
      });
    }

    // Validate question type
    if (!Object.values(QuestionType).includes(question.type)) {
      errors.push({
        field: 'type',
        message: 'Type de question invalide',
        code: 'INVALID_TYPE'
      });
    }

    // Validate answers based on question type
    if (question.type === QuestionType.MULTIPLE_CHOICE) {
      if (!question.answers || question.answers.length < 2) {
        errors.push({
          field: 'answers',
          message: 'Au moins 2 réponses sont requises pour un choix multiple',
          code: 'INSUFFICIENT_ANSWERS'
        });
      }

      if (question.correctAnswerIds.length === 0) {
        errors.push({
          field: 'correctAnswerIds',
          message: 'Au moins une réponse correcte doit être sélectionnée',
          code: 'NO_CORRECT_ANSWER'
        });
      }

      // Check for duplicate answers
      const answerTexts = question.answers.map(a => a.text.trim().toLowerCase());
      const uniqueAnswers = new Set(answerTexts);
      if (answerTexts.length !== uniqueAnswers.size) {
        errors.push({
          field: 'answers',
          message: 'Les réponses ne peuvent pas être identiques',
          code: 'DUPLICATE_ANSWERS'
        });
      }
    }

    if (question.type === QuestionType.TRUE_FALSE) {
      if (question.answers.length !== 2) {
        errors.push({
          field: 'answers',
          message: 'Exactement 2 réponses sont requises pour Vrai/Faux',
          code: 'INVALID_ANSWER_COUNT'
        });
      }

      if (question.correctAnswerIds.length !== 1) {
        errors.push({
          field: 'correctAnswerIds',
          message: 'Exactement une réponse correcte doit être sélectionnée pour Vrai/Faux',
          code: 'INVALID_CORRECT_ANSWER_COUNT'
        });
      }
    }

    // Validate points
    if (question.points <= 0) {
      errors.push({
        field: 'points',
        message: 'Le nombre de points doit être supérieur à 0',
        code: 'INVALID_POINTS'
      });
    }

    // Validate order
    if (question.order <= 0) {
      errors.push({
        field: 'order',
        message: 'L\'ordre doit être supérieur à 0',
        code: 'INVALID_ORDER'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate all questions
   */
  validateAllQuestions(): ValidationResult {
    const allErrors: ValidationError[] = [];
    const questions = this._questions();

    if (questions.length === 0) {
      allErrors.push({
        field: 'questions',
        message: 'Au moins une question est requise',
        code: 'NO_QUESTIONS'
      });
    }

    questions.forEach((question, index) => {
      const result = this.validateQuestion(question);
      if (!result.isValid) {
        result.errors.forEach(error => {
          allErrors.push({
            ...error,
            field: `question[${index}].${error.field}`,
            message: `Question ${index + 1}: ${error.message}`
          });
        });
      }
    });

    return {
      isValid: allErrors.length === 0,
      errors: allErrors
    };
  }

  // Auto-save functionality

  /**
   * Initialize auto-save mechanism
   */
  private initializeAutoSave(): void {
    this.autoSaveSubscription = this.questionsSubject.pipe(
      debounceTime(this.AUTO_SAVE_DELAY),
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
    ).subscribe(questions => {
      this.saveDraftToStorage(questions);
    });
  }

  /**
   * Trigger auto-save
   */
  private triggerAutoSave(): void {
    this.questionsSubject.next(this._questions());
  }

  /**
   * Manually save progress
   */
  saveProgress(): void {
    const questions = this._questions();
    this.saveDraftToStorage(questions);
    this._lastSaved.set(new Date());
  }

  /**
   * Save draft to local storage
   */
  private saveDraftToStorage(questions: Question[]): void {
    const draft: QuestionDraft = {
      questions,
      lastSaved: new Date()
    };

    try {
      localStorage.setItem('questionCreationDraft', JSON.stringify(draft));
      this._lastSaved.set(draft.lastSaved);
    } catch (error) {
      console.error('Failed to save draft to storage:', error);
    }
  }

  /**
   * Load draft from local storage
   */
  private loadDraftFromStorage(): void {
    try {
      const draftJson = localStorage.getItem('questionCreationDraft');
      if (draftJson) {
        const draft: QuestionDraft = JSON.parse(draftJson);
        this._questions.set(draft.questions || []);
        this._lastSaved.set(new Date(draft.lastSaved));
      }
    } catch (error) {
      console.error('Failed to load draft from storage:', error);
    }
  }

  /**
   * Clear draft from storage
   */
  clearDraft(): void {
    try {
      localStorage.removeItem('questionCreationDraft');
      this._questions.set([]);
      this._lastSaved.set(null);
    } catch (error) {
      console.error('Failed to clear draft from storage:', error);
    }
  }

  // Utility methods

  /**
   * Generate unique ID for questions and answers
   */
  private generateId(): string {
    return `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create a default answer
   */
  createDefaultAnswer(order: number = 1): Answer {
    return {
      id: this.generateId(),
      text: '',
      isCorrect: false,
      order
    };
  }

  /**
   * Create a default question
   */
  createDefaultQuestion(type: QuestionType = QuestionType.MULTIPLE_CHOICE): Partial<Question> {
    const baseQuestion: Partial<Question> = {
      text: '',
      type,
      points: 1,
      order: this._questions().length + 1
    };

    switch (type) {
      case QuestionType.MULTIPLE_CHOICE:
        baseQuestion.answers = [
          this.createDefaultAnswer(1),
          this.createDefaultAnswer(2)
        ];
        baseQuestion.correctAnswerIds = [];
        break;
      
      case QuestionType.TRUE_FALSE:
        baseQuestion.answers = [
          { id: this.generateId(), text: 'Vrai', isCorrect: false, order: 1 },
          { id: this.generateId(), text: 'Faux', isCorrect: false, order: 2 }
        ];
        baseQuestion.correctAnswerIds = [];
        break;
      
      case QuestionType.SHORT_ANSWER:
      case QuestionType.ESSAY:
        baseQuestion.answers = [];
        baseQuestion.correctAnswerIds = [];
        break;
    }

    return baseQuestion;
  }

  /**
   * Reset service state
   */
  reset(): void {
    this._questions.set([]);
    this._currentQuestion.set(null);
    this._lastSaved.set(null);
    this.clearDraft();
  }

  /**
   * Set current question for editing
   */
  setCurrentQuestion(questionId: string | null): void {
    if (questionId === null) {
      this._currentQuestion.set(null);
      return;
    }

    const question = this.getQuestion(questionId);
    this._currentQuestion.set(question);
  }

  /**
   * Get questions sorted by order
   */
  getQuestionsSortedByOrder(): Question[] {
    return [...this._questions()].sort((a, b) => a.order - b.order);
  }

  /**
   * Cleanup resources
   */
  ngOnDestroy(): void {
    if (this.autoSaveSubscription) {
      this.autoSaveSubscription.unsubscribe();
    }
  }
}