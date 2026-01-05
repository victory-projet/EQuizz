# Design Document

## Overview

Cette conception améliore l'étape 2 du processus de création de quiz dans l'application EQuizz en introduisant une interface claire avec deux options distinctes : création manuelle et import Excel. L'accent est mis sur la création d'une interface de création manuelle dédiée qui reste dans le contexte de création de questions sans distractions externes.

L'amélioration s'intègre dans l'architecture Angular existante en utilisant les patterns établis : composants standalone, signals pour la gestion d'état, et services pour la logique métier.

## Architecture

### Architecture Existante
L'application utilise une architecture Clean Architecture avec :
- **Presentation Layer** : Composants Angular avec signals
- **Domain Layer** : Entités et cas d'usage
- **Infrastructure Layer** : Services HTTP et repositories

### Modifications Architecturales
1. **Nouveau composant** : `QuestionManualCreationComponent` pour l'interface de création manuelle
2. **Extension du composant existant** : `EvaluationCreateComponent` pour intégrer les nouvelles options
3. **Nouveau service** : `QuestionCreationService` pour la gestion des questions en création

## Components and Interfaces

### 1. EvaluationCreateComponent (Modifié)
```typescript
interface MethodSelectionModal {
  showMethodModal: signal<boolean>;
  selectManualCreation(): void;
  selectExcelImport(): void;
  closeMethodModal(): void;
}
```

**Responsabilités** :
- Afficher les deux options (création manuelle / import Excel)
- Gérer la navigation vers l'interface appropriée
- Maintenir l'état du modal de sélection

### 2. QuestionManualCreationComponent (Nouveau)
```typescript
interface QuestionManualCreationComponent {
  // État des questions
  questions: signal<Question[]>;
  currentQuestion: signal<Question | null>;
  isEditing: signal<boolean>;
  
  // Gestion des questions
  addQuestion(): void;
  editQuestion(questionId: string): void;
  deleteQuestion(questionId: string): void;
  saveQuestion(question: Question): void;
  reorderQuestions(fromIndex: number, toIndex: number): void;
  
  // Navigation
  goToPreviousStep(): void;
  goToNextStep(): void;
  saveProgress(): void;
  cancel(): void;
  
  // Validation
  validateQuestion(question: Question): ValidationResult;
  canProceedToNextStep(): boolean;
}
```

**Responsabilités** :
- Interface dédiée à la création manuelle de questions
- Gestion de l'état des questions (ajout, modification, suppression)
- Validation des données de questions
- Navigation contextuelle

### 3. QuestionFormComponent (Nouveau)
```typescript
interface QuestionFormComponent {
  question: signal<Question>;
  questionTypes: signal<QuestionType[]>;
  
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
```

**Responsabilités** :
- Formulaire de création/édition d'une question
- Gestion des types de questions (QCM, Vrai/Faux, etc.)
- Validation des données de question

## Data Models

### Question Entity
```typescript
interface Question {
  id: string;
  text: string;
  type: QuestionType;
  answers: Answer[];
  correctAnswerIds: string[];
  points: number;
  order: number;
  metadata?: QuestionMetadata;
}

interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  SHORT_ANSWER = 'SHORT_ANSWER',
  ESSAY = 'ESSAY'
}

interface QuestionMetadata {
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  category?: string;
  estimatedTime?: number; // en minutes
}
```

### Validation Models
```typescript
interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

interface ValidationError {
  field: string;
  message: string;
  code: string;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Option Selection Navigation
*For any* user interaction with the method selection modal, selecting manual creation should navigate to the manual creation interface, and selecting Excel import should navigate to the Excel import interface
**Validates: Requirements 1.2, 1.3**

### Property 2: Question Creation Persistence
*For any* valid question data, adding it to the question list should result in the question being stored and retrievable from the list
**Validates: Requirements 2.3**

### Property 3: Question Validation Consistency
*For any* question creation attempt, the system should validate the question data and only save valid questions
**Validates: Requirements 2.5**

### Property 4: Interface Context Isolation
*For any* element displayed in the manual creation interface, it should be related only to question creation functionality
**Validates: Requirements 3.1, 3.2, 3.3**

### Property 5: Question Focus Management
*For any* question being edited, the system should maintain visual focus on that question throughout the editing process
**Validates: Requirements 3.4**

### Property 6: Question Edit Functionality
*For any* existing question, selecting it should enable editing of all its properties
**Validates: Requirements 4.2**

### Property 7: Question Delete Availability
*For any* created question, a delete option should be available and functional
**Validates: Requirements 4.3**

### Property 8: Immediate Question Updates
*For any* question modification, the changes should be reflected immediately in the interface
**Validates: Requirements 4.4**

### Property 9: Question Order Management
*For any* set of questions, the system should maintain their order and allow reordering when requested
**Validates: Requirements 4.5**

### Property 10: Conditional Navigation
*For any* attempt to proceed to the next step, navigation should only succeed if valid questions exist
**Validates: Requirements 5.3**

### Property 11: Progress Saving
*For any* save action, the current state of questions should be persisted
**Validates: Requirements 5.4**

## Error Handling

### Validation Errors
- **Question Text Required** : Message d'erreur si le texte de la question est vide
- **Insufficient Answers** : Erreur si moins de 2 réponses pour un QCM
- **No Correct Answer** : Erreur si aucune réponse correcte n'est sélectionnée
- **Duplicate Answers** : Avertissement si des réponses identiques sont détectées

### Navigation Errors
- **No Questions Created** : Empêcher la navigation si aucune question n'est créée
- **Unsaved Changes** : Avertir l'utilisateur des modifications non sauvegardées

### System Errors
- **Save Failure** : Gestion des erreurs de sauvegarde avec retry automatique
- **Load Failure** : Récupération gracieuse en cas d'échec de chargement

## Testing Strategy

### Unit Tests
- Validation des composants individuels
- Test des méthodes de gestion des questions
- Validation des formulaires
- Test des cas d'erreur spécifiques

### Property-Based Tests
Les tests basés sur les propriétés utiliseront **fast-check** (bibliothèque PBT pour TypeScript/JavaScript) avec un minimum de 100 itérations par test.

Chaque test de propriété sera tagué avec le format : `**Feature: quiz-creation-step2-improvement, Property {number}: {property_text}**`

Les tests de propriétés valideront :
- La cohérence de la navigation entre les interfaces
- La persistance et la récupération des questions
- La validation des données de questions
- L'isolation du contexte de l'interface
- La gestion de l'état des questions

### Integration Tests
- Test du flux complet de création de questions
- Test de l'intégration avec l'API backend
- Test de la navigation entre les étapes
- Test de la sauvegarde et récupération des brouillons

### End-to-End Tests
- Parcours utilisateur complet de création de quiz
- Test des interactions avec les différentes interfaces
- Validation de l'expérience utilisateur globale