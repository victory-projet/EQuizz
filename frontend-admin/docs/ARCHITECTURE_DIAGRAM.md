# Diagrammes d'Architecture

## Vue d'ensemble des couches

```
╔═══════════════════════════════════════════════════════════════╗
║                     PRESENTATION LAYER                         ║
║                                                                ║
║  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       ║
║  │   Features   │  │    Shared    │  │    Pages     │       ║
║  │  Components  │  │  Components  │  │   Layouts    │       ║
║  └──────────────┘  └──────────────┘  └──────────────┘       ║
║         │                  │                  │               ║
║         └──────────────────┴──────────────────┘               ║
║                            │                                  ║
╚════════════════════════════╪══════════════════════════════════╝
                             │ Injecte Use Cases
                             ↓
╔═══════════════════════════════════════════════════════════════╗
║                    APPLICATION LAYER                           ║
║                                                                ║
║  ┌────────────────────────────────────────────────────────┐  ║
║  │                     USE CASES                           │  ║
║  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │  ║
║  │  │ GetAllQuizzes│  │ CreateQuiz   │  │ DeleteQuiz  │  │  ║
║  │  │   UseCase    │  │   UseCase    │  │  UseCase    │  │  ║
║  │  └──────────────┘  └──────────────┘  └─────────────┘  │  ║
║  └────────────────────────────────────────────────────────┘  ║
║         │                  │                  │               ║
║         └──────────────────┴──────────────────┘               ║
║                            │                                  ║
║                            │ Utilise Interfaces               ║
╚════════════════════════════╪══════════════════════════════════╝
                             ↓
╔═══════════════════════════════════════════════════════════════╗
║                       DOMAIN LAYER                             ║
║                    (Cœur de l'application)                     ║
║                                                                ║
║  ┌──────────────────────┐      ┌──────────────────────┐      ║
║  │      ENTITIES        │      │  REPOSITORY INTERFACES│      ║
║  │                      │      │                       │      ║
║  │  ┌────────────────┐ │      │  interface            │      ║
║  │  │ Quiz           │ │      │  QuizRepository {     │      ║
║  │  │ - id           │ │      │    findAll()          │      ║
║  │  │ - title        │ │      │    findById()         │      ║
║  │  │ - description  │ │      │    save()             │      ║
║  │  │ + isValid()    │ │      │    delete()           │      ║
║  │  └────────────────┘ │      │  }                    │      ║
║  │                      │      │                       │      ║
║  │  ┌────────────────┐ │      │  interface            │      ║
║  │  │ Student        │ │      │  StudentRepository {  │      ║
║  │  │ - id           │ │      │    findAll()          │      ║
║  │  │ - name         │ │      │    findById()         │      ║
║  │  │ - email        │ │      │  }                    │      ║
║  │  └────────────────┘ │      │                       │      ║
║  └──────────────────────┘      └──────────────────────┘      ║
║                                         ↑                      ║
║                                         │ Implémente           ║
╚═════════════════════════════════════════╪════════════════════╝
                                          │
╔═══════════════════════════════════════════════════════════════╗
║                   INFRASTRUCTURE LAYER                         ║
║                                                                ║
║  ┌────────────────────────────────────────────────────────┐  ║
║  │           REPOSITORY IMPLEMENTATIONS                    │  ║
║  │  ┌──────────────────────────────────────────────────┐  │  ║
║  │  │ QuizHttpRepository implements QuizRepository     │  │  ║
║  │  │   - constructor(http: HttpClient)                │  │  ║
║  │  │   + findAll(): Observable<Quiz[]>               │  │  ║
║  │  │   + findById(id): Observable<Quiz>              │  │  ║
║  │  │   + save(quiz): Observable<Quiz>                │  │  ║
║  │  └──────────────────────────────────────────────────┘  │  ║
║  └────────────────────────────────────────────────────────┘  ║
║                                                                ║
║  ┌────────────────────────────────────────────────────────┐  ║
║  │                  HTTP SERVICES                          │  ║
║  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │  ║
║  │  │ Auth         │  │ Error        │  │ Logging     │  │  ║
║  │  │ Interceptor  │  │ Interceptor  │  │ Interceptor │  │  ║
║  │  └──────────────┘  └──────────────┘  └─────────────┘  │  ║
║  └────────────────────────────────────────────────────────┘  ║
║                                                                ║
║  ┌────────────────────────────────────────────────────────┐  ║
║  │                     GUARDS                              │  ║
║  │  ┌──────────────┐  ┌──────────────┐                    │  ║
║  │  │ Auth Guard   │  │ Role Guard   │                    │  ║
║  │  └──────────────┘  └──────────────┘                    │  ║
║  └────────────────────────────────────────────────────────┘  ║
╚═══════════════════════════════════════════════════════════════╝
```

