<<<<<<< HEAD
# Projet EQuizz - Frontend Admin (Web)

Ce projet contient l'application web d'administration pour la plateforme EQuizz. Elle est construite avec Angular.

## Stack Technique
- **Angular** (v16+)
- **TypeScript**
- **SCSS**

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

## Workflow Git

Tout développement doit se faire sur une **branche de fonctionnalité** créée à partir de `develop`.

1.  Créez votre branche : `git checkout -b feature/ID-description-courte`
2.  Développez et commitez votre travail.
3.  Poussez votre branche : `git push origin feature/ID-description-courte`
4.  Créez une **Pull Request** sur GitHub/GitLab vers la branche `develop`.
=======
# Plateforme EQuizz - Monorepo

Bienvenue sur le dépôt principal de la plateforme EQuizz. Ce projet est organisé en monorepo et contient les trois applications distinctes qui composent la plateforme.

## Description des Projets

Ce dépôt contient :

*   **`/backend`**: L'API RESTful développée avec Node.js, Express, et Sequelize. C'est le cœur de l'application qui gère toute la logique métier et la communication avec la base de données MySQL.
*   **`/frontend-admin`**: L'application web d'administration développée avec Angular. Elle permet aux administrateurs de gérer la plateforme.
*   **`/mobile-student`**: L'application mobile pour les étudiants, développée avec React Native et Expo.

## Instructions pour les Développeurs

Chaque sous-projet contient son propre `README.md` avec les instructions détaillées pour l'installation, la configuration et le lancement.

**La première étape pour tous les membres de l'équipe est de cloner ce dépôt principal.**

```bash
git clone <URL_DE_VOTRE_DEPOT_GIT>
cd EQuizz
```

Ensuite, veuillez vous référer au README.md du projet qui vous concerne

## Workflow Git
Nous utilisons un workflow basé sur Git Flow. Toutes les nouvelles fonctionnalités doivent être développées sur une branche dédiée (ex: feature/AUTH-01-nom-feature) créée à partir de develop. Une fois la fonctionnalité terminée, une Pull Request doit être ouverte pour fusionner la branche de fonctionnalité dans develop. La branche main est réservée aux versions stable
>>>>>>> 4e3338e611c2636484db1e12f80a41275a41e217
