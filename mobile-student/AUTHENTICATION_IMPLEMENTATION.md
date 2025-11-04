# Implémentation du Flux d'Authentification - EQuizz Mobile

## 📋 Vue d'ensemble

Cette implémentation suit une **Clean Architecture** stricte pour le flux d'authentification des étudiants de l'application mobile EQuizz.

## 🏗️ Architecture

```
src/
├── app/                    # Écrans et navigation (expo-router)
│   ├── (auth)/            # Groupe d'authentification
│   │   ├── login.tsx      # Écran de connexion
│   │   └── claim-account.tsx  # Écran de réclamation de compte
│   ├── (tabs)/            # Groupe principal de l'app
│   │   ├── index.tsx      # Écran d'accueil
│   │   └── profile.tsx    # Écran de profil
│   └── _layout.tsx        # Layout racine avec navigation protégée
│
├── core/                   # Fichiers transverses
│   ├── config.ts          # Configuration de l'API
│   ├── constants.ts       # Constantes globales
│   └── di/
│       └── container.ts   # Injection de dépendances
│
├── data/                   # Couche de données
│   ├── datasources/
│   │   └── AuthDataSource.ts      # Appels API avec axios
│   └── repositories/
│       └── AuthRepositoryImpl.ts  # Implémentation du repository
│
├── domain/                 # Couche métier (indépendante)
│   ├── entities/
│   │   └── Utilisateur.ts         # Entité utilisateur
│   ├── repositories/
│   │   └── AuthRepository.ts      # Interface du repository
│   └── usecases/
│       ├── ClaimAccountUseCase.ts # Cas d'usage: réclamation
│       └── LoginUseCase.ts        # Cas d'usage: connexion
│
└── presentation/           # Couche de présentation
    ├── components/
    │   ├── CustomTextInput.tsx    # Input personnalisé
    │   └── PrimaryButton.tsx      # Bouton personnalisé
    └── hooks/
        └── useAuth.tsx            # Hook d'authentification global
```

## 🔐 Fonctionnalités Implémentées

### 1. Réclamation de Compte (Première Connexion)
- **Endpoint**: `POST /auth/claim-account`
- **Écran**: `(auth)/claim-account.tsx`
- **Champs**: Matricule, Email, Classe
- **Validation**: Email format, champs requis
- **Résultat**: Message de confirmation + redirection vers login

### 2. Connexion Standard
- **Endpoint**: `POST /auth/login`
- **Écran**: `(auth)/login.tsx`
- **Champs**: Matricule, Mot de passe
- **Stockage**: Token JWT dans `expo-secure-store`
- **Résultat**: Navigation automatique vers l'app

### 3. Gestion de l'État Global
- **Context**: `AuthProvider` dans `useAuth.tsx`
- **Fonctionnalités**:
  - Vérification automatique du token au démarrage
  - Reconnexion automatique si token valide
  - Fonctions `login()` et `logout()`
  - État `isAuthenticated` et `isLoading`

### 4. Navigation Protégée
- **Layout**: `app/_layout.tsx`
- **Logique**:
  - Non authentifié → Redirection vers `/login`
  - Authentifié → Accès aux écrans principaux
  - Déconnexion → Retour automatique au login

## 🎨 Design

Couleurs basées sur le bleu `#3A5689` et ses variantes :
- Primary: `#3A5689`
- Primary Light: `#5A76A9`
- Primary Dark: `#2A4669`

## ⚙️ Configuration

### 1. URL de l'API
Modifiez le fichier `src/core/config.ts` :

```typescript
export const API_CONFIG = {
  BASE_URL: 'http://VOTRE_IP:3000/api',
} as const;
```

### 2. Dépendances Installées
- `axios` - Appels HTTP
- `expo-secure-store` - Stockage sécurisé du token

## 🚀 Utilisation

### Démarrer l'application
```bash
npm start
```

### Tester le flux
1. Lancez l'app → Redirection automatique vers login
2. Cliquez sur "S'inscrire ?" → Écran de réclamation
3. Remplissez le formulaire → Recevez l'email
4. Retournez au login → Connectez-vous
5. Accédez à l'app → Voir profil et déconnexion

## 📝 Contrats API

### Réclamation de Compte
```typescript
POST /auth/claim-account
Body: {
  matricule: string,
  email: string,
  classeId: string
}
Response 200: {
  message: string
}
```

### Connexion
```typescript
POST /auth/login
Body: {
  matricule: string,
  motDePasse: string
}
Response 200: {
  token: string,
  utilisateur: {
    id: string,
    nom: string,
    prenom: string,
    email: string,
    role: "etudiant"
  }
}
```

## 🔒 Sécurité

- Token JWT stocké dans `expo-secure-store` (chiffré)
- Validation des entrées côté client
- Gestion des erreurs HTTP
- Timeout des requêtes (10s)

## 🧪 Points de Test

1. ✅ Réclamation avec données valides
2. ✅ Réclamation avec email invalide
3. ✅ Connexion avec identifiants valides
4. ✅ Connexion avec identifiants invalides
5. ✅ Persistance de la session (fermer/rouvrir l'app)
6. ✅ Déconnexion
7. ✅ Navigation protégée

## 📦 Prochaines Étapes

- Ajouter un écran de chargement (splash screen)
- Implémenter la récupération de mot de passe
- Ajouter des animations de transition
- Implémenter le refresh token
- Ajouter des tests unitaires

## 🐛 Dépannage

### Erreur de connexion au serveur
- Vérifiez que le backend est lancé
- Vérifiez l'URL dans `src/core/config.ts`
- Assurez-vous d'être sur le même réseau

### Token non persisté
- Vérifiez que `expo-secure-store` est bien installé
- Sur iOS, vérifiez les permissions du Keychain

---

**Branche**: `feature/AUTH-student-authentication-flow`
**Date**: Novembre 2025