## Flux de données - Exemple : Récupérer tous les quiz

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER ACTION                                              │
│    L'utilisateur clique sur "Voir les quiz"                │
└─────────────────────────────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. PRESENTATION                                             │
│    QuizListComponent.ngOnInit()                            │
│    └─→ getAllQuizzes.execute()                             │
└─────────────────────────────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. APPLICATION                                              │
│    GetAllQuizzesUseCase.execute()                          │
│    └─→ quizRepository.findAll()                            │
└─────────────────────────────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. INFRASTRUCTURE                                           │
│    QuizHttpRepository.findAll()                            │
│    └─→ http.get('/api/quizzes')                            │
└─────────────────────────────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. API BACKEND                                              │
│    GET /api/quizzes                                         │
│    └─→ Retourne JSON                                        │
└─────────────────────────────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. INFRASTRUCTURE                                           │
│    QuizHttpRepository.findAll()                            │
│    └─→ map(data => Quiz entities)                          │
└─────────────────────────────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. APPLICATION                                              │
│    GetAllQuizzesUseCase.execute()                          │
│    └─→ Retourne Observable<Quiz[]>                         │
└─────────────────────────────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. PRESENTATION                                             │
│    QuizListComponent                                        │
│    └─→ Affiche les quiz dans le template                   │
└─────────────────────────────────────────────────────────────┘
```

## Injection de Dépendances

```
┌─────────────────────────────────────────────────────────────┐
│                    main.ts                                  │
│  bootstrapApplication(App, {                                │
│    providers: [                                             │
│      ...applicationProviders                                │
│    ]                                                        │
│  })                                                         │
└─────────────────────────────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────────┐
│              config/providers.config.ts                     │
│  export const repositoryProviders = [                       │
│    {                                                        │
│      provide: QuizRepository,        ← Interface (Domain)  │
│      useClass: QuizHttpRepository    ← Implémentation      │
│    }                                                        │
│  ]                                                          │
└─────────────────────────────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────────┐
│         Angular Dependency Injection Container              │
│                                                             │
│  QuizRepository ──────→ QuizHttpRepository                 │
│  StudentRepository ───→ StudentHttpRepository              │
│  CourseRepository ────→ CourseHttpRepository               │
└─────────────────────────────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────────┐
│              Use Cases (Application)                        │
│                                                             │
│  @Injectable()                                              │
│  class GetAllQuizzesUseCase {                              │
│    constructor(                                             │
│      private repo: QuizRepository  ← Injecte l'interface   │
│    ) {}                                                     │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────────┐
│              Components (Presentation)                      │
│                                                             │
│  @Component()                                               │
│  class QuizListComponent {                                 │
│    constructor(                                             │
│      private getAllQuizzes: GetAllQuizzesUseCase           │
│    ) {}                                                     │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
```

## Règles de Dépendances Visuelles

```
┌──────────────────────────────────────────────────────────────┐
│                    RÈGLES AUTORISÉES                         │
└──────────────────────────────────────────────────────────────┘

Presentation ────────────→ Application ────────────→ Domain
                                ↑
Infrastructure ──────────────────┘


┌──────────────────────────────────────────────────────────────┐
│                    RÈGLES INTERDITES                         │
└──────────────────────────────────────────────────────────────┘

Domain ──✗──→ Application
Domain ──✗──→ Infrastructure
Domain ──✗──→ Presentation

Application ──✗──→ Infrastructure
Application ──✗──→ Presentation

Infrastructure ──✗──→ Presentation
```

## Organisation d'une Feature Complète

```
FEATURE: Quiz Management
│
├─ DOMAIN
│  ├─ entities/quiz.entity.ts
│  │  └─ class Quiz { id, title, description, questions }
│  │
│  └─ repositories/quiz.repository.interface.ts
│     └─ interface QuizRepository { findAll(), findById(), save() }
│
├─ APPLICATION
│  └─ use-cases/quiz/
│     ├─ get-all-quizzes.use-case.ts
│     ├─ get-quiz-by-id.use-case.ts
│     ├─ create-quiz.use-case.ts
│     ├─ update-quiz.use-case.ts
│     └─ delete-quiz.use-case.ts
│
├─ INFRASTRUCTURE
│  ├─ repositories/quiz.repository.ts
│  │  └─ class QuizHttpRepository implements QuizRepository
│  │
│  └─ mappers/quiz.mapper.ts
│     └─ QuizDTO ↔ Quiz Entity
│
└─ PRESENTATION
   └─ features/quiz-management/
      ├─ quiz-management.component.ts
      ├─ quiz-management.component.html
      ├─ quiz-management.component.scss
      └─ components/
         ├─ quiz-list/
         ├─ quiz-card/
         ├─ quiz-filters/
         └─ quiz-stats/
```

## Cycle de Vie d'une Requête

```
1. User clicks button
   │
   ↓
2. Component calls Use Case
   │  QuizListComponent.loadQuizzes()
   │  └─→ this.getAllQuizzes.execute()
   │
   ↓
3. Use Case orchestrates
   │  GetAllQuizzesUseCase.execute()
   │  └─→ this.quizRepository.findAll()
   │
   ↓
4. Repository makes HTTP call
   │  QuizHttpRepository.findAll()
   │  └─→ this.http.get('/api/quizzes')
   │
   ↓
5. HTTP Interceptors process
   │  AuthInterceptor adds token
   │  ErrorInterceptor handles errors
   │
   ↓
6. API responds
   │  Backend returns JSON data
   │
   ↓
7. Repository maps to Entity
   │  QuizHttpRepository.findAll()
   │  └─→ map(data => new Quiz(...))
   │
   ↓
8. Use Case returns Observable
   │  GetAllQuizzesUseCase.execute()
   │  └─→ Observable<Quiz[]>
   │
   ↓
9. Component updates view
   │  QuizListComponent
   │  └─→ this.quizzes = quizzes
   │
   ↓
10. Template renders
    │  *ngFor="let quiz of quizzes"
```
