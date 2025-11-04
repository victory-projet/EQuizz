# EQuizz - Mobile Student App

Application mobile pour les étudiants de la plateforme EQuizz, construite avec **React Native**, **Expo** et **Clean Architecture**.

## 🏗️ Architecture Clean

Ce projet suit les principes de **Clean Architecture** avec une séparation stricte des responsabilités :

```
src/
├── domain/              # Logique métier pure
│   ├── entities/       # Entités (Course, Question, EvaluationPeriod)
│   ├── repositories/   # Interfaces (ICourseRepository, IQuestionRepository)
│   └── usecases/       # Cas d'utilisation (GetCourses, SubmitQuiz, etc.)
│
├── data/                # Implémentation données
│   ├── repositories/   # Implémentations des repositories
│   └── datasources/    # Sources de données (Mock/API)
│
├── presentation/        # Interface utilisateur
│   ├── hooks/          # Custom React hooks (useCourses, useQuestions, etc.)
│   └── components/     # Composants UI réutilisables
│
├── core/                # Utilitaires transversaux
│   ├── di/             # Dependency Injection Container
│   ├── constants/      # Constantes (API config)
│   └── types/          # Types partagés
│
└── app/                 # Navigation Expo Router
    └── views/(tabs)/   # Écrans de l'application
```

### Principes Respectés
- ✅ **SOLID** : Tous les principes appliqués
- ✅ **Séparation des responsabilités** : Chaque couche a son rôle
- ✅ **Testabilité** : Facile de mocker les dépendances
- ✅ **Maintenabilité** : Code organisé et prévisible

## Stack Technique

- **React Native** 0.81.5
- **Expo** ~54.0.20
- **TypeScript** ~5.9.2
- **Clean Architecture**

## Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- Git
- Node.js et npm
- Expo CLI (`npm install -g expo-cli`)
- L'application **Expo Go** sur votre téléphone (Android ou iOS) OU un émulateur Android/iOS configuré sur votre ordinateur.

## Installation & Lancement

1. **Cloner le Dépôt Principal**
    Si vous n'avez pas encore le projet, clonez le dépôt principal `equizz-platform`.

    ```bash
    git clone <URL_DE_VOTRE_DEPOT_GIT>
    ```

2. **Naviguer vers le Dossier Mobile**

    ```bash
    cd equizz-platform/mobile-student
    ```

3. **Installer les Dépendances**

    ```bash
    npm install
    ```

4. **Configurer l'Environnement**
    L'application mobile a besoin de connaître l'adresse IP de votre machine pour communiquer avec le serveur backend local. **`localhost` ne fonctionnera pas.**

    a. Créez un fichier `.env` à la racine de ce dossier (`mobile-student`).

    b. Trouvez l'adresse IP locale de votre machine :
    - Sur **Windows** : ouvrez `cmd` et tapez `ipconfig` (cherchez l'adresse "IPv4 Address").
    - Sur **macOS/Linux** : ouvrez le terminal et tapez `ifconfig` ou `ip a` (cherchez l'adresse "inet").

    c. Ajoutez cette ligne dans votre fichier `.env`, en remplaçant l'IP par la vôtre :

    ```
    API_URL=http://192.168.1.12:3000/api
    ```

5. **Lancer l'Application**
    Cette commande démarre le serveur de développement Metro Bundler.

    ```bash
    npm start
    ```

    Un QR code s'affichera dans le terminal.
    - **Pour utiliser votre téléphone :** Ouvrez l'application Expo Go et scannez le QR code.
    - **Pour utiliser un émulateur :** Appuyez sur `a` (pour Android) ou `i` (pour iOS) dans le terminal.

## 💻 Développement

### Utiliser un Hook dans un Écran

```typescript
import { useCourses } from '@/src/presentation/hooks';

export default function MyScreen() {
    const { courses, loading, error } = useCourses();
    
    if (loading) return <LoadingSpinner />;
    if (error) return <Text>Erreur: {error}</Text>;
    
    return <CourseList courses={courses} />;
}
```

### Ajouter une Nouvelle Fonctionnalité

1. **Créer l'entité** dans `domain/entities/`
2. **Créer l'interface repository** dans `domain/repositories/`
3. **Créer le use case** dans `domain/usecases/`
4. **Implémenter le repository** dans `data/repositories/`
5. **Créer le hook** dans `presentation/hooks/`
6. **Enregistrer dans le DI Container** (`core/di/container.ts`)
7. **Utiliser dans l'écran** via le hook

### Basculer de Mock à API

Dans `src/core/di/container.ts` :
```typescript
// Mode Mock (développement)
this.courseRepository = new CourseRepositoryImpl();

// Mode API (production)
// this.courseRepository = new CourseRepositoryApiImpl();
```

## Workflow Git

1. Créez votre branche : `git checkout -b feature/ID-description`
2. Développez et commitez
3. Poussez : `git push origin feature/ID-description`
4. Créez une Pull Request vers `develop`
