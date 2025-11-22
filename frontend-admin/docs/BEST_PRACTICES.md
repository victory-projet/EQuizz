# Bonnes Pratiques - Clean Architecture

## 🎯 Principes Généraux

### 1. Single Responsibility Principle (SRP)
Chaque classe, use case, ou composant doit avoir une seule raison de changer.

✅ **BON**
```typescript
// Un use case = une action
export class GetAllQuizzesUseCase {
  execute(): Observable<Quiz[]> { ... }
}

export class CreateQuizUseCase {
  execute(dto: CreateQuizDTO): Observable<Quiz> { ... }
}
```

❌ **MAUVAIS**
```typescript
// Trop de responsabilités
export class QuizService {
  getAll() { ... }
  getById() { ... }
  create() { ... }
  update() { ... }
  delete() { ... }
  export() { ... }
  import() { ... }
}
```

### 2. Dependency Inversion Principle (DIP)
Dépendre des abstractions, pas des implémentations concrètes.

✅ **BON**
```typescript
// Use case dépend de l'interface
export class GetAllQuizzesUseCase {
  constructor(private repo: QuizRepository) {}  // Interface
}

// Configuration DI
{ provide: QuizRepository, useClass: QuizHttpRepository }
```

❌ **MAUVAIS**
```typescript
// Use case dépend de l'implémentation
export class GetAllQuizzesUseCase {
  constructor(private repo: QuizHttpRepository) {}  // Implémentation concrète
}
```

### 3. Open/Closed Principle (OCP)
Ouvert à l'extension, fermé à la modification.

✅ **BON**
```typescript
// Facile de changer d'implémentation sans modifier le use case
{ provide: QuizRepository, useClass: QuizHttpRepository }
// ou
{ provide: QuizRepository, useClass: QuizMockRepository }
// ou
{ provide: QuizRepository, useClass: QuizLocalStorageRepository }
```

## 📁 Organisation du Code

### Domain Layer

#### Entités

✅ **BON**
```typescript
// Entité pure avec logique métier
export class Quiz {
  constructor(
    public readonly id: string,
    public title: string,
    public description: string,
    public questions: Question[]
  ) {}

  // Logique métier pure
  isValid(): boolean {
    return this.questions.length > 0 && 
           this.title.trim().length > 0;
  }

  addQuestion(question: Question): void {
    if (!question.isValid()) {
      throw new Error('Invalid question');
    }
    this.questions.push(question);
  }

  calculateTotalPoints(): number {
    return this.questions.reduce((sum, q) => sum + q.points, 0);
  }
}
```

❌ **MAUVAIS**
```typescript
// Entité avec dépendances externes
export class Quiz {
  constructor(
    private http: HttpClient,  // ❌ Dépendance externe
    private router: Router     // ❌ Dépendance Angular
  ) {}

  async save() {  // ❌ Logique d'infrastructure
    await this.http.post('/api/quizzes', this).toPromise();
  }
}
```

#### Repository Interfaces

✅ **BON**
```typescript
// Interface claire et focalisée
export abstract class QuizRepository {
  abstract findAll(): Observable<Quiz[]>;
  abstract findById(id: string): Observable<Quiz>;
  abstract save(quiz: Quiz): Observable<Quiz>;
  abstract delete(id: string): Observable<void>;
}
```

❌ **MAUVAIS**
```typescript
// Interface trop générique
export abstract class Repository<T> {
  abstract getAll(): any;  // ❌ Type any
  abstract get(id: any): any;
  abstract post(data: any): any;
}
```

### Application Layer

#### Use Cases

