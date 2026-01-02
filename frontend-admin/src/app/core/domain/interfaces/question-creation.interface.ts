import { Signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { EnhancedQuestion, QuestionType, ValidationResult, Answer } from '../entities/question.entity';

// Interface for QuestionManualCreationComponent
export interface QuestionManualCreationComponent {
  // État des questions
  questions: Signal<EnhancedQuestion[]>;
  currentQuestion: Signal<EnhancedQuestion | null>;
  isEditing: Signal<boolean>;
  
  // Gestion des questions
  addQuestion(): void;
  editQuestion(questionId: string): void;
  deleteQuestion(questionId: string): void;
  saveQuestion(question: EnhancedQuestion): void;
  reorderQuestions(fromIndex: number, toIndex: number): void;
  
  // Navigation
  goToPreviousStep(): void;
  goToNextStep(): void;
  saveProgress(): void;
  cancel(): void;
  
  // Validation
  validateQuestion(question: EnhancedQuestion): ValidationResult;
  canProceedToNextStep(): boolean;
}

// Interface for QuestionFormComponent
export interface QuestionFormComponent {
  question: Signal<EnhancedQuestion>;
  questionTypes: Signal<QuestionType[]>;
  
  // Formulaire
  questionForm: FormGroup;
  
  // Gestion des réponses
  addAnswer(): void;
  removeAnswer(index: number): void;
  setCorrectAnswer(index: number): void;
  
  // Validation
  validateForm(): boolean;
  getFormErrors(): string[];
}

// Interface for MethodSelectionModal
export interface MethodSelectionModal {
  showMethodModal: Signal<boolean>;
  selectManualCreation(): void;
  selectExcelImport(): void;
  closeMethodModal(): void;
}

// Interface for question creation service
export interface QuestionCreationService {
  // CRUD operations
  createQuestion(questionData: Omit<EnhancedQuestion, 'id' | 'order'>): EnhancedQuestion;
  getQuestion(id: string): EnhancedQuestion | null;
  updateQuestion(id: string, updates: Partial<EnhancedQuestion>): EnhancedQuestion;
  deleteQuestion(id: string): boolean;
  
  // List operations
  getAllQuestions(): EnhancedQuestion[];
  reorderQuestions(fromIndex: number, toIndex: number): void;
  clearAllQuestions(): void;
  
  // Validation
  validateQuestion(question: EnhancedQuestion): ValidationResult;
  
  // Persistence
  saveProgress(): void;
  loadProgress(): EnhancedQuestion[];
}

// Types for question creation state
export interface QuestionCreationState {
  questions: EnhancedQuestion[];
  currentQuestionId: string | null;
  isEditing: boolean;
  hasUnsavedChanges: boolean;
}

// Types for question form state
export interface QuestionFormState {
  isValid: boolean;
  isDirty: boolean;
  errors: string[];
  currentQuestion: EnhancedQuestion | null;
}