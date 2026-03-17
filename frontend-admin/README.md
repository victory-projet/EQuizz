# EQuizz Admin - Plateforme d'Évaluation des Enseignements

![Angular](https://img.shields.io/badge/Angular-20.2-red?logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green)
![Tests](https://img.shields.io/badge/Tests-Passing-brightgreen)

Application web d'administration pour la gestion et l'évaluation des enseignements. Permet aux administrateurs de créer, gérer et analyser les évaluations des cours.

## 📋 Table des Matières

- [Fonctionnalités](#-fonctionnalités)
- [Technologies](#-technologies)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Développement](#-développement)
- [Tests](#-tests)
- [Build](#-build)
- [Déploiement](#-déploiement)
- [Architecture](#-architecture)
- [Documentation](#-documentation)
- [Contribution](#-contribution)

## ✨ Fonctionnalités

### Gestion des Évaluations
- ✅ Création et édition d'évaluations
- ✅ Gestion des questions (choix multiples, texte libre, échelle)
- ✅ Prévisualisation en temps réel
- ✅ Publication et clôture d'évaluations
- ✅ Export des résultats (Excel)

### Dashboard Analytique
- ✅ Statistiques en temps réel
- ✅ Graphiques interactifs (Chart.js)
- ✅ Filtres par année et semestre
- ✅ Alertes et notifications
- ✅ Tendances et analyses

### Gestion des Utilisateurs
- ✅ Gestion des étudiants
- ✅ Gestion des enseignants
- ✅ Gestion des administrateurs
- ✅ Gestion des classes
- ✅ Associations cours-enseignants-classes

### Rapports
- ✅ Rapports détaillés par évaluation
- ✅ Analyse des performances
- ✅ Statistiques par cours et enseignant
- ✅ Export et impression

### Responsive Design
- ✅ Interface adaptative (mobile, tablette, desktop)
- ✅ Menu hamburger sur mobile
- ✅ Animations fluides
- ✅ Accessibilité WCAG AA

## 🛠 Technologies

### Frontend
- **Angular 20.2** - Framework principal
- **TypeScript 5.9** - Langage de programmation
- **RxJS 7.8** - Programmation réactive
- **Chart.js 4.5** - Graphiques interactifs
- **ng2-charts 8.0** - Wrapper Angular pour Chart.js

### Outils de Développement
- **Angular CLI** - Outil de développement
- **Jasmine & Karma** - Tests unitaires
- **ESLint** - Linting
- **Prettier** - Formatage de code

### Optimisation
- **Lazy Loading** - Chargement à la demande
- **Service Worker** - Cache et PWA
- **Image Optimization** - Compression et lazy loading
- **HTTP Caching** - Mise en cache des requêtes

## 📦 Prérequis

- **Node.js** >= 18.x
- **npm** >= 9.x
- **Angular CLI** >= 20.x

```bash
# Vérifier les versions
node --version
npm --version
ng version
```

## 🚀 Installation

### 1. Cloner le Projet

```bash
git clone https://github.com/votre-repo/equizz.git
cd equizz/frontend-admin
```

### 2. Installer les Dépendances

```bash
npm install
```

### 3. Configuration

Créer un fichier `src/environments/environment.ts` :

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  enableCache: false,
  cacheTimeout: 60000
};
```

### 4. Lancer l'Application

```bash
npm start
```

L'application sera accessible sur `http://localhost:4200`

### Identifiants de Connexion

**Superadministrateur**
- Email : `super.admin@universitesaintjean.org`
- Mot de passe : `admin123`
- Rôle : SUPER-ADMIN

## 💻 Développement

### Commandes Disponibles

```bash
# Démarrer le serveur de développement
npm start

# Build de développement
npm run build

# Build de production
npm run build -- --configuration=production

# Lancer les tests
npm test

# Lancer les tests avec couverture
npm test -- --code-coverage

# Linter le code
ng lint

# Formater le code
npm run format
```

### Structure du Projet

```
frontend-admin/
├── src/
│   ├── app/
│   │   ├── core/                 # Services core, interceptors
│   │   │   ├── domain/          # Entités et interfaces
│   │   │   ├── usecases/        # Cas d'utilisation
│   │   │   ├── interceptors/    # HTTP interceptors
│   │   │   └── services/        # Services métier
│   │   ├── infrastructure/       # Implémentation technique
│   │   │   ├── http/            # Services HTTP
│   │   │   └── repositories/    # Repositories
│   │   ├── presentation/         # Composants UI
│   │   │   ├── features/        # Pages principales
│   │   │   ├── layouts/         # Layouts
│   │   │   └── shared/          # Composants partagés
│   │   └── shared/              # Utilitaires partagés
│   ├── assets/                   # Images, fonts, etc.
│   ├── environments/             # Configuration environnements
│   └── styles.scss              # Styles globaux
├── public/                       # Fichiers statiques
├── angular.json                  # Configuration Angular
├── package.json                  # Dépendances npm
├── tsconfig.json                # Configuration TypeScript
└── karma.conf.js                # Configuration tests
```

### Architecture Clean

Le projet suit les principes de **Clean Architecture** :

1. **Domain Layer** - Entités et interfaces métier
2. **Use Cases Layer** - Logique métier
3. **Infrastructure Layer** - Implémentation technique
4. **Presentation Layer** - Interface utilisateur

### Conventions de Code

- **Composants** : PascalCase (ex: `DashboardComponent`)
- **Services** : PascalCase + Service (ex: `AuthService`)
- **Fichiers** : kebab-case (ex: `dashboard.component.ts`)
- **Variables** : camelCase (ex: `currentUser`)
- **Constantes** : UPPER_SNAKE_CASE (ex: `API_URL`)

## 🧪 Tests

### Exécuter les Tests

```bash
# Tests unitaires
npm test

# Tests avec couverture
npm test -- --code-coverage

# Tests en mode watch
npm test -- --watch

# Tests sur un fichier spécifique
npm test -- --include='**/auth.service.spec.ts'
```

### Couverture de Code

Les rapports de couverture sont générés dans `coverage/frontend-admin/`

Objectifs de couverture :
- Statements : > 80%
- Branches : > 75%
- Functions : > 80%
- Lines : > 80%

### Écrire des Tests

```typescript
describe('MyService', () => {
  let service: MyService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MyService]
    });
    service = TestBed.inject(MyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
```

## 📦 Build

### Build de Production

```bash
npm run build -- --configuration=production
```

Optimisations appliquées :
- ✅ Minification JS/CSS
- ✅ Tree shaking
- ✅ AOT compilation
- ✅ Lazy loading
- ✅ Output hashing
- ✅ Source maps désactivées

### Taille des Bundles

```
Initial bundle: ~500 KB
Lazy chunks: ~100 KB each
Total: ~1 MB (gzipped: ~300 KB)
```

## 🚀 Déploiement

### Déploiement sur Render

1. Créer un compte sur [Render](https://render.com)
2. Connecter le repository GitHub
3. Configurer le service :
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist/frontend-admin/browser`
4. Déployer

### Variables d'Environnement

```bash
API_URL=https://api.equizz.com
NODE_ENV=production
```

### Déploiement sur Netlify

```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Build
npm run build -- --configuration=production

# Déployer
netlify deploy --prod --dir=dist/frontend-admin/browser
```

## 🏗 Architecture

### Clean Architecture

```
┌─────────────────────────────────────┐
│      Presentation Layer             │
│  (Components, Pages, Layouts)       │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│       Use Cases Layer               │
│  (Business Logic, Services)         │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Infrastructure Layer           │
│  (HTTP, Repositories, APIs)         │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         Domain Layer                │
│  (Entities, Interfaces)             │
└─────────────────────────────────────┘
```

### Flux de Données

```
User Action → Component → Service → UseCase → Repository → API
                  ↓
              Update UI ← Observable ← Response
```

### State Management

- **Signals** - État local des composants
- **Services** - État partagé entre composants
- **LocalStorage** - Persistance (token, user)

## 📚 Documentation

### Documentation Technique

- [Guide d'Installation](./docs/INSTALLATION.md)
- [Guide de Développement](./docs/DEVELOPMENT.md)
- [Architecture Détaillée](./docs/ARCHITECTURE.md)
- [API Documentation](./docs/API.md)

### Documentation Utilisateur

- [Guide Utilisateur Admin](./docs/USER_GUIDE_ADMIN.md)
- [FAQ](./docs/FAQ.md)
- [Tutoriels](./docs/TUTORIALS.md)

### Phases de Développement

- [Phase 16 - Responsive & Animations](./PHASE_16_RESPONSIVE_ANIMATIONS_COMPLETE.md)
- [Phase 17 - Tests](./PHASE_17_TESTS_COMPLETE.md)
- [Phase 18 - Optimisation](./PHASE_18_OPTIMIZATION_COMPLETE.md)

## 🤝 Contribution

### Workflow Git

```bash
# Créer une branche
git checkout -b feature/ma-fonctionnalite

# Faire des commits
git add .
git commit -m "feat: ajout de ma fonctionnalité"

# Pousser la branche
git push origin feature/ma-fonctionnalite

# Créer une Pull Request
```

### Convention de Commits

Suivre [Conventional Commits](https://www.conventionalcommits.org/) :

- `feat:` - Nouvelle fonctionnalité
- `fix:` - Correction de bug
- `docs:` - Documentation
- `style:` - Formatage
- `refactor:` - Refactoring
- `test:` - Tests
- `chore:` - Maintenance

### Code Review

Toute Pull Request doit :
- ✅ Passer les tests
- ✅ Respecter les conventions de code
- ✅ Être revue par au moins 1 personne
- ✅ Avoir une couverture de tests > 80%

## 📄 License

MIT License - voir [LICENSE](../LICENSE)

## 👥 Équipe

- **Développeurs** - Équipe EQuizz

## 📞 Support

- **Email** : support@equizz.com
- **Issues** : [GitHub Issues](https://github.com/victory-projet/EQuizz/issues)
- **Documentation** : [Wiki](https://github.com/victory-projet/EQuizz/wiki)

## 🎯 Roadmap

### Version 1.0 (Actuelle)
- ✅ Dashboard analytique
- ✅ Gestion des évaluations
- ✅ Rapports détaillés
- ✅ Responsive design


### Version 2.0 (Futur)
- 📅 Intégration calendrier
- 📅 Statistiques avancées (IA)
- 📅 Multi-langue
- 📅 API publique

