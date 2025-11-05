# 🎓 Application Mobile EQuizz - Interface Étudiant

## 📱 Vue d'Ensemble

Application mobile React Native (Expo) permettant aux étudiants de passer des évaluations en ligne. L'application suit une architecture Clean Architecture stricte et communique avec l'API de production.

## ✨ Fonctionnalités Principales

### 🔐 Authentification
- Connexion avec matricule et mot de passe
- Réclamation de compte pour nouveaux utilisateurs
- Stockage sécurisé du token JWT
- Déconnexion avec confirmation

### 🏠 Écran d'Accueil
- Liste des évaluations disponibles
- Recherche par nom de cours ou d'évaluation
- Badges de statut (En cours / À venir / Terminé)
- Informations détaillées (classes, nombre de questions, période)
- Navigation vers les quiz

### 👤 Profil Utilisateur
- Avatar personnalisable avec sélection d'image
- Informations complètes (nom, classe, niveau, école, matricule)
- Gestion de compte
- Déconnexion sécurisée

### 📝 Passage de Quiz
- Interface intuitive pour répondre aux questions
- Support des questions à choix multiple
- Support des questions ouvertes
- Barre de progression
- Navigation entre questions
- Soumission sécurisée des réponses

## 🏗️ Architecture

### Clean Architecture

```
src/
├── app/                    # Navigation et écrans (Expo Router)
│   ├── (auth)/            # Écrans d'authentification
│   ├── (tabs)/            # Écrans principaux avec navigation
│   └── quiz/              # Écrans de quiz
│
├── core/                   # Configuration et utilitaires
│   ├── api.ts             # Client axios centralisé
│   ├── constants.ts       # Constantes de l'application
│   └── di/                # Injection de dépendances
│
├── domain/                 # Couche métier (indépendante)
│   ├── entities/          # Objets métier
│   ├── repositories/      # Interfaces des repositories
│   └── usecases/          # Logique applicative
│
├── data/                   # Couche de données
│   ├── datasources/       # Appels API avec axios
│   └── repositories/      # Implémentation des repositories
│
└── presentation/           # Couche de présentation
    ├── components/        # Composants React réutilisables
    └── hooks/             # Hooks personnalisés
```

## 🚀 Installation et Démarrage

### Prérequis
- Node.js v18+
- npm ou yarn
- Expo Go sur votre appareil mobile

### Installation

```bash
# Installer les dépendances
npm install

# Démarrer l'application
npm start
```

### Configuration

Fichier `.env` :
```env
EXPO_PUBLIC_API_URL=https://equizz-production.up.railway.app/api
```

## 📚 Documentation

- **[STUDENT_INTERFACE_IMPLEMENTATION.md](./STUDENT_INTERFACE_IMPLEMENTATION.md)** - Documentation complète de l'implémentation
- **[GUIDE_DEMARRAGE.md](./GUIDE_DEMARRAGE.md)** - Guide de démarrage et de test
- **[COMPOSANTS_UI_AMELIORES.md](./COMPOSANTS_UI_AMELIORES.md)** - Documentation des composants UI

## 🔧 Technologies Utilisées

### Framework et Langage
- **React Native** - Framework mobile
- **Expo** - Plateforme de développement
- **TypeScript** - Langage typé
- **Expo Router** - Navigation basée sur les fichiers

### Bibliothèques Principales
- **axios** - Requêtes HTTP
- **expo-secure-store** - Stockage sécurisé
- **expo-image-picker** - Sélection d'images
- **@expo/vector-icons** - Icônes Material

### Architecture
- **Clean Architecture** - Séparation des responsabilités
- **Dependency Injection** - Gestion des dépendances
- **Repository Pattern** - Abstraction des données
- **Use Cases** - Logique métier isolée

## 📡 API Endpoints

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/auth/claim-account` | POST | Réclamation de compte |
| `/auth/login` | POST | Connexion |
| `/student/quizzes` | GET | Liste des quiz |
| `/student/quizzes/:id` | GET | Détail d'un quiz |
| `/student/quizzes/:id/submit` | POST | Soumission des réponses |

## 🎨 Design System

### Couleurs
- **Primaire** : `#3A5689` (Bleu)
- **Fond** : `#F9FAFB` (Gris clair)
- **Succès** : `#10B981` (Vert)
- **Erreur** : `#DC2626` (Rouge)
- **Avertissement** : `#F59E0B` (Orange)

