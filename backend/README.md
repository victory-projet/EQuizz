# Projet EQuizz - Backend

Ce projet contient l'API RESTful pour la plateforme EQuizz. Il est construit avec Node.js, Express, et utilise Sequelize comme ORM pour communiquer avec une base de données MySQL.

## Stack Technique
- **Node.js** (v18+)
- **Express.js**
- **Sequelize** (ORM)
- **MySQL**

## Prérequis
Avant de commencer, assurez-vous d'avoir installé :
- Git
- Node.js et npm
- Un serveur de base de données MySQL fonctionnant localement (ex: via WAMP, XAMPP, MySQL Workbench, ou Docker).

## Installation & Lancement

1.  **Cloner le Dépôt Principal**
    Si vous n'avez pas encore le projet, clonez le dépôt principal `equizz-platform`.
    ```bash
    git clone <URL_DE_VOTRE_DEPOT_GIT>
    ```

2.  **Naviguer vers le Dossier Backend**
    ```bash
    cd EQuizz/backend
    ```

3.  **Installer les Dépendances**
    Cette commande va installer tous les packages nécessaires listés dans `package.json`.
    ```bash
    npm install
    ```

4.  **Configurer l'Environnement**
    Ce projet utilise un fichier `.env` pour gérer les variables d'environnement et les secrets.
    
    a. Créez une copie du fichier d'exemple :
    ```bash
    # Sur Windows (cmd)
    copy .env.example .env
    
    # Sur Linux / macOS / Git Bash
    cp .env.example .env
    ```
    # Fichier env.example
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=votre_mot_de_passe_local
    DB_NAME=equizz_db
    DB_DIALECT=mysql
    
    b. Ouvrez le nouveau fichier `.env` et modifiez les valeurs pour correspondre à votre configuration MySQL locale, notamment `DB_PASSWORD`.

5.  **Configurer la Base de Données**
    a. Connectez-vous à votre serveur MySQL et créez la base de données (si elle n'existe pas déjà).
    ```sql
    CREATE DATABASE equizz_db;
    ```
    b. Lancez le script de synchronisation pour créer toutes les tables et leurs relations.
    ```bash
    npm run db:sync
    ```

6.  **Lancer le Serveur de Développement**
    Cette commande démarre le serveur avec `nodemon`, qui redémarrera automatiquement à chaque modification de fichier.
    ```bash
    npm run start:dev
    ```
    Votre API est maintenant accessible à l'adresse `http://localhost:3000` (ou le port que vous avez configuré).

## Workflow Git

Tout développement doit se faire sur une **branche de fonctionnalité** créée à partir de `develop`.

1.  Créez votre branche : `git checkout -b feature/ID-description-courte`
2.  Développez et commitez votre travail.
3.  Poussez votre branche : `git push origin feature/ID-description-courte`
4.  Créez une **Pull Request** sur GitHub/GitLab vers la branche `develop`.