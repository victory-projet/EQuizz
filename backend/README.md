# EQuizz - Backend API

API RESTful pour la plateforme EQuizz, un système d'évaluation anonyme pour établissements d'enseignement.

## 🚀 Stack Technique

- **Node.js** (v22+)
- **Express.js** - Framework web
- **Sequelize** - ORM pour MySQL
- **MySQL** - Base de données
- **JWT** - Authentification
- **SendGrid** - Envoi d'emails
- **Bcrypt** - Hachage des mots de passe
- **Sentiment** - Analyse de sentiments (fallback)
- **Google Generative AI** - Analyse avancée avec Gemini (optionnel)
- **PDFKit** - Génération de PDF
- **ExcelJS** - Import/Export Excel

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
JWT_EXPIRES_IN=8h

# Email (SendGrid)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_VERIFIED_SENDER=votre.email@verifie.com

# Google AI Studio (Gemini) - Optionnel pour analyse de sentiments avancée
GOOGLE_AI_API_KEY=AIzaSy...votre-cle-ici

# Serveur
PORT=8080
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

### Dashboard
- `GET /api/dashboard/admin` - Dashboard administrateur (statistiques globales)
- `GET /api/dashboard/student` - Dashboard étudiant (quizz, notifications)
- `GET /api/dashboard/evaluation/:id` - Statistiques d'une évaluation

### Étudiant
- `GET /api/student/me` - Informations de l'étudiant connecté
- `GET /api/student/quizzes` - Liste des quizz disponibles avec statut
- `GET /api/student/quizzes/:id` - Détails d'un quizz
- `POST /api/student/quizzes/:id/submit` - Soumettre des réponses
- `GET /api/student/notifications` - Liste des notifications
- `PUT /api/student/notifications/:id/read` - Marquer comme lue
- `PUT /api/student/notifications/read-all` - Tout marquer comme lu

### Administration Académique
- `GET /api/academic/classes` - Liste des classes
- `POST /api/academic/classes` - Créer une classe
- `GET /api/academic/cours` - Liste des cours
- `POST /api/academic/cours` - Créer un cours
- `POST /api/academic/etudiants/import` - Importer des étudiants (CSV/Excel)
- `GET /api/academic/annees-academiques` - Années académiques
- `GET /api/academic/semestres` - Semestres

### Évaluations
- `GET /api/evaluations` - Liste des évaluations
- `POST /api/evaluations` - Créer une évaluation (statut BROUILLON)
- `GET /api/evaluations/:id` - Détails d'une évaluation
- `PUT /api/evaluations/:id` - Modifier une évaluation
- `DELETE /api/evaluations/:id` - Supprimer une évaluation
- `POST /api/evaluations/:id/publish` - **Publier une évaluation** (envoie notifications)
- `POST /api/evaluations/quizz/:quizzId/questions` - Ajouter une question
- `POST /api/evaluations/quizz/:quizzId/import` - Importer questions (Excel)
- `PUT /api/evaluations/questions/:questionId` - Modifier une question
- `DELETE /api/evaluations/questions/:questionId` - Supprimer une question

### Rapports et Statistiques
- `GET /api/reports/:id` - Rapport complet d'une évaluation
- `GET /api/reports/:id?classeId=xxx` - Rapport filtré par classe
- `GET /api/reports/:id/pdf` - **Export PDF du rapport**

### Notifications
- `GET /api/notifications` - Liste des notifications
- `PUT /api/notifications/:id/read` - Marquer comme lue
- `PUT /api/notifications/read-all` - Tout marquer comme lu

### Initialisation (Développement uniquement)
- `POST /api/init/seed` - Peupler la base avec des données de test
- `POST /api/init/reset` - Réinitialiser la base de données

📖 **Documentation complète**: Voir [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## ✨ Fonctionnalités Principales

### 🎯 Dashboard Intelligent
- **Admin**: Vue d'ensemble complète (statistiques, évaluations récentes, taux de participation)
- **Étudiant**: Quizz disponibles, complétés, notifications non lues

### 📊 Rapports Avancés
- Statistiques détaillées par évaluation
- Répartition des réponses QCM (graphiques)
- **Analyse de sentiments** automatique des réponses ouvertes
- Extraction de mots-clés
- Filtrage par classe
- **Export PDF** professionnel

### 🔔 Système de Notifications
- Notifications automatiques lors de la publication d'évaluations
- Envoi d'emails via SendGrid
- Marquage lu/non lu
- Historique complet

### 📝 Gestion des Évaluations
- Workflow complet: Brouillon → Publication → Clôture
- Import de questions depuis Excel
- Ajout manuel de questions
- Publication avec notifications automatiques

### 🤖 Analyse de Sentiments
- **Analyse avancée avec Google Gemini AI** (optionnel)
- Analyse automatique des réponses textuelles
- Classification: Positif / Neutre / Négatif
- Score de sentiment (-1 à 1)
- Extraction intelligente de mots-clés
- **Résumés automatiques** des commentaires
- Fallback sur analyse basique si Gemini non configuré

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

# Tests
npm test               # Lancer tous les tests
npm run test:unit      # Tests unitaires
npm run test:integration # Tests d'intégration
npm run test:e2e       # Tests end-to-end
npm run test:watch     # Mode watch (développement)
npm run test:coverage  # Couverture de code
```

### Scripts Interactifs

**Linux/Mac**:
```bash
chmod +x run-tests.sh
./run-tests.sh
```

**Windows**:
```bash
run-tests.bat
```

## 📁 Structure du Projet

```
backend/
├── src/
│   ├── config/          # Configuration (DB, JWT, etc.)
│   ├── controllers/     # Contrôleurs (logique des routes)
│   │   ├── dashboard.controller.js
│   │   ├── notification.controller.js
│   │   ├── report.controller.js
│   │   └── ...
│   ├── middlewares/     # Middlewares (auth, validation)
│   ├── models/          # Modèles Sequelize
│   │   ├── Notification.js
│   │   ├── AnalyseReponse.js
│   │   └── ...
│   ├── repositories/    # Couche d'accès aux données
│   ├── routes/          # Définition des routes
│   │   ├── dashboard.routes.js
│   │   ├── notification.routes.js
│   │   ├── report.routes.js
│   │   └── ...
│   └── services/        # Logique métier
│       ├── dashboard.service.js
│       ├── notification.service.js
│       ├── report.service.js
│       ├── sentiment.service.js
│       └── ...
├── app.js                      # Point d'entrée
├── package.json
├── .env                        # Variables d'environnement
├── API_DOCUMENTATION.md        # Documentation API complète
└── FEATURES_IMPLEMENTATION.md  # État des fonctionnalités
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

**Superadministrateur**
- Email : `super.admin@universitesaintjean.org`
- Mot de passe : `admin123`
- Rôle : SUPER-ADMIN

**Enseignant**
- Email : `marie.dupont@saintjeaningenieur.org`
- Mot de passe : `Prof123!`

**Étudiant**
- Email : `sophie.bernard@saintjeaningenieur.org`
- Mot de passe : `Etudiant123!`

## 📄 Licence

Ce projet est développé dans le cadre d'un projet académique.
