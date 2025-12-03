# Guide de Développement - EQuizz Admin

Guide complet pour les développeurs travaillant sur l'application EQuizz Admin.

## 📚 Table des Matières

- [Environnement de Développement](#-environnement-de-développement)
- [Structure du Projet](#-structure-du-projet)
- [Conventions de Code](#-conventions-de-code)
- [Workflow de Développement](#-workflow-de-développement)
- [Composants](#-composants)
- [Services](#-services)
- [State Management](#-state-management)
- [Routing](#-routing)
- [HTTP & API](#-http--api)
- [Tests](#-tests)
- [Debugging](#-debugging)
- [Performance](#-performance)

## 🛠 Environnement de Développement

### IDE Recommandé

**Visual Studio Code** avec les extensions :

```json
{
  "recommendations": [
    "angular.ng-template",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "johnpapa.angular2",
    "nrwl.angular-console"
  ]
}
```

### Configuration VS Code

`.vscode/settings.json` :
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

### Commandes Utiles

```bash
# Développement
npm start                    # Démarrer le serveur de dev
npm run build               # Build de développement
npm run watch               # Build en mode watch

# Tests
npm test                    # Lancer les tests
npm run test:coverage       # Tests avec couverture
npm run test:watch          # Tests en mode watch

# Qualité de Code
npm run lint                # Linter le code
npm run lint:fix            # Corriger automatiquement
npm run format              # Formater avec Prettier

# Génération
ng generate component nom   # Générer un composant
ng generate service nom     # Générer un service
ng generate module nom      # Générer un module
```

## 📁 Structure du Projet

```
frontend-admin/
├── src/
│   ├── app/
│   │   ├── core/                    # Fonctionnalités core
│   │   │   ├── domain/             # Entités métier
│   │   │   │   ├── entities/       # Classes d'entités
│   │   │   │   └── repositories/   # Interfaces repositories
│   │   │   ├── usecases/           # Cas d'utilisation
│   │   │   ├── interceptors/       # HTTP interceptors
│   │   │   └── services/           # Services métier
│   │   │
│   │   ├── infrastructure/          # Implémentation technique
│   │   │   ├── http/               # Services HTTP
│   │   │   └── repositories/       # Implémentation repositories
│   │   │
│   │   ├── presentation/            # Couche présentation
│   │   │   ├── features/           # Pages/Features
│   │   │   │   ├── dashboard/      # Feature dashboard
│   │   │   │   ├── evaluations/    # Feature évaluations
│   │   │   │   └── ...
│   │   │   ├── layouts/            # Layouts (main, auth)
│   │   │   └── shared/             # Composants partagés
│   │   │       ├── components/     # Composants réutilisables
│   │   │       ├── guards/         # Route guards
│   │   │       ├── services/       # Services UI
│   │   │       └── interceptors/   # Interceptors UI
│   │   │
│   │   └── shared/                  # Utilitaires globaux
│   │       ├── directives/         # Directives
│   │       ├── pipes/              # Pipes
│   │       └── utils/              # Fonctions utilitaires
│   │
│   ├── assets/                      # Ressources statiques
│   │   ├── images/
│   │   ├── fonts/
│   │   └── icons/
│   │
│   ├── environments/                # Configuration environnements
│   │   ├── environment.ts          # Développement
│   │   └── environment.prod.ts     # Production
│   │
│   └── styles.scss                  # Styles globaux
│
├── public/                          # Fichiers publics
│   ├── favicon.ico
│   ├── manifest.json
│   └── robots.txt
│
├── docs/                            # Documentation
├── angular.json                     # Configuration Angular
├── package.json                     # Dépendances
├── tsconfig.json                    # Configuration TypeScript
└── karma.conf.js                    # Configuration tests
```

## 📝 Conventions de Code

### Nommage

#### Fichiers

```
# Composants
dashboard.component.ts
dashboard.component.html
dashboard.component.scss
dashboard.component.spec.ts

# Services
auth.service.ts
auth.service.spec.ts

# Guards
auth.guard.ts
auth.guard.spec.ts

# Interceptors
auth.interceptor.ts
auth.interceptor.spec.ts

# Directives
lazy-image.directive.ts
lazy-image.directive.spec.ts

# Pipes
date-format.pipe.ts
date-format.pipe.spec.ts
```

#### Classes et Interfaces

```typescript
// Classes : PascalCase
export class DashboardComponent { }
export class AuthService { }

// Interfaces : PascalCase avec I (optionnel)
export interface User { }
export interface IAuthRepository { }

// Types : PascalCase
export type UserRole = 'ADMIN' | 'ENSEIGNANT' | 'ETUDIANT';

// Enums : PascalCase
export enum EvaluationStatus {
  BROUILLON = 'BROUILLON',
  PUBLIEE = 'PUBLIEE',
  CLOTUREE = 'CLOTUREE'
}
```

#### Variables et Fonctions

```typescript
// Variables : camelCase
const currentUser = signal<User | null>(null);
let isLoading = false;

// Constantes : UPPER_SNAKE_CASE
const API_URL = 'https://api.example.com';
const MAX_RETRY_ATTEMPTS = 3;

// Fonctions : camelCase
function getUserById(id: string): Observable<User> { }
const calculateTotal = (items: Item[]) => { };

// Fonctions privées : préfixe _
private _initializeComponent(): void { }
```

### TypeScript

#### Types Stricts

```typescript
// ✅ BON - Types explicites
function getUser(id: string): Observable<User> {
  return this.http.get<User>(`/api/users/${id}`);
}

// ❌ MAUVAIS - any
function getUser(id: any): any {
  return this.http.get(`/api/users/${id}`);
}

// ✅ BON - Interfaces
interface LoginCredentials {
  email: string;
  motDePasse: string;
}

// ❌ MAUVAIS - Objets non typés
function login(credentials: any) { }
```

#### Signals (Angular 20+)

```typescript
// ✅ BON - Utiliser signals pour l'état
export class DashboardComponent {
  count = signal(0);
  user = signal<User | null>(null);
  isLoading = signal(false);

  increment() {
    this.count.update(c => c + 1);
  }

  // Computed signals
  doubleCount = computed(() => this.count() * 2);
}

// ❌ MAUVAIS - Propriétés classiques pour l'état réactif
export class DashboardComponent {
  count = 0;
  user: User | null = null;
}
```

### HTML Templates

```html
<!-- ✅ BON - Utiliser @if, @for (Angular 17+) -->
@if (isLoading()) {
  <div class="spinner"></div>
} @else {
  <div class="content">{{ data() }}</div>
}

@for (item of items(); track item.id) {
  <div>{{ item.name }}</div>
}

<!-- ❌ MAUVAIS - *ngIf, *ngFor (deprecated) -->
<div *ngIf="isLoading">...</div>
<div *ngFor="let item of items">...</div>

<!-- ✅ BON - Accessibilité -->
<button 
  aria-label="Fermer"
  (click)="close()">
  <span class="material-icons">close</span>
</button>

<!-- ❌ MAUVAIS - Pas d'aria-label -->
<button (click)="close()">
  <span class="material-icons">close</span>
</button>
```

### SCSS

```scss
// ✅ BON - BEM naming
.dashboard {
  &__header {
    display: flex;
  }

  &__title {
    font-size: 24px;
  }

  &--loading {
    opacity: 0.5;
  }
}

// ✅ BON - Variables
$primary-color: #5B7396;
$spacing-unit: 8px;

.button {
  background: $primary-color;
  padding: $spacing-unit * 2;
}

// ✅ BON - Mixins
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  @include flex-center;
}
```

## 🔄 Workflow de Développement

### 1. Créer une Branche

```bash
# Feature
git checkout -b feature/nom-fonctionnalite

# Bug fix
git checkout -b fix/nom-bug

# Refactoring
git checkout -b refactor/nom-refactoring
```

### 2. Développer

```bash
# Générer un composant
ng generate component presentation/features/ma-feature

# Générer un service
ng generate service core/services/mon-service

# Développer et tester
npm start
npm test
```

### 3. Commiter

```bash
# Ajouter les fichiers
git add .

# Commiter avec message conventionnel
git commit -m "feat: ajout de la fonctionnalité X"

# Types de commits :
# feat: nouvelle fonctionnalité
# fix: correction de bug
# docs: documentation
# style: formatage
# refactor: refactoring
# test: ajout de tests
# chore: maintenance
```

### 4. Pousser et PR

```bash
# Pousser la branche
git push origin feature/nom-fonctionnalite

# Créer une Pull Request sur GitHub
# Attendre la review
# Merger après approbation
```

## 🧩 Composants

### Créer un Composant

```bash
ng generate component presentation/features/mon-composant
```

### Structure d'un Composant

```typescript
import { Component, signal, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mon-composant',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mon-composant.component.html',
  styleUrls: ['./mon-composant.component.scss']
})
export class MonComposantComponent {
  // Inputs (Angular 17+)
  title = input<string>('');
  data = input.required<Data>();

  // Outputs
  itemClick = output<string>();

  // State
  isLoading = signal(false);
  items = signal<Item[]>([]);

  // Computed
  itemCount = computed(() => this.items().length);

  // Lifecycle
  ngOnInit() {
    this.loadData();
  }

  // Methods
  loadData() {
    this.isLoading.set(true);
    // ...
  }

  onItemClick(id: string) {
    this.itemClick.emit(id);
  }
}
```

## 🔧 Services

### Créer un Service

```bash
ng generate service core/services/mon-service
```

### Structure d'un Service

```typescript
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MonService {
  // State
  data = signal<Data[]>([]);
  isLoading = signal(false);

  constructor(private http: HttpClient) {}

  // Methods
  getData(): Observable<Data[]> {
    this.isLoading.set(true);
    return this.http.get<Data[]>('/api/data');
  }

  updateData(id: string, data: Partial<Data>): Observable<Data> {
    return this.http.patch<Data>(`/api/data/${id}`, data);
  }
}
```

## 📡 HTTP & API

### Interceptors

```typescript
// auth.interceptor.ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  return next(req);
};
```

### Error Handling

```typescript
// error.interceptor.ts
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Redirect to login
      }
      return throwError(() => error);
    })
  );
};
```

## 🧪 Tests

### Test d'un Composant

```typescript
describe('MonComposant', () => {
  let component: MonComposant;
  let fixture: ComponentFixture<MonComposant>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonComposant]
    }).compileComponents();

    fixture = TestBed.createComponent(MonComposant);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit event on click', () => {
    spyOn(component.itemClick, 'emit');
    component.onItemClick('123');
    expect(component.itemClick.emit).toHaveBeenCalledWith('123');
  });
});
```

### Test d'un Service

```typescript
describe('MonService', () => {
  let service: MonService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MonService]
    });

    service = TestBed.inject(MonService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch data', () => {
    const mockData = [{ id: '1', name: 'Test' }];

    service.getData().subscribe(data => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne('/api/data');
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });
});
```

## 🐛 Debugging

### Chrome DevTools

```typescript
// Ajouter des breakpoints
debugger;

// Logger dans la console
console.log('Value:', value);
console.table(array);
console.group('Group');
console.groupEnd();
```

### Angular DevTools

Extension Chrome pour :
- Inspecter les composants
- Voir l'arbre des composants
- Profiler les performances
- Inspecter les signals

## ⚡ Performance

### Lazy Loading

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component')
      .then(m => m.DashboardComponent)
  }
];
```

### OnPush Change Detection

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MonComposant { }
```

### TrackBy Functions

```typescript
// Component
trackById(index: number, item: Item): string {
  return item.id;
}

// Template
@for (item of items(); track trackById($index, item)) {
  <div>{{ item.name }}</div>
}
```

## 📚 Ressources

- [Angular Documentation](https://angular.dev)
- [RxJS Documentation](https://rxjs.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

**Happy Coding! 🚀**