### Composants Réutilisables
- `CustomTextInput` - Champs de saisie
- `PrimaryButton` - Boutons avec variantes
- `QuizzCard` - Carte d'évaluation
- `Header` - En-tête avec recherche
- `LoadingSpinner` - Indicateur de chargement

## 🧪 Tests

### Scénarios de Test

1. **Authentification**
   - Connexion avec identifiants valides
   - Connexion avec identifiants invalides
   - Réclamation de compte
   - Déconnexion

2. **Navigation**
   - Navigation entre les onglets
   - Navigation vers un quiz
   - Retour arrière

3. **Quiz**
   - Chargement des questions
   - Réponse aux questions
   - Navigation entre questions
   - Soumission des réponses

4. **Profil**
   - Affichage des informations
   - Changement d'avatar
   - Déconnexion

### Commandes de Test

```bash
# Vérification TypeScript
npx tsc --noEmit

# Linting
npm run lint
```

## 📦 Structure des Données

### Utilisateur
```typescript
interface Utilisateur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  matricule: string;
  role: 'etudiant';
  Classe?: { nom: string; Niveau: { nom: string; } };
  Ecole?: { nom: string; };
  anneeScolaire?: string;
  avatar?: string;
}
```

### Évaluation
```typescript
interface Evaluation {
  id: string;
  titre: string;
  dateDebut: string;
  dateFin: string;
  statut?: 'En cours' | 'À venir' | 'Terminé';
  nombreQuestions?: number;
  Cours: { nom: string; };
  Classes?: Array<{ nom: string; }>;
}
```

### Quiz
```typescript
interface Quizz {
  id: string;
  titre: string;
  Questions: Array<{
    id: string;
    enonce: string;
    typeQuestion: 'CHOIX_MULTIPLE' | 'REPONSE_OUVERTE';
    options?: string[];
  }>;
}
```

## 🔒 Sécurité

- ✅ Token JWT stocké de manière sécurisée avec `expo-secure-store`
- ✅ Ajout automatique du token dans les headers
- ✅ Déconnexion automatique en cas de token expiré
- ✅ Validation des formulaires côté client
- ✅ Gestion des erreurs réseau

## 🐛 Débogage

### Logs Utiles

L'application affiche des logs dans la console :
```javascript
// Configuration API
🌐 API URL configurée: https://...

// État d'authentification
Auth state: { isAuthenticated, utilisateur }

// Chargement des données
Accueil state: { quizzes, loading, error }
```

### Problèmes Courants

1. **Erreur de connexion à l'API**
   - Vérifier le fichier `.env`
   - Vérifier la connexion internet

2. **Erreur 401**
   - Token expiré, se reconnecter

3. **Images ne se chargent pas**
   - Vérifier les permissions de l'application

## 📈 Améliorations Futures

- [ ] Upload d'avatar vers le serveur
- [ ] Mode hors ligne avec cache
- [ ] Notifications push
- [ ] Historique des quiz passés
- [ ] Statistiques de performance
- [ ] Mode sombre
- [ ] Support multilingue

## 👥 Contribution

### Workflow Git

```bash
# Créer une branche
git checkout -b feature/nom-de-la-fonctionnalite

# Faire des commits
git add .
git commit -m "feat: description"

# Pousser la branche
git push origin feature/nom-de-la-fonctionnalite

# Créer une Pull Request
```

### Conventions de Commit

- `feat:` - Nouvelle fonctionnalité
- `fix:` - Correction de bug
- `docs:` - Documentation
- `style:` - Formatage
- `refactor:` - Refactoring
- `test:` - Tests
- `chore:` - Maintenance

## 📄 Licence

Ce projet est développé dans le cadre d'un projet académique.

## 📞 Support

Pour toute question ou problème :
1. Consulter la documentation
2. Vérifier les logs
3. Contacter l'équipe de développement

---

**Branche actuelle** : `feature/STUDENT-full-ui-flow`

**Statut** : ✅ Prêt pour la production

**Dernière mise à jour** : Novembre 2025
