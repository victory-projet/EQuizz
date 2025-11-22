# Quick Start - Clean Architecture

## 🚀 Démarrage Rapide

### Installation et Lancement

```bash
# 1. Installer les dépendances
npm install

# 2. Démarrer l'application
npm start

# 3. Ouvrir dans le navigateur
# http://localhost:4200
```

### Vérifier l'Architecture

```bash
# Valider que l'architecture est respectée
npm run validate:architecture

# Valider tout (architecture + build)
npm run validate:all
```

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [README.md](./README.md) | Vue d'ensemble du projet |
| [CLEAN_ARCHITECTURE.md](./CLEAN_ARCHITECTURE.md) | Principes de la Clean Architecture |
| [ARCHITECTURE_STRUCTURE.md](./ARCHITECTURE_STRUCTURE.md) | Structure détaillée des dossiers |
| [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) | Guide de migration des imports |
| [docs/ARCHITECTURE_DIAGRAM.md](./docs/ARCHITECTURE_DIAGRAM.md) | Diagrammes visuels |
| [docs/BEST_PRACTICES.md](./docs/BEST_PRACTICES.md) | Bonnes pratiques et exemples |

## 🎯 Créer une Nouvelle Feature en 5 Minutes

### Exemple : Créer une feature "Student"

#### 1. Créer l'Entité (Domain)

```typescript
// src/app/core/domain/entities/student.entity.ts
export class Student {
  constructor(
    public readonly id: string,
    public name: string,
    public email: string
  ) {}

  isValid(): boolean {
    return this.name.length > 0 && this.email.includes('@');
  }
}
```

#### 2. Créer l'Interface Repository (Domain)

```typescript
// src/app/core/domain/repositories/student.repository.interface.ts
import { Observable } from 'rxjs';
import { Student } from '../entities/student.entity';

export abstract class StudentRepository {
  abstract findAll(): Observable<Student[]>;
  abstract findById(id: string): Observable<Student>;
  abstract save(student: Student): Observable<Student>;
  abstract delete(id: string): Observable<void>;
}
```

#### 3. Créer le Use Case (Application)

```typescript
// src/app/core/application/use-cases/student/get-all-students.use-case.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Student } from '@domain/entities/student.entity';
import { StudentRepository } from '@domain/repositories/student.repository.interface';

@Injectable({ providedIn: 'root' })
export class GetAllStudentsUseCase {
  constructor(private readonly studentRepository: StudentRepository) {}

  execute(): Observable<Student[]> {
    return this.studentRepository.findAll();
  }
}
```

#### 4. Implémenter le Repository (Infrastructure)

```typescript
// src/app/infrastructure/repositories/student.repository.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StudentRepository } from '@domain/repositories/student.repository.interface';
import { Student } from '@domain/entities/student.entity';

@Injectable({ providedIn: 'root' })
export class StudentHttpRepository implements StudentRepository {
  private readonly apiUrl = '/api/students';

  constructor(private readonly http: HttpClient) {}

  findAll(): Observable<Student[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(data => data.map(item => new Student(item.id, item.name, item.email)))
    );
  }

  findById(id: string): Observable<Student> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(data => new Student(data.id, data.name, data.email))
    );
  }

  save(student: Student): Observable<Student> {
    return this.http.post<any>(this.apiUrl, student).pipe(
      map(data => new Student(data.id, data.name, data.email))
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

#### 5. Configurer le Provider (Config)

```typescript
// src/app/config/providers.config.ts
import { StudentRepository } from '@domain/repositories/student.repository.interface';
import { StudentHttpRepository } from '@infrastructure/repositories/student.repository';

