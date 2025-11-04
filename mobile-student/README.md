# Projet EQuizz - Frontend Mobile (Étudiant)

Ce projet contient l'application mobile pour les étudiants, conçue pour la plateforme EQuizz. Elle est construite avec React Native et Expo.

## Stack Technique

- **React Native**
- **Expo**

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

## Workflow Git

Tout développement doit se faire sur une **branche de fonctionnalité** créée à partir de `develop`.

1. Créez votre branche : `git checkout -b feature/ID-description-courte`
2. Développez et commitez votre travail.
3. Poussez votre branche : `git push origin feature/ID-description-courte`
4. Créez une **Pull Request** sur GitHub/GitLab vers la branche `develop`.
