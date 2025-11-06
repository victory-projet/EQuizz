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