export const repositoryProviders: Provider[] = [
  // ... autres providers
  {
    provide: StudentRepository,
    useClass: StudentHttpRepository
  }
];
```

#### 6. Créer le Composant (Presentation)

```typescript
// src/app/presentation/features/students/students.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GetAllStudentsUseCase } from '@application/use-cases/student/get-all-students.use-case';
import { Student } from '@domain/entities/student.entity';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="students-container">
      <h2>Students</h2>
      
      <div *ngIf="loading">Loading...</div>
      <div *ngIf="error" class="error">{{ error }}</div>
      
      <div *ngIf="!loading && !error" class="students-list">
        <div *ngFor="let student of students" class="student-card">
          <h3>{{ student.name }}</h3>
          <p>{{ student.email }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .students-container { padding: 20px; }
    .student-card { 
      border: 1px solid #ddd; 
      padding: 15px; 
      margin: 10px 0; 
      border-radius: 4px;
    }
    .error { color: red; }
  `]
})
export class StudentsComponent implements OnInit {
  students: Student[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private readonly getAllStudents: GetAllStudentsUseCase
  ) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  private loadStudents(): void {
    this.loading = true;
    this.error = null;

    this.getAllStudents.execute().subscribe({
      next: (students) => {
        this.students = students;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load students';
        this.loading = false;
        console.error(err);
      }
    });
  }
}
```

#### 7. Ajouter la Route

```typescript
// src/app/config/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  // ... autres routes
  {
    path: 'students',
    loadComponent: () => 
      import('@presentation/features/students/students.component')
        .then(m => m.StudentsComponent)
  }
];
```

## 🔍 Vérification

### 1. Vérifier la structure

```bash
# Vérifier que les fichiers sont au bon endroit
ls src/app/core/domain/entities/student.entity.ts
ls src/app/core/domain/repositories/student.repository.interface.ts
ls src/app/core/application/use-cases/student/get-all-students.use-case.ts
ls src/app/infrastructure/repositories/student.repository.ts
ls src/app/presentation/features/students/students.component.ts
```

### 2. Valider l'architecture

```bash
npm run validate:architecture
```

### 3. Compiler

```bash
npm run build
```

### 4. Tester

```bash
npm test
```

## 📋 Checklist de Développement

Avant de créer une Pull Request :

- [ ] ✅ Les entités sont dans `core/domain/entities/`
- [ ] ✅ Les interfaces repositories sont dans `core/domain/repositories/`
- [ ] ✅ Les use cases sont dans `core/application/use-cases/`
- [ ] ✅ Les implémentations repositories sont dans `infrastructure/repositories/`
- [ ] ✅ Les composants sont dans `presentation/features/`
- [ ] ✅ Les providers sont configurés dans `config/providers.config.ts`
- [ ] ✅ Les imports utilisent les alias (`@domain`, `@application`, etc.)
- [ ] ✅ `npm run validate:architecture` passe ✅
- [ ] ✅ `npm run build` passe ✅
- [ ] ✅ `npm test` passe ✅
- [ ] ✅ Le code est documenté avec JSDoc
- [ ] ✅ Les tests unitaires sont écrits

## 🎨 Alias d'Imports

Utilisez toujours les alias pour les imports :

```typescript
// ✅ BON
import { Quiz } from '@domain/entities/quiz.entity';
import { GetAllQuizzesUseCase } from '@application/use-cases/quiz/get-all-quizzes.use-case';
import { QuizHttpRepository } from '@infrastructure/repositories/quiz.repository';
import { QuizListComponent } from '@presentation/features/quiz-management/components/quiz-list';

// ❌ MAUVAIS
import { Quiz } from '../../../core/domain/entities/quiz.entity';
import { GetAllQuizzesUseCase } from '../../../core/application/use-cases/quiz/get-all-quizzes.use-case';
```

## 🆘 Problèmes Courants

### Erreur : "Cannot find module '@domain/...'"

**Solution** : Redémarrez votre IDE ou exécutez :
```bash
# Nettoyer le cache
rm -rf .angular/cache
npm run build
```

### Erreur : "Circular dependency detected"

**Solution** : Vérifiez que vous n'avez pas de dépendances circulaires. Utilisez les interfaces pour casser les cycles.

### Erreur de validation d'architecture

**Solution** : Vérifiez que vous respectez les règles de dépendances :
- Domain ne dépend de RIEN
- Application ne dépend que du Domain
- Infrastructure implémente les interfaces du Domain
- Presentation utilise les Use Cases

## 📚 Ressources

### Commandes Utiles

```bash
# Développement
npm start                          # Démarrer le serveur de dev
npm run watch                      # Build en mode watch

# Build
npm run build                      # Build de production
npm run build -- --configuration development  # Build de dev

# Tests
npm test                           # Lancer les tests
npm test -- --watch                # Tests en mode watch
npm test -- --code-coverage        # Tests avec couverture

# Validation
npm run validate:architecture      # Valider l'architecture
npm run validate:all              # Validation complète

# Utilitaires
ng generate component nom          # Générer un composant
ng generate service nom            # Générer un service
```

### Liens Utiles

- [Angular Documentation](https://angular.dev)
- [RxJS Documentation](https://rxjs.dev)
- [Clean Architecture (Uncle Bob)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

## 💡 Conseils

1. **Commencez par le Domain** : Définissez d'abord vos entités et interfaces
2. **Testez tôt** : Écrivez les tests en même temps que le code
3. **Utilisez les alias** : Toujours utiliser `@domain`, `@application`, etc.
4. **Validez souvent** : Lancez `npm run validate:architecture` régulièrement
5. **Documentez** : Ajoutez des commentaires JSDoc sur les classes et méthodes publiques

## 🎓 Prochaines Étapes

1. Lire [CLEAN_ARCHITECTURE.md](./CLEAN_ARCHITECTURE.md) pour comprendre les principes
2. Consulter [docs/BEST_PRACTICES.md](./docs/BEST_PRACTICES.md) pour les bonnes pratiques
3. Regarder les exemples existants dans `src/app/`
4. Créer votre première feature en suivant ce guide
5. Partager vos retours avec l'équipe

---

**Besoin d'aide ?** Consultez la documentation ou demandez à l'équipe ! 🚀
