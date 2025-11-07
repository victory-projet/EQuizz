# Design Document - EQuizz Complete Features

## Overview

Ce document décrit l'architecture et le design technique pour l'implémentation des fonctionnalités avancées d'EQuizz.

## Architecture

### Structure des Modules

```
src/app/
├── core/
│   ├── services/
│   │   ├── quiz.service.ts
│   │   ├── ue.service.ts
│   │   ├── class.service.ts
│   │   ├── analytics.service.ts
│   │   ├── export.service.ts
│   │   ├── toast.service.ts
│   │   └── cache.service.ts
│
├── features/
│   ├── quiz-management/
│   │   ├── components/
│   │   │   ├── quiz-editor/
│   │   │   ├── quiz-preview/
│   │   │   ├── question-editor/
│   │   │   └── question-list/
│   │
│   ├── analytics/
│   │   ├── components/
│   │   │   ├── performance-chart/
│   │   │   ├── participation-stats/
│   │   │   └── export-panel/
│   │
│   ├── ue-management/
│   │   ├── components/
│   │   │   ├── ue-list/
│   │   │   └── ue-form/
│   │
│   └── class-management/
│       ├── components/
│       │   ├── class-list/
│       │   ├── class-form/
│       │   └── student-assignment/
│
└── shared/
    ├── components/
    │   ├── toast/
    │   ├── loading-skeleton/
    │   ├── confirm-dialog/
    │   ├── pagination/
    │   └── mobile-menu/
    └── interfaces/
```

## Components and Interfaces

### Quiz Editor Component

Responsabilité: Créer et éditer des quiz avec gestion complète des questions

Interface TypeScript:
```typescript
interface QuizEditorComponent {
  quiz: Quiz;
  questions: Question[];
  isEditMode: boolean;
  
  addQuestion(type: QuestionType): void;
  removeQuestion(index: number): void;
  saveQuiz(): void;
  previewQuiz(): void;
}
```

### Question Types

- QCM (multiple): Texte + 2-6 options + réponse correcte
- Fermée (close): Texte + réponse attendue
- Ouverte (open): Texte seulement

## Data Models

### Extended Quiz Interface

```typescript
interface Quiz {
  id: string;
  title: string;
  status: 'draft' | 'active' | 'completed' | 'closed';
  ue: string;
  ueId: string;
  questionsCount: number;
  questions?: Question[];
  participation: {
    current: number;
    total: number;
    rate: number;
  };
  classes: string[];
  classIds: string[];
  createdAt: Date;
  updatedAt: Date;
  endDate: Date;
  type: 'mi-parcours' | 'fin-semestre' | 'fin-annee';
  duration?: number;
  passingScore?: number;
}
```

### Question Interface

```typescript
interface Question {
  id: string;
  quizId: string;
  type: 'multiple' | 'close' | 'open';
  text: string;
  order: number;
  points: number;
  options?: QuestionOption[];
  correctAnswer?: string | number;
  explanation?: string;
  createdAt: Date;
}
```

## Services

### Quiz Service (Extended)

```typescript
@Injectable({ providedIn: 'root' })
export class QuizService {
  // CRUD
  getQuizzes(): Observable<Quiz[]>;
  getQuizById(id: string): Observable<Quiz>;
  createQuiz(quiz: Omit<Quiz, 'id'>): Observable<Quiz>;
  updateQuiz(id: string, updates: Partial<Quiz>): Observable<Quiz>;
  deleteQuiz(id: string): Observable<void>;
  
  // Questions
  addQuestion(quizId: string, question: Question): Observable<Question>;
  updateQuestion(questionId: string, updates: Partial<Question>): Observable<Question>;
  deleteQuestion(questionId: string): Observable<void>;
  
  // Status
  publishQuiz(id: string): Observable<Quiz>;
  unpublishQuiz(id: string): Observable<Quiz>;
}
```

### Toast Service

```typescript
@Injectable({ providedIn: 'root' })
export class ToastService {
  success(message: string, duration = 3000): void;
  error(message: string, duration = 5000): void;
  warning(message: string, duration = 4000): void;
  info(message: string, duration = 3000): void;
}
```

### Export Service

```typescript
@Injectable({ providedIn: 'root' })
export class ExportService {
  exportToPDF(data: any, filename: string): Observable<Blob>;
  exportToExcel(data: any, filename: string): Observable<Blob>;
}
```

Libraries: jsPDF, xlsx

## Responsive Design

### Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Mobile Menu

- Menu burger visible < 768px
- Sidebar en overlay avec backdrop
- Animation slide-in/slide-out

## Performance Optimizations

### Lazy Loading Routes

```typescript
export const routes: Routes = [
  {
    path: 'quiz-management',
    loadComponent: () => import('./features/quiz-management/quiz-management')
  },
  {
    path: 'analytics',
    loadComponent: () => import('./features/analytics/analytics')
  }
];
```

### Pagination

- 20 items par page
- Navigation page par page
- Affichage du total

### Cache Strategy

- Cache des données pendant 5 minutes
- Invalidation au CRUD
- Utilisation de BehaviorSubject

## UX/UI Enhancements

### Loading States

- Skeleton loaders pour les listes
- Spinners pour les actions
- Progress bars pour les exports

### Animations

- Fade in/out pour les transitions
- Slide in pour les modales
- Scale pour les confirmations

### Toast Notifications

- Position: Top-right
- Duration: 3-5 secondes
- Types: Success, Error, Warning, Info

## Error Handling

### Validation Messages

```typescript
const messages = {
  required: 'Ce champ est requis',
  email: 'Format email invalide',
  minlength: 'Minimum {n} caractères'
};
```

### HTTP Errors

- 0: Erreur de connexion
- 404: Ressource non trouvée
- 500: Erreur serveur
- Autres: Message personnalisé

## Dependencies

```json
{
  "dependencies": {
    "jspdf": "^2.5.1",
    "jspdf-autotable": "^3.8.0",
    "xlsx": "^0.18.5",
    "@angular/cdk": "^17.0.0"
  }
}
```

## Implementation Priority

1. Quiz CRUD Complet
2. UX/UI (Toast, Dialogs, Loading)
3. Analytics & Export
4. UE/Classes Management
5. Performance Optimizations
6. Responsive Design
