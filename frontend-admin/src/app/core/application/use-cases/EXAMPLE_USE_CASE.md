# Comment créer un Use Case

## Structure d'un Use Case

Un use case doit :
1. Avoir une seule responsabilité (Single Responsibility Principle)
2. Dépendre uniquement des interfaces du Domain
3. Retourner des Observables pour l'asynchrone
4. Être injectable

## Template de Use Case

```typescript
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Domain imports
import { Quiz } from '../../domain/entities/quiz.entity';
import { QuizRepository } from '../../domain/repositories/quiz.repository.interface';

/**
 * Use Case: Get all quizzes
 * 
 * Responsabilité: Récupérer tous les quiz disponibles
 */
@Injectable({ providedIn: 'root' })
export class GetAllQuizzesUseCase {
  constructor(
    private readonly quizRepository: QuizRepository
  ) {}

  /**
   * Execute the use case
   * @returns Observable of Quiz array
   */
  execute(): Observable<Quiz[]> {
    return this.quizRepository.findAll();
  }
}
```

## Use Case avec paramètres

```typescript
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Quiz } from '../../domain/entities/quiz.entity';
import { QuizRepository } from '../../domain/repositories/quiz.repository.interface';

/**
 * Use Case: Get quiz by ID
 */
@Injectable({ providedIn: 'root' })
export class GetQuizByIdUseCase {
  constructor(
    private readonly quizRepository: QuizRepository
  ) {}

  execute(id: string): Observable<Quiz> {
    if (!id) {
      throw new Error('Quiz ID is required');
    }
    return this.quizRepository.findById(id);
  }
}
```

## Use Case avec logique métier

```typescript
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Quiz } from '../../domain/entities/quiz.entity';
import { QuizRepository } from '../../domain/repositories/quiz.repository.interface';
import { CreateQuizDTO } from '../dto/create-quiz.dto';

/**
 * Use Case: Create a new quiz
 */
@Injectable({ providedIn: 'root' })
export class CreateQuizUseCase {
  constructor(
    private readonly quizRepository: QuizRepository
  ) {}

  execute(dto: CreateQuizDTO): Observable<Quiz> {
    // Validation
    this.validate(dto);

    // Création de l'entité
    const quiz = new Quiz(
      this.generateId(),
      dto.title,
      dto.description,
      []
    );

    // Vérification métier
    if (!quiz.isValid()) {
      throw new Error('Invalid quiz data');
    }

    // Sauvegarde
    return this.quizRepository.save(quiz);
  }

  private validate(dto: CreateQuizDTO): void {
    if (!dto.title || dto.title.trim().length === 0) {
      throw new Error('Title is required');
    }
  }

  private generateId(): string {
    return `quiz-${Date.now()}`;
  }
}
```

## Use Case avec orchestration multiple

```typescript
import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

import { Quiz } from '../../domain/entities/quiz.entity';
import { Course } from '../../domain/entities/course.entity';
import { QuizRepository } from '../../domain/repositories/quiz.repository.interface';
import { CourseRepository } from '../../domain/repositories/course.repository.interface';

/**
 * Use Case: Get quizzes with their courses
 */
@Injectable({ providedIn: 'root' })
export class GetQuizzesWithCoursesUseCase {
  constructor(
    private readonly quizRepository: QuizRepository,
    private readonly courseRepository: CourseRepository
  ) {}

  execute(): Observable<Array<{ quiz: Quiz; course: Course }>> {
    return forkJoin({
      quizzes: this.quizRepository.findAll(),
      courses: this.courseRepository.findAll()
    }).pipe(
      map(({ quizzes, courses }) => {
        return quizzes.map(quiz => ({
          quiz,
          course: courses.find(c => c.id === quiz.courseId)!
        }));
      })
    );
  }
}
```

## Utilisation dans un composant

```typescript
import { Component, OnInit } from '@angular/core';
import { GetAllQuizzesUseCase } from '../../../core/application/use-cases/quiz/get-all-quizzes.use-case';
import { Quiz } from '../../../core/domain/entities/quiz.entity';

@Component({
  selector: 'app-quiz-list',
  templateUrl: './quiz-list.component.html'
})
export class QuizListComponent implements OnInit {
  quizzes: Quiz[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private readonly getAllQuizzes: GetAllQuizzesUseCase
  ) {}

  ngOnInit(): void {
    this.loadQuizzes();
  }

  private loadQuizzes(): void {
    this.loading = true;
    this.error = null;

    this.getAllQuizzes.execute().subscribe({
      next: (quizzes) => {
        this.quizzes = quizzes;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load quizzes';
        this.loading = false;
        console.error(err);
      }
    });
  }
}
```

## Bonnes Pratiques

✅ **À FAIRE** :
- Un use case = une action métier
- Nommer clairement : `VerbNounUseCase` (ex: `GetAllQuizzesUseCase`)
- Utiliser `readonly` pour les dépendances
- Valider les entrées
- Gérer les erreurs métier
- Documenter avec JSDoc

❌ **À ÉVITER** :
- Use cases trop génériques (ex: `QuizService`)
- Logique UI dans les use cases
- Dépendances vers l'infrastructure concrète
- Effets de bord non contrôlés
