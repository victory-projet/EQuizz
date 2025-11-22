# EQuizz Admin Web - Clean Architecture

Application Angular pour la gestion administrative de la plateforme EQuizz, construite selon les principes de la **Clean Architecture**.

## 🏗️ Architecture

Ce projet suit strictement les principes de la Clean Architecture avec une séparation en 4 couches :

```
┌─────────────────────────────────────┐
│       PRESENTATION LAYER            │  ← UI Components, Pages
│  (Angular Components, Templates)    │
└─────────────────────────────────────┘
              ↓ dépend de
┌─────────────────────────────────────┐
│      APPLICATION LAYER              │  ← Use Cases, Business Logic
│     (Use Cases, Ports, DTOs)        │
└─────────────────────────────────────┘
              ↓ dépend de
┌─────────────────────────────────────┐
│        DOMAIN LAYER                 │  ← Core Business (Entities)
│  (Entities, Repository Interfaces)  │  ← Ne dépend de RIEN
└─────────────────────────────────────┘
              ↑ implémente
┌─────────────────────────────────────┐
│     INFRASTRUCTURE LAYER            │  ← Technical Details
│  (HTTP, Repositories, Guards)       │
└─────────────────────────────────────┘
```

### 📚 Documentation

- **[CLEAN_ARCHITECTURE.md](./CLEAN_ARCHITECTURE.md)** - Principes et règles de l'architecture
- **[ARCHITECTURE_STRUCTURE.md](./ARCHITECTURE_STRUCTURE.md)** - Structure détaillée du projet
- **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - Guide de migration des imports

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 18+ 
- npm 9+
- Angular CLI 20+

### Installation

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm start

# L'application sera accessible sur http://localhost:4200
```

### Commandes Disponibles

```bash
# Développement
npm start                    # Démarrer le serveur de dev
npm run watch               # Build en mode watch

# Build
npm run build               # Build de production
npm run build:dev           # Build de développement

# Tests
npm test                    # Lancer les tests unitaires

# Validation
npm run validate:architecture  # Vérifier les règles d'architecture
npm run validate:all          # Validation complète (architecture + build)
```

## 📁 Structure du Projet

```
src/app/
├── core/
│   ├── domain/              # 🔵 Entités et interfaces métier
│   │   ├── entities/        # Classes métier pures
│   │   └── repositories/    # Interfaces des repositories
│   └── application/         # 🟢 Cas d'usage et logique applicative
│       ├── use-cases/       # Use cases (actions métier)
│       ├── ports/           # Interfaces pour l'infrastructure
│       └── dto/             # Data Transfer Objects
├── infrastructure/          # 🟡 Implémentations techniques
│   ├── repositories/        # Implémentations des repositories
│   ├── http/               # Interceptors, services HTTP
│   ├── guards/             # Guards Angular
│   └── storage/            # Services de stockage
├── presentation/            # 🔴 Interface utilisateur
│   ├── features/           # Modules fonctionnels (lazy-loaded)
│   ├── shared/             # Composants partagés
│   ├── layouts/            # Layouts de l'app
│   └── pages/              # Pages principales
└── config/                  # ⚙️ Configuration
    ├── app.config.ts       # Configuration Angular
    ├── app.routes.ts       # Routes
    └── providers.config.ts # Providers DI
```

## 🎯 Principes Clés

### 1. Dependency Rule

Les dépendances pointent toujours vers l'intérieur :
- ✅ Presentation → Application → Domain
- ✅ Infrastructure → Application/Domain
- ❌ Domain ne dépend de RIEN

### 2. Inversion de Dépendance

```typescript
// Domain définit l'interface
export abstract class QuizRepository {
  abstract findAll(): Observable<Quiz[]>;
}

// Infrastructure l'implémente
@Injectable()
export class QuizHttpRepository implements QuizRepository {
  findAll() { return this.http.get<Quiz[]>('/api/quizzes'); }
}

