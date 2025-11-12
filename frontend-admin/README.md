# 🎓 Projet EQuizz - Frontend Admin (Web)

Application web d'administration pour la plateforme EQuizz, construite avec **Clean Architecture**.

## 📊 Status
✅ **Application fonctionnelle** - Tous les repositories implémentés avec mock data  
✅ **0 erreur TypeScript** - Build réussi  
✅ **Clean Architecture** - Principes SOLID respectés

## 🛠️ Stack Technique
- **Angular** (v16+)
- **TypeScript**
- **SCSS**
- **RxJS**
- **Clean Architecture**

## Prérequis
Avant de commencer, assurez-vous d'avoir installé :
- Git
- Node.js et npm
- Angular CLI (`npm install -g @angular/cli`)

## Installation & Lancement

1.  **Cloner le Dépôt Principal**
    Si vous n'avez pas encore le projet, clonez le dépôt principal `EQuizz`.
    ```bash
    git clone <URL_DE_VOTRE_DEPOT_GIT>
    ```

2.  **Naviguer vers le Dossier Frontend Admin**
    ```bash
    cd EQuizz/frontend-admin
    ```

3.  **Installer les Dépendances**
    ```bash
    npm install
    ```

4.  **Configurer l'Environnement**
    L'URL de l'API backend doit être configurée.
    
    a. Ouvrez le fichier `src/environments/environment.development.ts`.
    
    b. Assurez-vous que la variable `apiUrl` pointe vers votre serveur backend local.
    ```typescript
    export const environment = {
      production: false,
      apiUrl: 'http://localhost:3000/api' // URL de votre API backend
    };
    ```

5.  **Lancer le Serveur de Développement**
    Cette commande compile l'application, démarre un serveur de développement et ouvre automatiquement votre navigateur sur `http://localhost:4200/`.
    ```bash
    ng serve --open
    ```
    L'application se rechargera automatiquement si vous modifiez des fichiers sources.

## 📚 Documentation

- **[README_ARCHITECTURE.md](./README_ARCHITECTURE.md)** - Vue d'ensemble de l'architecture
- **[HOW_TO_ADD_NEW_FEATURE.md](./HOW_TO_ADD_NEW_FEATURE.md)** - Guide pour ajouter une feature
- **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** - État actuel du projet
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Guide de test complet

## 🎯 Fonctionnalités

### ✅ Implémenté
- Gestion des années académiques (référence complète)
- Gestion des quiz (création, modification, publication)
- Gestion des classes et étudiants
- Gestion des cours (UE) et enseignants
- Dashboard avec statistiques
- Évaluation et analytics
- Authentification et autorisation

### 📦 Repositories (Mock Data)
- AcademicYearRepository
- QuizRepository & QuizSubmissionRepository
- ClassRepository & StudentRepository
- CourseRepository & TeacherRepository
- AuthRepository & UserRepository

## 🏗️ Architecture

```
src/app/
├── core/
│   ├── domain/              # Entités et Use Cases
│   ├── infrastructure/      # Repositories
│   ├── services/            # Services techniques
│   └── interceptors/        # HTTP interceptors
├── features/                # Pages de l'application
├── shared/                  # Composants réutilisables
└── pages/                   # Pages publiques
```

## 🧪 Tests

Suivre le guide : [TESTING_GUIDE.md](./TESTING_GUIDE.md)

**Identifiants de test** :
- Email : `admin@equizz.com`
- Mot de passe : `admin123`

## Workflow Git

Tout développement doit se faire sur une **branche de fonctionnalité** créée à partir de `develop`.

1.  Créez votre branche : `git checkout -b feature/ID-description-courte`
2.  Développez et commitez votre travail.
3.  Poussez votre branche : `git push origin feature/ID-description-courte`
4.  Créez une **Pull Request** sur GitHub/GitLab vers la branche `develop`.

## 🚀 Prochaines étapes

1. **Tests** - Suivre le guide de test complet
2. **Use Cases manquants** - Compléter les use cases pour Quiz
3. **Intégration Backend** - Remplacer mock data par vraies API
4. **Tests unitaires** - Ajouter tests pour Use Cases et Entities
5. **Optimisations** - Lazy loading, caching, PWA