✅ **BON**
```typescript
// Use case focalisé avec validation
@Injectable({ providedIn: 'root' })
export class CreateQuizUseCase {
  constructor(
    private readonly quizRepository: QuizRepository
  ) {}

  execute(dto: CreateQuizDTO): Observable<Quiz> {
    // Validation
    this.validateDTO(dto);

    // Création de l'entité
    const quiz = new Quiz(
      this.generateId(),
      dto.title,
      dto.description,
      []
    );

    // Validation métier
    if (!quiz.isValid()) {
      throw new Error('Invalid quiz');
    }

    // Persistance
    return this.quizRepository.save(quiz);
  }

  private validateDTO(dto: CreateQuizDTO): void {
    if (!dto.title || dto.title.trim().length === 0) {
      throw new Error('Title is required');
    }
    if (dto.title.length > 200) {
      throw new Error('Title too long');
    }
  }

  private generateId(): string {
    return `quiz-${Date.now()}-${Math.random()}`;
  }
}
```

❌ **MAUVAIS**
```typescript
// Use case avec logique UI
@Injectable()
export class CreateQuizUseCase {
  constructor(
    private repo: QuizRepository,
    private router: Router,      // ❌ Dépendance UI
    private toastr: ToastrService // ❌ Dépendance UI
  ) {}

  execute(dto: CreateQuizDTO) {
    this.repo.save(dto).subscribe(
      quiz => {
        this.toastr.success('Quiz created!');  // ❌ Logique UI
        this.router.navigate(['/quiz', quiz.id]); // ❌ Navigation
      }
    );
  }
}
```

### Infrastructure Layer

#### Repository Implementations

✅ **BON**
```typescript
// Implémentation propre avec mapping
@Injectable({ providedIn: 'root' })
export class QuizHttpRepository implements QuizRepository {
  private readonly apiUrl = '/api/quizzes';

  constructor(private readonly http: HttpClient) {}

  findAll(): Observable<Quiz[]> {
    return this.http.get<QuizDTO[]>(this.apiUrl).pipe(
      map(dtos => dtos.map(dto => this.mapToEntity(dto)))
    );
  }

  findById(id: string): Observable<Quiz> {
    return this.http.get<QuizDTO>(`${this.apiUrl}/${id}`).pipe(
      map(dto => this.mapToEntity(dto))
    );
  }

  save(quiz: Quiz): Observable<Quiz> {
    const dto = this.mapToDTO(quiz);
    return this.http.post<QuizDTO>(this.apiUrl, dto).pipe(
      map(dto => this.mapToEntity(dto))
    );
  }

  private mapToEntity(dto: QuizDTO): Quiz {
    return new Quiz(
      dto.id,
      dto.title,
      dto.description,
      dto.questions.map(q => new Question(q.id, q.text, q.points))
    );
  }

  private mapToDTO(quiz: Quiz): QuizDTO {
    return {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      questions: quiz.questions.map(q => ({
        id: q.id,
        text: q.text,
        points: q.points
      }))
    };
  }
}
```

❌ **MAUVAIS**
```typescript
// Implémentation avec logique métier
@Injectable()
export class QuizHttpRepository implements QuizRepository {
  findAll(): Observable<Quiz[]> {
    return this.http.get('/api/quizzes').pipe(
      map(quizzes => {
        // ❌ Logique métier dans l'infrastructure
        return quizzes.filter(q => q.isActive && q.questions.length > 0);
      })
    );
  }
}
```

### Presentation Layer

#### Components

✅ **BON**
```typescript
// Composant focalisé sur la présentation
@Component({
  selector: 'app-quiz-list',
  templateUrl: './quiz-list.component.html',
  styleUrls: ['./quiz-list.component.scss']
})
export class QuizListComponent implements OnInit {
  quizzes: Quiz[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private readonly getAllQuizzes: GetAllQuizzesUseCase,
    private readonly deleteQuiz: DeleteQuizUseCase
  ) {}

  ngOnInit(): void {
    this.loadQuizzes();
  }

  onDeleteQuiz(id: string): void {
    if (!confirm('Are you sure?')) return;

    this.deleteQuiz.execute(id).subscribe({
      next: () => this.loadQuizzes(),
      error: (err) => this.error = 'Failed to delete quiz'
    });
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
      }
    });
  }
}
```

