# Mise à jour de l'intégration API

## Changements effectués

### 1. Configuration de l'API
- **URL de production** : `https://equizz-production.up.railway.app/api`
- Configuration dans `src/core/api.ts` avec gestion automatique du token JWT
- Intercepteurs pour l'authentification et la gestion des erreurs

### 2. Repositories mis à jour

#### Course Repository (`src/data/repositories/Course.repository.impl.ts`)
✅ **Avant** : Utilisait des données mockées (`mockCourses`, `mockEvaluationPeriod`)
✅ **Après** : Utilise les vraies API avec `apiClient`

**Endpoints utilisés** :
- `GET /student/courses` - Récupérer tous les cours
- `GET /student/courses/:id` - Récupérer un cours spécifique
- `GET /student/evaluation-period` - Récupérer la période d'évaluation

#### Question Repository (`src/data/repositories/Question.repository.impl.ts`)
✅ **Avant** : Utilisait des données mockées (`mockQuestions`)
✅ **Après** : Utilise les vraies API avec `apiClient`

**Endpoints utilisés** :
- `GET /student/courses/:courseId/questions` - Récupérer les questions d'un cours
- `POST /student/courses/:courseId/submit` - Soumettre les réponses d'un quiz

#### Quizz Repository (`src/data/repositories/QuizzRepositoryImpl.ts`)
✅ **Déjà configuré** : Utilise `QuizzDataSource` qui appelle les vraies API

**Endpoints utilisés** :
- `GET /student/quizzes` - Récupérer les quiz disponibles
- `GET /student/quizzes/:id` - Récupérer le détail d'un quiz
- `POST /student/quizzes/:id/submit` - Soumettre les réponses d'un quiz

### 3. Gestion des erreurs

Tous les repositories gèrent maintenant les erreurs de manière cohérente :
- **401 Unauthorized** : "Non authentifié. Veuillez vous reconnecter."
- **404 Not Found** : Messages spécifiques (cours/quiz non trouvé)
- **Erreur réseau** : "Impossible de contacter le serveur. Vérifiez votre connexion."
- **Autres erreurs** : Messages du serveur ou message générique

### 4. Authentification

- Token JWT stocké dans `SecureStore` avec la clé `@auth_token`
- Ajout automatique du header `Authorization: Bearer <token>` sur toutes les requêtes
- Nettoyage automatique du token en cas d'erreur 401

### 5. Structure des données

#### Course
```typescript
interface Course {
  id: string;
  title: string;
  classes: string[];
  questionCount: number;
  startDate: string;
  endDate: string;
  status: CourseStatus;
}
```

#### Question
```typescript
interface Question {
  id: string;
  courseId: string;
  questionNumber: number;
  totalQuestions: number;
  text: string;
  type: QuestionType;
  options?: QuestionOption[];
  response?: string;
}
```

#### Evaluation (Quiz disponible)
```typescript
interface Evaluation {
  id: string;
  titre: string;
  dateFin: string;
  Cours: {
    nom: string;
  };
}
```

#### Quizz (Détail du quiz)
```typescript
interface Quizz {
  id: string;
  titre: string;
  Questions: QuizzQuestion[];
}
```

### 6. Fichiers modifiés

- ✅ `src/data/repositories/Course.repository.impl.ts` - Remplacé mock par API
- ✅ `src/data/repositories/Question.repository.impl.ts` - Remplacé mock par API
- ✅ `src/core/api.ts` - Configuration API avec intercepteurs
- ✅ `src/data/datasources/QuizzDataSource.ts` - Déjà configuré avec API

### 7. Fichiers à conserver (données mock pour référence)

Les fichiers mock sont conservés dans `src/data/datasources/mock/` pour référence mais ne sont plus utilisés :
- `Course.mock.ts`
- `Question.mock.ts`
- `EvaluationPeriod.mock.ts`

## Tests recommandés

1. **Connexion** : Vérifier que l'authentification fonctionne
2. **Liste des cours** : Vérifier que les cours s'affichent depuis l'API
3. **Questions** : Vérifier que les questions d'un cours se chargent
4. **Quiz disponibles** : Vérifier que les quiz disponibles s'affichent
5. **Soumission** : Vérifier que la soumission d'un quiz fonctionne
6. **Gestion des erreurs** : Tester avec une connexion réseau coupée

## Notes importantes

- Toutes les requêtes utilisent maintenant `apiClient` d'Axios au lieu de `fetch`
- Le token JWT est automatiquement ajouté à chaque requête
- Les erreurs sont gérées de manière cohérente dans tous les repositories
- L'application est maintenant entièrement connectée au backend de production
