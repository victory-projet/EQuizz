# Intégration de l'API de Production - EQuizz Mobile

## ✅ Implémentation Complète

L'application mobile EQuizz est maintenant connectée à l'API de production et implémente le flux complet pour les étudiants.

## 🌐 Configuration de l'API

### URL de Production
```
https://equizz-production.up.railway.app/api
```

### Configuration
L'URL est configurée via le fichier `.env` :
```env
EXPO_PUBLIC_API_URL=https://equizz-production.up.railway.app/api
```

### Instance Axios Centralisée
Fichier : `src/core/api.ts`
- Configuration automatique de l'URL de base
- Injection automatique du token JWT dans les headers
- Gestion globale des erreurs (401, timeout, etc.)
- Timeout de 15 secondes

## 📋 Fonctionnalités Implémentées

### 1. Authentification ✅
- **Réclamation de compte** : `POST /auth/claim-account`
- **Connexion** : `POST /auth/login`
- **Déconnexion** : Suppression du token local
- **Persistance** : Token stocké dans `expo-secure-store`

### 2. Consultation des Quizz ✅
- **Liste des quizz** : `GET /student/quizzes`
  - Affichage des quizz disponibles
  - Filtrage des quizz expirés
  - Refresh pull-to-refresh
  
- **Détail d'un quizz** : `GET /student/quizzes/:id`
  - Affichage des questions
  - Support CHOIX_MULTIPLE et REPONSE_OUVERTE
  - Navigation entre questions
  - Barre de progression

### 3. Soumission des Réponses ✅
- **Soumettre** : `POST /student/quizzes/:id/submit`
  - Validation des réponses
  - Confirmation avant soumission
  - Gestion des questions non répondues
  - Feedback de succès/erreur

## 🏗️ Architecture Clean

### Couche Domain
```
domain/
├── entities/
│   ├── Utilisateur.ts          # Entité utilisateur
│   ├── Evaluation.ts           # Quizz disponible (liste)
│   └── Quizz.ts                # Détail du quizz avec questions
├── repositories/
│   ├── AuthRepository.ts       # Interface auth
│   └── QuizzRepository.ts      # Interface quizz
└── usecases/
    ├── ClaimAccountUseCase.ts
    ├── LoginUseCase.ts
    ├── GetAvailableQuizzesUseCase.ts
    ├── GetQuizzDetailsUseCase.ts
    └── SubmitQuizzAnswersUseCase.ts
```

### Couche Data
```
data/
├── datasources/
│   ├── AuthDataSource.ts       # Appels API auth
│   └── QuizzDataSource.ts      # Appels API quizz
└── repositories/
    ├── AuthRepositoryImpl.ts
    └── QuizzRepositoryImpl.ts
```

### Couche Presentation
```
presentation/
├── components/
│   ├── QuizzCard.tsx           # Carte de quizz
│   ├── CustomTextInput.tsx
│   └── PrimaryButton.tsx
└── hooks/
    ├── useAuth.tsx             # Contexte d'authentification
    ├── useAvailableQuizzes.ts  # Hook liste quizz
    ├── useQuizzDetails.ts      # Hook détail quizz
    └── useQuizzSubmission.ts   # Hook soumission
```

### Écrans
```
app/
├── (auth)/
│   ├── login.tsx               # Connexion
│   └── claim-account.tsx       # Réclamation
├── (tabs)/
│   ├── accueil.tsx             # Accueil (ancien)
│   ├── quizzes.tsx             # Liste des quizz ✨ NOUVEAU
│   └── profil.tsx              # Profil avec déconnexion
└── quiz/
    └── [id].tsx                # Détail du quizz ✨ NOUVEAU
```

## 🔄 Flux Utilisateur Complet

### 1. Première Utilisation
```
Démarrage
  ↓
Pas de token → Écran de connexion
  ↓
Clic "S'inscrire ?" → Réclamation de compte
  ↓
Remplir formulaire (matricule, email, classe)
  ↓
Soumission → Email reçu avec identifiants
  ↓
Retour au login
```

### 2. Connexion
```
Écran de connexion
  ↓
Saisir matricule + mot de passe
  ↓
Soumission → Token JWT reçu et stocké
  ↓
Redirection automatique → Onglet "Mes Quizz"
```

### 3. Consultation et Passage d'un Quizz
```
Onglet "Mes Quizz"
  ↓
Liste des quizz disponibles (GET /student/quizzes)
  ↓
Clic sur un quizz → Écran de détail
  ↓
Chargement des questions (GET /student/quizzes/:id)
  ↓
Navigation question par question
  ↓
Sélection des réponses
  ↓
Clic "Soumettre" → Confirmation
  ↓
Soumission (POST /student/quizzes/:id/submit)
  ↓
Message de succès → Retour à la liste
```

