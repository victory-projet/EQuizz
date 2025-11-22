# Structure du Projet - Clean Architecture

## Arborescence Complète

```
src/
├── app/
│   ├── core/                                    # COUCHE DOMAIN + APPLICATION
│   │   ├── domain/                              # 🔵 DOMAIN LAYER (Cœur métier)
│   │   │   ├── entities/                        # Entités métier pures
│   │   │   │   ├── academic-year.entity.ts
│   │   │   │   ├── class.entity.ts
│   │   │   │   ├── course.entity.ts
│   │   │   │   ├── quiz.entity.ts
│   │   │   │   ├── user.entity.ts
│   │   │   │   └── index.ts
│   │   │   ├── repositories/                    # Interfaces des repositories
│   │   │   │   ├── academic-year.repository.interface.ts
│   │   │   │   ├── auth.repository.interface.ts
│   │   │   │   ├── class.repository.interface.ts
│   │   │   │   ├── course.repository.interface.ts
│   │   │   │   ├── quiz.repository.interface.ts
│   │   │   │   └── index.ts
│   │   │   ├── services/                        # Services du domaine (logique métier)
│   │   │   └── README.md
│   │   │
│   │   └── application/                         # 🟢 APPLICATION LAYER (Use Cases)
│   │       ├── use-cases/                       # Cas d'usage
│   │       │   ├── academic-year/
│   │       │   ├── auth/
│   │       │   ├── class/
│   │       │   ├── course/
│   │       │   ├── quiz/
│   │       │   ├── index.ts
│   │       │   └── EXAMPLE_USE_CASE.md
│   │       ├── ports/                           # Interfaces pour l'infrastructure
│   │       ├── dto/                             # Data Transfer Objects
│   │       └── README.md
│   │
│   ├── infrastructure/                          # 🟡 INFRASTRUCTURE LAYER
│   │   ├── repositories/                        # Implémentations des repositories
│   │   │   ├── academic-year.repository.ts
│   │   │   ├── auth.repository.ts
│   │   │   ├── class.repository.ts
│   │   │   ├── course.repository.ts
│   │   │   ├── quiz.repository.ts
│   │   │   └── index.ts
│   │   ├── http/                                # Services HTTP et interceptors
│   │   │   ├── auth.interceptor.ts
│   │   │   ├── error.interceptor.ts
│   │   │   └── index.ts
│   │   ├── guards/                              # Guards Angular
│   │   │   ├── auth.guard.ts
│   │   │   └── index.ts
│   │   ├── storage/                             # Services de stockage
│   │   ├── mappers/                             # Mappers DTO ↔ Entity
│   │   └── README.md
│   │
│   ├── presentation/                            # 🔴 PRESENTATION LAYER (UI)
│   │   ├── features/                            # Modules fonctionnels
│   │   │   ├── academic-year/
│   │   │   ├── analytics/
│   │   │   ├── class-management/
│   │   │   ├── courses/
│   │   │   ├── dashboard/
│   │   │   ├── evaluation/
│   │   │   ├── quiz-creation/
│   │   │   ├── quiz-management/
│   │   │   │   ├── components/
│   │   │   │   │   ├── quiz-card/
│   │   │   │   │   ├── quiz-filters/
│   │   │   │   │   ├── quiz-list/
│   │   │   │   │   └── quiz-stats/
│   │   │   │   ├── quiz-management.component.ts
│   │   │   │   ├── quiz-management.component.html
│   │   │   │   └── quiz-management.component.scss
│   │   │   └── quiz-taking/
│   │   ├── shared/                              # Composants partagés
│   │   │   ├── components/
│   │   │   │   ├── class-details/
│   │   │   │   ├── class-form/
│   │   │   │   └── modals/
│   │   │   ├── pipes/
│   │   │   ├── directives/
│   │   │   ├── interfaces/
│   │   │   ├── styles/
│   │   │   └── examples/
│   │   ├── layouts/                             # Layouts de l'application
│   │   ├── pages/                               # Pages principales
│   │   │   ├── home/
│   │   │   ├── login/
│   │   │   └── error/
│   │   └── README.md
│   │
│   ├── config/                                  # ⚙️ CONFIGURATION
│   │   ├── app.config.ts                        # Configuration de l'app
│   │   ├── app.routes.ts                        # Routes
│   │   └── providers.config.ts                  # Providers DI
│   │
│   ├── app.ts                                   # Composant racine
│   ├── app.html
│   ├── app.scss
│   └── app.spec.ts
│
├── index.html
├── main.ts                                      # Point d'entrée
└── styles.scss

public/
├── assets/
└── favicon.ico

Configuration files:
├── angular.json
├── package.json
├── tsconfig.json
├── tsconfig.app.json                            # Avec path aliases
├── tsconfig.spec.json
├── .editorconfig
├── .gitignore
├── README.md
├── CLEAN_ARCHITECTURE.md                        # Documentation architecture
├── MIGRATION_GUIDE.md                           # Guide de migration
└── ARCHITECTURE_STRUCTURE.md                    # Ce fichier
```

