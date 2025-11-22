# Clean Architecture - Structure du Projet

## Vue d'ensemble

Ce projet suit les principes de la Clean Architecture avec une séparation stricte en 3 couches :

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION                          │
│  (UI Components, Pages, State Management)               │
│                                                          │
│  Dépend de ↓                                            │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    APPLICATION                           │
│  (Use Cases, Business Logic, Ports)                     │
│                                                          │
│  Dépend de ↓                                            │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                      DOMAIN                              │
│  (Entities, Value Objects, Domain Services)             │
│                                                          │
│  Ne dépend de RIEN                                      │
└─────────────────────────────────────────────────────────┘
                          ↑
┌─────────────────────────────────────────────────────────┐
│                  INFRASTRUCTURE                          │
│  (Repositories, HTTP, External Services)                │
│                                                          │
│  Dépend de → Domain & Application                       │
└─────────────────────────────────────────────────────────┘
```

## Structure des Dossiers

### 1. `/core/domain/` - Couche Domain (Cœur métier)
**Règle d'or : Ne dépend de RIEN**

- `entities/` : Entités métier pures (classes TypeScript sans dépendances)
- `value-objects/` : Objets valeur immuables
- `repositories/` : Interfaces des repositories (contrats)
- `services/` : Services du domaine (logique métier pure)

### 2. `/core/application/` - Couche Application
**Règle : Dépend uniquement du Domain**

- `use-cases/` : Cas d'usage orchestrant la logique métier
- `ports/` : Interfaces pour l'infrastructure (inversion de dépendance)
- `dto/` : Data Transfer Objects

### 3. `/infrastructure/` - Couche Infrastructure
**Règle : Implémente les interfaces du Domain/Application**

- `repositories/` : Implémentations concrètes des repositories
- `http/` : Services HTTP, interceptors, API clients
- `guards/` : Guards Angular
- `storage/` : Services de stockage (localStorage, etc.)
- `mappers/` : Conversion entre DTOs et Entities

### 4. `/presentation/` - Couche Présentation
**Règle : Utilise les Use Cases via injection**

- `features/` : Modules fonctionnels (lazy-loaded)
- `shared/` : Composants, pipes, directives partagés
- `layouts/` : Layouts de l'application
- `pages/` : Pages principales

## Principes Clés

### Dependency Rule
Les dépendances pointent toujours vers l'intérieur :
- Presentation → Application → Domain
- Infrastructure → Application/Domain

### Inversion de Dépendance
- Le Domain définit les interfaces
- L'Infrastructure les implémente
- L'Application les utilise via injection

### Exemple de Flux

```typescript
// 1. Domain - Interface (core/domain/repositories/)
export interface QuizRepository {
  findAll(): Observable<Quiz[]>;
}

// 2. Application - Use Case (core/application/use-cases/)
export class GetAllQuizzesUseCase {
  constructor(private quizRepo: QuizRepository) {}
  execute(): Observable<Quiz[]> {
    return this.quizRepo.findAll();
  }
}

// 3. Infrastructure - Implémentation (infrastructure/repositories/)
export class QuizHttpRepository implements QuizRepository {
  constructor(private http: HttpClient) {}
  findAll(): Observable<Quiz[]> {
    return this.http.get<Quiz[]>('/api/quizzes');
  }
}

// 4. Presentation - Component (presentation/features/)
export class QuizListComponent {
  constructor(private getAllQuizzes: GetAllQuizzesUseCase) {}
  
  ngOnInit() {
    this.getAllQuizzes.execute().subscribe(quizzes => {
      this.quizzes = quizzes;
    });
  }
}
```

## Avantages

✅ **Testabilité** : Chaque couche peut être testée indépendamment
✅ **Maintenabilité** : Séparation claire des responsabilités
✅ **Flexibilité** : Changement facile d'implémentation (ex: API → Mock)
✅ **Indépendance** : Le métier ne dépend pas du framework
✅ **Scalabilité** : Structure claire pour faire grandir l'application
