# Presentation Layer (Couche Présentation)

## Responsabilité
Cette couche contient tout ce qui concerne l'**interface utilisateur** : composants Angular, pages, layouts, state management.

## Règles Strictes
✅ **AUTORISÉ** :
- Utiliser les Use Cases via injection de dépendances
- Contenir la logique de présentation (affichage, validation UI)
- Utiliser Angular Material, RxJS, etc.

❌ **INTERDIT** :
- Contenir de la logique métier
- Appeler directement les repositories
- Dépendre de l'infrastructure

## Structure

### `/features/`
Modules fonctionnels organisés par feature (lazy-loaded).

**Structure d'une feature :**
```
quiz-management/
├── components/          # Composants spécifiques à la feature
├── quiz-management.component.ts
├── quiz-management.component.html
└── quiz-management.component.scss
```

**Exemple de composant :**
```typescript
import { Component, OnInit } from '@angular/core';
import { GetAllQuizzesUseCase } from '../../../core/application/use-cases/quiz/get-all-quizzes.use-case';
import { Quiz } from '../../../core/domain/entities/quiz.entity';

@Component({
  selector: 'app-quiz-management',
  templateUrl: './quiz-management.component.html'
})
export class QuizManagementComponent implements OnInit {
  quizzes: Quiz[] = [];

  constructor(private getAllQuizzes: GetAllQuizzesUseCase) {}

  ngOnInit() {
    this.getAllQuizzes.execute().subscribe(
      quizzes => this.quizzes = quizzes
    );
  }
}
```

### `/shared/`
Composants, pipes, directives réutilisables dans toute l'application.

### `/layouts/`
Layouts de l'application (header, sidebar, footer).

### `/pages/`
Pages principales (home, login, error).

## Principe Clé
> "La présentation affiche et réagit. Elle délègue toute logique métier aux use cases."
