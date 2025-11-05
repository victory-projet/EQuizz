# EQuizz - Backend API

API RESTful pour la plateforme EQuizz, un système d'évaluation anonyme pour établissements d'enseignement.

## 🚀 Stack Technique

- **Node.js** (v22+)
- **Express.js** - Framework web
- **Sequelize** - ORM pour MySQL
- **MySQL** - Base de données
- **JWT** - Authentification
- **Nodemailer** - Envoi d'emails
- **Bcrypt** - Hachage des mots de passe

## 📋 Prérequis

- Node.js v18+ et npm
- MySQL 8.0+
- Git

## ⚙️ Installation

### 1. Cloner le projet
```bash
git clone <URL_DU_DEPOT>
cd EQuizz/backend
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configuration de l'environnement

Créer un fichier `.env` à la racine du dossier backend :

```env
# Base de données
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=equizz_db
DB_DIALECT=mysql

# JWT
JWT_SECRET=votre_secret_jwt_tres_securise
JWT_EXPIRES_IN=24h

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre_email@gmail.com
EMAIL_PASSWORD=votre_mot_de_passe_app
EMAIL_FROM=noreply@equizz.com

# Serveur
PORT=3000
NODE_ENV=development
```

### 4. Créer la base de données
```sql
CREATE DATABASE equizz_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 5. Synchroniser la base de données
```bash
npm run db:sync
```

## 🎯 Démarrage

### Développement
```bash
npm run start:dev
```
Le serveur démarre sur `http://localhost:3000` avec rechargement automatique.

### Production
```bash
npm start
```

## 📚 API Endpoints

### Authentification
- `POST /api/auth/login` - Connexion (email/matricule + mot de passe)
- `POST /api/auth/claim-account` - Activation de compte étudiant

### Étudiant
- `GET /api/student/me` - Informations de l'étudiant connecté
- `GET /api/student/quizzes` - Liste des quizz disponibles avec statut
- `GET /api/student/quizzes/:id` - Détails d'un quizz
- `POST /api/student/quizzes/:id/submit` - Soumettre des réponses

### Administration Académique
- `GET /api/academic/classes` - Liste des classes
- `POST /api/academic/classes` - Créer une classe
- `GET /api/academic/courses` - Liste des cours
- `POST /api/academic/students/import` - Importer des étudiants (CSV/Excel)

### Évaluations
- `GET /api/evaluations` - Liste des évaluations
- `POST /api/evaluations` - Créer une évaluation
- `GET /api/evaluations/:id/results` - Résultats d'une évaluation

### Initialisation (Développement uniquement)
- `POST /api/init/seed` - Peupler la base avec des données de test
- `POST /api/init/reset` - Réinitialiser la base de données

## 🔐 Système d'Anonymat

Le système garantit l'anonymat des réponses étudiantes :

1. **SessionToken** (table privée) : Mappe `etudiantId` → `tokenAnonyme`
2. **SessionReponse** (table anonyme) : Utilise uniquement `tokenAnonyme`
3. **ReponseEtudiant** (table anonyme) : Liée à SessionReponse

Les administrateurs voient les réponses mais ne peuvent pas identifier les étudiants.

## 📊 Statuts des Quizz

Chaque quizz peut avoir 3 statuts pour un étudiant :
- **NOUVEAU** : Pas encore commencé
- **EN_COURS** : Commencé mais pas terminé
- **TERMINE** : Soumis et finalisé

## 🛠️ Scripts Disponibles

```bash
npm start              # Démarrer en production
npm run start:dev      # Démarrer en développement (nodemon)
npm run db:sync        # Synchroniser la base de données
npm run lint           # Vérifier le code (ESLint)
npm run lint:fix       # Corriger automatiquement les erreurs
```

## 📁 Structure du Projet

```
backend/
├── src/
│   ├── config/          # Configuration (DB, JWT, etc.)
│   ├── controllers/     # Contrôleurs (logique des routes)
│   ├── middlewares/     # Middlewares (auth, validation)
│   ├── models/          # Modèles Sequelize
│   ├── repositories/    # Couche d'accès aux données
│   ├── routes/          # Définition des routes
│   └── services/        # Logique métier
├── app.js              # Point d'entrée de l'application
├── package.json
└── .env                # Variables d'environnement (à créer)
```

## 🚢 Déploiement

### Railway (Recommandé)

1. Connecter le dépôt GitHub à Railway
2. Configurer les variables d'environnement
3. Railway détecte automatiquement Node.js et déploie

### Commandes Railway CLI
```bash
railway login
railway link
railway up              # Déployer depuis le dossier local
railway status          # Vérifier le statut
railway logs            # Voir les logs
```

## 🔧 Dépannage

### Erreur de connexion MySQL
- Vérifier que MySQL est démarré
- Vérifier les credentials dans `.env`
- Vérifier que la base de données existe

### Erreur "Table doesn't exist"
```bash
npm run db:sync
```

### Erreur JWT
- Vérifier que `JWT_SECRET` est défini dans `.env`
- Régénérer un nouveau secret si nécessaire

## 📝 Workflow Git

1. Créer une branche : `git checkout -b feature/nom-fonctionnalite`
2. Développer et commiter
3. Pousser : `git push origin feature/nom-fonctionnalite`
4. Créer une Pull Request vers `develop`

## 👥 Comptes de Test

Après avoir exécuté `POST /api/init/seed` :

**Administrateur**
- Email : `super.admin@saintjeaningenieur.org`
- Mot de passe : `Admin123!`

**Enseignant**
- Email : `marie.dupont@saintjeaningenieur.org`
- Mot de passe : `Prof123!`

**Étudiant**
- Email : `sophie.bernard@saintjeaningenieur.org`
- Mot de passe : `Etudiant123!`

## 📄 Licence

Ce projet est développé dans le cadre d'un projet académique.