❌ **MAUVAIS**
```typescript
// Composant avec logique métier et appels HTTP directs
@Component({ ... })
export class QuizListComponent {
  constructor(
    private http: HttpClient  // ❌ Dépendance directe à l'infrastructure
  ) {}

  ngOnInit() {
    // ❌ Logique métier dans le composant
    this.http.get('/api/quizzes').subscribe(quizzes => {
      this.quizzes = quizzes.filter(q => {
        return q.questions.length > 0 && 
               q.isActive && 
               q.createdAt > Date.now() - 30 * 24 * 60 * 60 * 1000;
      });
    });
  }
}
```

## 🔧 Patterns et Techniques

### 1. Use Case Composition

✅ **BON** - Composer plusieurs use cases
```typescript
@Injectable({ providedIn: 'root' })
export class GetQuizzesWithStatsUseCase {
  constructor(
    private getAllQuizzes: GetAllQuizzesUseCase,
    private getQuizStats: GetQuizStatsUseCase
  ) {}

  execute(): Observable<QuizWithStats[]> {
    return this.getAllQuizzes.execute().pipe(
      switchMap(quizzes => {
        const statsRequests = quizzes.map(quiz =>
          this.getQuizStats.execute(quiz.id).pipe(
            map(stats => ({ quiz, stats }))
          )
        );
        return forkJoin(statsRequests);
      })
    );
  }
}
```

### 2. Error Handling

✅ **BON** - Gestion d'erreurs centralisée
```typescript
// Domain - Erreurs métier
export class QuizValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuizValidationError';
  }
}

// Use Case
export class CreateQuizUseCase {
  execute(dto: CreateQuizDTO): Observable<Quiz> {
    try {
      this.validate(dto);
      const quiz = this.createQuiz(dto);
      return this.quizRepository.save(quiz);
    } catch (error) {
      if (error instanceof QuizValidationError) {
        return throwError(() => error);
      }
      return throwError(() => new Error('Unexpected error'));
    }
  }
}

// Component
export class CreateQuizComponent {
  onSubmit() {
    this.createQuiz.execute(this.form.value).subscribe({
      next: (quiz) => this.router.navigate(['/quiz', quiz.id]),
      error: (err) => {
        if (err instanceof QuizValidationError) {
          this.showValidationError(err.message);
        } else {
          this.showGenericError();
        }
      }
    });
  }
}
```

### 3. DTOs vs Entities

✅ **BON** - Séparation claire
```typescript
// DTO - Pour le transfert de données
export interface CreateQuizDTO {
  title: string;
  description: string;
  courseId: string;
}

// Entity - Logique métier
export class Quiz {
  constructor(
    public readonly id: string,
    public title: string,
    public description: string,
    public courseId: string,
    public questions: Question[] = []
  ) {}

  isValid(): boolean { ... }
}

// Use Case - Conversion DTO → Entity
export class CreateQuizUseCase {
  execute(dto: CreateQuizDTO): Observable<Quiz> {
    const quiz = new Quiz(
      this.generateId(),
      dto.title,
      dto.description,
      dto.courseId
    );
    return this.quizRepository.save(quiz);
  }
}
```

## 🧪 Testing

### Domain Tests

```typescript
describe('Quiz Entity', () => {
  it('should be valid with questions', () => {
    const quiz = new Quiz('1', 'Test', 'Description', [
      new Question('q1', 'Question 1', 10)
    ]);
    expect(quiz.isValid()).toBe(true);
  });

  it('should be invalid without questions', () => {
    const quiz = new Quiz('1', 'Test', 'Description', []);
    expect(quiz.isValid()).toBe(false);
  });
});
```

### Use Case Tests

