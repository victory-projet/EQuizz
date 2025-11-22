# Infrastructure Layer (Couche Infrastructure)

## Responsabilité
Cette couche contient les **implémentations concrètes** des interfaces définies dans le domaine et l'application. Elle gère les détails techniques (HTTP, stockage, etc.).

## Règles Strictes
✅ **AUTORISÉ** :
- Implémenter les interfaces du Domain/Application
- Utiliser Angular HttpClient
- Utiliser des bibliothèques externes
- Gérer les détails techniques

❌ **INTERDIT** :
- Contenir de la logique métier
- Être utilisée directement par la présentation (passer par les use cases)

## Structure

### `/repositories/`
Implémentations concrètes des repositories.

**Exemple :**
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { QuizRepository } from '../../core/domain/repositories/quiz.repository.interface';
import { Quiz } from '../../core/domain/entities/quiz.entity';

@Injectable({ providedIn: 'root' })
export class QuizHttpRepository implements QuizRepository {
  private apiUrl = '/api/quizzes';

  constructor(private http: HttpClient) {}

  findAll(): Observable<Quiz[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(data => data.map(item => this.mapToEntity(item)))
    );
  }

  private mapToEntity(data: any): Quiz {
    return new Quiz(data.id, data.title, data.description, data.questions);
  }
}
```

### `/http/`
Interceptors, services HTTP, gestion des erreurs.

### `/guards/`
Guards Angular pour la protection des routes.

### `/storage/`
Services de stockage (localStorage, sessionStorage).

### `/mappers/`
Conversion entre DTOs API et Entities du domaine.

## Principe Clé
> "L'infrastructure implémente, elle ne dicte pas. Elle s'adapte aux besoins du domaine."
