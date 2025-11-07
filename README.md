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