### 4. Déconnexion
```
Onglet "Profil"
  ↓
Clic "Se déconnecter"
  ↓
Suppression du token
  ↓
Redirection automatique → Écran de connexion
```

## 🧪 Tests à Effectuer

### Test 1 : Authentification
- [ ] Réclamation de compte avec données valides
- [ ] Connexion avec identifiants valides
- [ ] Persistance de session (fermer/rouvrir l'app)
- [ ] Déconnexion

### Test 2 : Liste des Quizz
- [ ] Affichage de la liste des quizz
- [ ] Affichage correct des informations (titre, cours, date)
- [ ] Indication des quizz expirés
- [ ] Pull-to-refresh fonctionne

### Test 3 : Détail du Quizz
- [ ] Chargement des questions
- [ ] Affichage correct des questions CHOIX_MULTIPLE
- [ ] Affichage correct des questions REPONSE_OUVERTE
- [ ] Navigation entre questions (Précédent/Suivant)
- [ ] Barre de progression correcte
- [ ] Sauvegarde des réponses lors de la navigation

### Test 4 : Soumission
- [ ] Validation : impossible de passer sans répondre
- [ ] Alerte si questions non répondues
- [ ] Confirmation avant soumission
- [ ] Soumission réussie
- [ ] Message de succès
- [ ] Retour à la liste après soumission

### Test 5 : Gestion des Erreurs
- [ ] Erreur si serveur inaccessible
- [ ] Erreur si token expiré (401)
- [ ] Erreur si quizz non trouvé (404)
- [ ] Messages d'erreur clairs

## 📊 Contrats API Utilisés

### GET /student/quizzes
```typescript
Response: Evaluation[]
[
  {
    id: "uuid",
    titre: "Évaluation de fin de semestre",
    dateFin: "2025-12-31T23:59:59.000Z",
    Cours: {
      nom: "Mathématiques"
    }
  }
]
```

### GET /student/quizzes/:id
```typescript
Response: Quizz
{
  id: "uuid",
  titre: "Évaluation de fin de semestre",
  Questions: [
    {
      id: "uuid",
      enonce: "Quelle est la capitale de la France ?",
      typeQuestion: "CHOIX_MULTIPLE",
      options: ["Paris", "Lyon", "Marseille"]
    },
    {
      id: "uuid",
      enonce: "Expliquez le théorème de Pythagore",
      typeQuestion: "REPONSE_OUVERTE"
    }
  ]
}
```

### POST /student/quizzes/:id/submit
```typescript
Request:
{
  reponses: [
    {
      question_id: "uuid",
      contenu: "Paris"
    },
    {
      question_id: "uuid",
      contenu: "Le théorème de Pythagore..."
    }
  ]
}

Response: 201 Created
{
  message: "Réponses soumises avec succès"
}
```

## 🔒 Sécurité

- ✅ Token JWT stocké de manière sécurisée (`expo-secure-store`)
- ✅ Token envoyé automatiquement dans les headers
- ✅ Gestion automatique de l'expiration du token
- ✅ Déconnexion automatique si 401
- ✅ Validation des entrées côté client

## 📱 Navigation

### Onglets Principaux
1. **Accueil** : Écran d'accueil (ancien, peut être adapté)
2. **Mes Quizz** : Liste des quizz disponibles ✨
3. **Profil** : Informations utilisateur + déconnexion

### Écrans Modaux
- **Détail du Quizz** : Navigation complète avec questions

## 🚀 Commandes

### Démarrer l'application
```bash
npm start
```

### Tester sur un appareil
1. Scanner le QR code avec Expo Go
2. L'app se connecte automatiquement à l'API de production

## ✅ Checklist de Validation

- [x] Configuration de l'API de production
- [x] Instance axios centralisée
- [x] Authentification complète
- [x] Liste des quizz disponibles
- [x] Détail d'un quizz avec questions
- [x] Soumission des réponses
- [x] Navigation protégée
- [x] Gestion des erreurs
- [x] UI/UX cohérente
- [x] TypeScript strict
- [x] Clean Architecture respectée

## 📝 Notes Importantes

1. **Environnement** : L'app utilise l'API de production par défaut
2. **Token** : Stocké de manière sécurisée et persistant
3. **Offline** : Pas de mode hors ligne (nécessite connexion)
4. **Timeout** : 15 secondes pour toutes les requêtes
5. **Erreurs** : Messages clairs et actions appropriées

---

**Branche** : `front-etud`
**Date** : Novembre 2025
**Status** : ✅ Prêt pour tests en production