## Flux de Dépendances

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  main.ts                                                     │
│    │                                                         │
│    ├─→ config/app.config.ts                                │
│    ├─→ config/app.routes.ts                                │
│    ├─→ config/providers.config.ts                          │
│    └─→ app.ts                                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  PRESENTATION LAYER                                          │
│                                                              │
│  features/quiz-management/quiz-management.component.ts       │
│    │                                                         │
│    └─→ Injecte: GetAllQuizzesUseCase                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  APPLICATION LAYER                                           │
│                                                              │
│  use-cases/quiz/get-all-quizzes.use-case.ts                │
│    │                                                         │
│    └─→ Dépend de: QuizRepository (interface)               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  DOMAIN LAYER                                                │
│                                                              │
│  repositories/quiz.repository.interface.ts                   │
│    │                                                         │
│    └─→ Définit: interface QuizRepository                   │
│                                                              │
│  entities/quiz.entity.ts                                    │
│    │                                                         │
│    └─→ Définit: class Quiz                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                          ↑
                          │ (implémente)
                          │
┌─────────────────────────────────────────────────────────────┐
│  INFRASTRUCTURE LAYER                                        │
│                                                              │
│  repositories/quiz.repository.ts                            │
│    │                                                         │
│    ├─→ Implémente: QuizRepository                          │
│    └─→ Utilise: HttpClient                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Règles de Dépendances

### ✅ Dépendances AUTORISÉES

```
Presentation  ──→  Application  ──→  Domain
                        ↑
Infrastructure  ────────┘
```

### ❌ Dépendances INTERDITES

```
Domain  ──✗──→  Application
Domain  ──✗──→  Infrastructure
Domain  ──✗──→  Presentation

Application  ──✗──→  Infrastructure
Application  ──✗──→  Presentation

Infrastructure  ──✗──→  Presentation
```

## Imports avec Alias

### Configuration (tsconfig.app.json)

```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@domain/*": ["src/app/core/domain/*"],
      "@application/*": ["src/app/core/application/*"],
      "@infrastructure/*": ["src/app/infrastructure/*"],
      "@presentation/*": ["src/app/presentation/*"],
      "@config/*": ["src/app/config/*"]
    }
  }
}
```

### Exemples d'imports

```typescript
// Domain
import { Quiz } from '@domain/entities/quiz.entity';
import { QuizRepository } from '@domain/repositories/quiz.repository.interface';

// Application
import { GetAllQuizzesUseCase } from '@application/use-cases/quiz/get-all-quizzes.use-case';

// Infrastructure
import { QuizHttpRepository } from '@infrastructure/repositories/quiz.repository';
import { authInterceptor } from '@infrastructure/http/auth.interceptor';

// Presentation
import { QuizListComponent } from '@presentation/features/quiz-management/components/quiz-list/quiz-list.component';

// Config
import { appConfig } from '@config/app.config';
import { routes } from '@config/app.routes';
```

## Responsabilités par Couche

### 🔵 Domain (Cœur métier)
- ✅ Définir les entités métier
- ✅ Définir les interfaces des repositories
- ✅ Contenir la logique métier pure
- ❌ Ne dépend de RIEN

### 🟢 Application (Orchestration)
- ✅ Implémenter les use cases
- ✅ Orchestrer la logique métier
- ✅ Définir les DTOs
- ❌ Dépend uniquement du Domain

### 🟡 Infrastructure (Technique)
- ✅ Implémenter les repositories
- ✅ Gérer les appels HTTP
- ✅ Gérer le stockage
- ❌ Implémente les interfaces du Domain

### 🔴 Presentation (UI)
- ✅ Afficher les données
- ✅ Gérer les interactions utilisateur
- ✅ Utiliser les use cases
- ❌ Dépend de l'Application

## Exemple Complet de Feature

### 1. Entity (Domain)
```typescript
// @domain/entities/quiz.entity.ts
export class Quiz {
  constructor(
    public readonly id: string,
    public title: string,
    public description: string
  ) {}
}
```

### 2. Repository Interface (Domain)
```typescript
// @domain/repositories/quiz.repository.interface.ts
export abstract class QuizRepository {
  abstract findAll(): Observable<Quiz[]>;
}
```

### 3. Use Case (Application)
```typescript
// @application/use-cases/quiz/get-all-quizzes.use-case.ts
@Injectable({ providedIn: 'root' })
export class GetAllQuizzesUseCase {
  constructor(private repo: QuizRepository) {}
  execute() { return this.repo.findAll(); }
}
```

### 4. Repository Implementation (Infrastructure)
```typescript
// @infrastructure/repositories/quiz.repository.ts
@Injectable({ providedIn: 'root' })
export class QuizHttpRepository implements QuizRepository {
  constructor(private http: HttpClient) {}
  findAll() { return this.http.get<Quiz[]>('/api/quizzes'); }
}
```

### 5. Component (Presentation)
```typescript
// @presentation/features/quiz-management/quiz-management.component.ts
@Component({ ... })
export class QuizManagementComponent {
  constructor(private getAllQuizzes: GetAllQuizzesUseCase) {}
  ngOnInit() {
    this.getAllQuizzes.execute().subscribe(quizzes => {
      this.quizzes = quizzes;
    });
  }
}
```

### 6. Provider Configuration (Config)
```typescript
// @config/providers.config.ts
export const repositoryProviders = [
  { provide: QuizRepository, useClass: QuizHttpRepository }
];
```

## Avantages de cette Structure

✅ **Testabilité** : Chaque couche testable indépendamment
✅ **Maintenabilité** : Séparation claire des responsabilités
✅ **Flexibilité** : Changement facile d'implémentation
✅ **Scalabilité** : Structure claire pour faire grandir l'app
✅ **Indépendance** : Le métier ne dépend pas du framework