// Application l'utilise
@Injectable()
export class GetAllQuizzesUseCase {
  constructor(private repo: QuizRepository) {}
  execute() { return this.repo.findAll(); }
}
```

### 3. Imports avec Alias

Le projet utilise des alias TypeScript pour faciliter les imports :

```typescript
import { Quiz } from '@domain/entities/quiz.entity';
import { GetAllQuizzesUseCase } from '@application/use-cases/quiz/get-all-quizzes.use-case';
import { QuizHttpRepository } from '@infrastructure/repositories/quiz.repository';
import { QuizListComponent } from '@presentation/features/quiz-management/components/quiz-list';
```

## 🔧 Développement

### Créer une nouvelle feature

1. **Créer l'entité (Domain)**
```typescript
// src/app/core/domain/entities/student.entity.ts
export class Student {
  constructor(
    public readonly id: string,
    public name: string,
    public email: string
  ) {}
}
```

2. **Créer l'interface du repository (Domain)**
```typescript
// src/app/core/domain/repositories/student.repository.interface.ts
export abstract class StudentRepository {
  abstract findAll(): Observable<Student[]>;
  abstract findById(id: string): Observable<Student>;
}
```

3. **Créer le use case (Application)**
```typescript
// src/app/core/application/use-cases/student/get-all-students.use-case.ts
@Injectable({ providedIn: 'root' })
export class GetAllStudentsUseCase {
  constructor(private repo: StudentRepository) {}
  execute() { return this.repo.findAll(); }
}
```

4. **Implémenter le repository (Infrastructure)**
```typescript
// src/app/infrastructure/repositories/student.repository.ts
@Injectable({ providedIn: 'root' })
export class StudentHttpRepository implements StudentRepository {
  constructor(private http: HttpClient) {}
  findAll() { return this.http.get<Student[]>('/api/students'); }
}
```

5. **Créer le composant (Presentation)**
```typescript
// src/app/presentation/features/students/students.component.ts
@Component({ ... })
export class StudentsComponent {
  constructor(private getAllStudents: GetAllStudentsUseCase) {}
  ngOnInit() {
    this.getAllStudents.execute().subscribe(students => {
      this.students = students;
    });
  }
}
```

6. **Configurer le provider (Config)**
```typescript
// src/app/config/providers.config.ts
export const repositoryProviders = [
  { provide: StudentRepository, useClass: StudentHttpRepository }
];
```

### Validation de l'architecture

Avant de committer, vérifiez que l'architecture est respectée :

```bash
npm run validate:architecture
```

Ce script vérifie :
- ✅ Le Domain ne dépend de rien
- ✅ L'Application ne dépend que du Domain
- ✅ L'Infrastructure n'est pas utilisée directement par la Presentation
- ✅ Les imports utilisent les alias recommandés

## 🧪 Tests

```bash
# Lancer tous les tests
npm test

# Tests en mode watch
npm test -- --watch

# Tests avec couverture
npm test -- --code-coverage
```

## 📦 Build

```bash
# Build de production
npm run build

# Build de développement
npm run build -- --configuration development

# Analyser la taille du bundle
npm run build -- --stats-json
```

## 🎨 Style et Conventions

### Naming Conventions

- **Entities** : `PascalCase` (ex: `Quiz`, `Student`)
- **Use Cases** : `VerbNounUseCase` (ex: `GetAllQuizzesUseCase`)
- **Repositories** : `NounRepository` (ex: `QuizRepository`)
- **Components** : `noun.component.ts` (ex: `quiz-list.component.ts`)

### Structure des fichiers

```
feature-name/
├── components/              # Composants de la feature
│   └── sub-component/
│       ├── sub-component.component.ts
│       ├── sub-component.component.html
│       ├── sub-component.component.scss
│       └── sub-component.component.spec.ts
├── feature-name.component.ts
├── feature-name.component.html
├── feature-name.component.scss
└── feature-name.component.spec.ts
```

## 🤝 Contribution

1. Créer une branche depuis `main`
2. Développer en respectant la Clean Architecture
3. Valider l'architecture : `npm run validate:architecture`
4. Tester : `npm test`
5. Créer une Pull Request

## 📄 Licence

[Votre licence ici]

## 👥 Équipe

[Informations sur l'équipe]

---

**Note** : Ce projet suit strictement les principes de la Clean Architecture. Consultez [CLEAN_ARCHITECTURE.md](./CLEAN_ARCHITECTURE.md) pour plus de détails sur les règles et conventions.