```typescript
describe('GetAllQuizzesUseCase', () => {
  let useCase: GetAllQuizzesUseCase;
  let mockRepository: jasmine.SpyObj<QuizRepository>;

  beforeEach(() => {
    mockRepository = jasmine.createSpyObj('QuizRepository', ['findAll']);
    useCase = new GetAllQuizzesUseCase(mockRepository);
  });

  it('should return all quizzes', (done) => {
    const mockQuizzes = [
      new Quiz('1', 'Quiz 1', 'Desc 1', []),
      new Quiz('2', 'Quiz 2', 'Desc 2', [])
    ];
    mockRepository.findAll.and.returnValue(of(mockQuizzes));

    useCase.execute().subscribe(quizzes => {
      expect(quizzes).toEqual(mockQuizzes);
      expect(mockRepository.findAll).toHaveBeenCalled();
      done();
    });
  });
});
```

### Component Tests

```typescript
describe('QuizListComponent', () => {
  let component: QuizListComponent;
  let mockGetAllQuizzes: jasmine.SpyObj<GetAllQuizzesUseCase>;

  beforeEach(() => {
    mockGetAllQuizzes = jasmine.createSpyObj('GetAllQuizzesUseCase', ['execute']);
    component = new QuizListComponent(mockGetAllQuizzes);
  });

  it('should load quizzes on init', () => {
    const mockQuizzes = [new Quiz('1', 'Test', 'Desc', [])];
    mockGetAllQuizzes.execute.and.returnValue(of(mockQuizzes));

    component.ngOnInit();

    expect(component.quizzes).toEqual(mockQuizzes);
    expect(component.loading).toBe(false);
  });
});
```

## 📝 Naming Conventions

### Use Cases
- Format : `VerbNounUseCase`
- Exemples :
  - `GetAllQuizzesUseCase`
  - `CreateQuizUseCase`
  - `UpdateQuizUseCase`
  - `DeleteQuizUseCase`
  - `PublishQuizUseCase`

### Repositories
- Interface : `NounRepository`
- Implémentation : `NounHttpRepository` ou `NounMockRepository`
- Exemples :
  - `QuizRepository` / `QuizHttpRepository`
  - `StudentRepository` / `StudentHttpRepository`

### Entities
- Format : `PascalCase`
- Exemples : `Quiz`, `Student`, `Course`, `Question`

### DTOs
- Format : `ActionNounDTO`
- Exemples :
  - `CreateQuizDTO`
  - `UpdateQuizDTO`
  - `QuizResponseDTO`

## ⚠️ Anti-Patterns à Éviter

### 1. God Objects
❌ Une classe qui fait tout
```typescript
class QuizService {
  getAll() { ... }
  create() { ... }
  update() { ... }
  delete() { ... }
  export() { ... }
  import() { ... }
  validate() { ... }
  calculate() { ... }
}
```

### 2. Anemic Domain Model
❌ Entités sans logique métier
```typescript
class Quiz {
  id: string;
  title: string;
  // Pas de méthodes, juste des données
}
```

### 3. Leaky Abstractions
❌ Détails d'implémentation qui fuient
```typescript
interface QuizRepository {
  findAll(): Promise<AxiosResponse<Quiz[]>>;  // ❌ Axios dans l'interface
}
```

### 4. Circular Dependencies
❌ Dépendances circulaires
```typescript
// use-case-a.ts
import { UseCaseB } from './use-case-b';

// use-case-b.ts
import { UseCaseA } from './use-case-a';  // ❌ Circulaire
```

## ✅ Checklist avant Commit

- [ ] Les entités ne dépendent de rien
- [ ] Les use cases ne dépendent que du domain
- [ ] Les repositories implémentent les interfaces du domain
- [ ] Les composants utilisent les use cases, pas les repositories
- [ ] Les imports utilisent les alias (`@domain`, `@application`, etc.)
- [ ] Pas d'imports relatifs profonds (`../../../`)
- [ ] Les tests passent
- [ ] `npm run validate:architecture` passe
- [ ] Le code compile sans erreur
