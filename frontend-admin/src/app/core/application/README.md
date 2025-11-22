# Application Layer (Couche Application)

## Responsabilité
Cette couche contient les **cas d'usage** (use cases) qui orchestrent la logique métier. Elle coordonne les entités du domaine et les repositories.

## Règles Strictes
✅ **AUTORISÉ** :
- Dépendre du Domain (entities, repositories interfaces)
- Utiliser RxJS pour l'orchestration
- Définir des DTOs pour les transferts de données

❌ **INTERDIT** :
- Dépendre de l'infrastructure (implémentations concrètes)
- Dépendre de la présentation (composants Angular)
- Contenir de la logique UI

## Structure

### `/use-cases/`
Cas d'usage représentant les actions métier de l'application.

**Exemple :**
```typescript
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Quiz } from '../../domain/entities/quiz.entity';
import { QuizRepository } from '../../domain/repositories/quiz.repository.interface';

@Injectable({ providedIn: 'root' })
export class GetAllQuizzesUseCase {
  constructor(private quizRepository: QuizRepository) {}

  execute(): Observable<Quiz[]> {
    return this.quizRepository.findAll();
  }
}
```

### `/ports/`
Interfaces pour les services externes (inversion de dépendance).

**Exemple :**
```typescript
export interface StoragePort {
  save(key: string, value: any): void;
  get(key: string): any;
}
```

### `/dto/`
Data Transfer Objects pour les échanges entre couches.

**Exemple :**
```typescript
export interface CreateQuizDTO {
  title: string;
  description: string;
  courseId: string;
}
```

## Principe Clé
> "Les use cases orchestrent, ils ne décident pas. La logique métier reste dans le domaine."
