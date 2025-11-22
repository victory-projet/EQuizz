# Domain Layer (Couche Domaine)

## Responsabilité
Cette couche contient la **logique métier pure** de l'application. Elle est **indépendante de tout framework** et ne doit avoir **AUCUNE dépendance externe**.

## Règles Strictes
❌ **INTERDIT** :
- Importer Angular (`@angular/*`)
- Importer RxJS (sauf types de base si nécessaire)
- Importer des bibliothèques externes
- Dépendre de l'infrastructure ou de la présentation

✅ **AUTORISÉ** :
- Classes TypeScript pures
- Interfaces TypeScript
- Enums et types
- Logique métier pure

## Structure

### `/entities/`
Entités métier représentant les concepts du domaine.

**Exemple :**
```typescript
export class Quiz {
  constructor(
    public readonly id: string,
    public title: string,
    public description: string,
    public questions: Question[]
  ) {}

  isValid(): boolean {
    return this.questions.length > 0 && this.title.length > 0;
  }
}
```

### `/repositories/`
**Interfaces** définissant les contrats pour accéder aux données.

**Exemple :**
```typescript
export interface QuizRepository {
  findAll(): Observable<Quiz[]>;
  findById(id: string): Observable<Quiz>;
  save(quiz: Quiz): Observable<Quiz>;
  delete(id: string): Observable<void>;
}
```

### `/services/`
Services du domaine contenant la logique métier complexe.

**Exemple :**
```typescript
export class QuizDomainService {
  calculateScore(quiz: Quiz, answers: Answer[]): number {
    // Logique de calcul pure
  }
}
```

## Principe Clé
> "Le domaine ne connaît rien du monde extérieur. Il définit les règles, les autres les suivent."
