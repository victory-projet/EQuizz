# Guide de Test - Authentification EQuizz Mobile

## 🚀 Démarrage Rapide

### 1. Configuration de l'API

Avant de tester, configurez l'URL de votre backend dans `src/core/config.ts` :

```typescript
export const API_CONFIG = {
  BASE_URL: 'http://VOTRE_IP_LOCALE:3000/api',
  // Exemple: 'http://192.168.1.100:3000/api'
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
} as const;
```

### 2. Installation des Dépendances

```bash
npm install
```

### 3. Lancement de l'Application

```bash
npm start
```

Puis scannez le QR code avec Expo Go sur votre téléphone.

## 🧪 Scénarios de Test

### Scénario 1 : Première Connexion (Réclamation de Compte)

**Objectif** : Tester le flux de réclamation de compte pour un nouvel étudiant.

**Étapes** :
1. Au démarrage, vous devriez être redirigé vers l'écran de connexion
2. Cliquez sur "S'inscrire ?"
3. Remplissez le formulaire :
   - **Matricule** : Votre matricule étudiant
   - **Email** : Votre email institutionnel
   - **Classe** : Votre ID de classe
4. Cliquez sur "Activer mon compte"

**Résultats Attendus** :
- ✅ Message de succès : "Si vos informations sont valides, vous recevrez un email..."
- ✅ Redirection automatique vers l'écran de connexion
- ✅ Email reçu avec les identifiants (vérifier votre boîte mail)

**Cas d'Erreur à Tester** :
- Email invalide → Message d'erreur "Email invalide"
- Champs vides → Messages d'erreur sous chaque champ
- Compte déjà activé → Message "Ce compte a déjà été activé"

---

### Scénario 2 : Connexion Standard

**Objectif** : Tester la connexion avec des identifiants valides.

**Étapes** :
1. Sur l'écran de connexion, remplissez :
   - **Matricule** : Votre matricule
   - **Mot de passe** : Le mot de passe reçu par email
2. Cliquez sur "Connexion"

**Résultats Attendus** :
- ✅ Connexion réussie
- ✅ Redirection automatique vers l'écran "Accueil"
- ✅ Affichage des 3 onglets : Accueil, Quizz, Profil

**Cas d'Erreur à Tester** :
- Identifiants incorrects → Message "Identifiants invalides"
- Champs vides → Messages d'erreur de validation
- Serveur inaccessible → Message "Impossible de contacter le serveur"

---

### Scénario 3 : Navigation dans l'Application

**Objectif** : Vérifier que l'utilisateur authentifié peut naviguer librement.

**Étapes** :
1. Une fois connecté, naviguez entre les onglets :
   - **Accueil** : Devrait afficher "Bienvenue sur EQuizz" + votre nom
   - **Quizz** : Écran des quiz (fonctionnalité existante)
   - **Profil** : Vos informations personnelles

**Résultats Attendus** :
- ✅ Navigation fluide entre les onglets
- ✅ Affichage correct des informations utilisateur
- ✅ Pas de redirection vers le login

---

### Scénario 4 : Affichage du Profil

**Objectif** : Vérifier l'affichage des informations utilisateur.

**Étapes** :
1. Allez dans l'onglet "Profil"
2. Vérifiez les informations affichées

**Résultats Attendus** :
- ✅ Nom affiché correctement
- ✅ Prénom affiché correctement
- ✅ Email affiché correctement
- ✅ Rôle = "etudiant"
- ✅ Bouton "Se déconnecter" visible

---

### Scénario 5 : Déconnexion

**Objectif** : Tester le flux de déconnexion.

**Étapes** :
1. Dans l'onglet "Profil", cliquez sur "Se déconnecter"

**Résultats Attendus** :
- ✅ Déconnexion immédiate
- ✅ Redirection automatique vers l'écran de connexion
- ✅ Token supprimé du stockage sécurisé

---

### Scénario 6 : Persistance de Session

**Objectif** : Vérifier que l'utilisateur reste connecté après fermeture de l'app.

**Étapes** :
1. Connectez-vous avec des identifiants valides
2. Fermez complètement l'application (force quit)
3. Rouvrez l'application

**Résultats Attendus** :
- ✅ Reconnexion automatique
- ✅ Pas besoin de se reconnecter
- ✅ Accès direct aux onglets de l'application

---

### Scénario 7 : Navigation Protégée

**Objectif** : Vérifier que les écrans sont protégés.

**Étapes** :
1. Déconnectez-vous
2. Essayez d'accéder directement à un écran protégé (si possible)

**Résultats Attendus** :
- ✅ Redirection automatique vers le login
- ✅ Impossible d'accéder aux écrans sans authentification

---

## 🐛 Problèmes Courants et Solutions

### Problème 1 : "Impossible de contacter le serveur"

**Causes possibles** :
- Backend non démarré
- URL incorrecte dans `config.ts`
- Téléphone et ordinateur sur des réseaux différents

**Solutions** :
1. Vérifiez que le backend est lancé : `npm start` dans le dossier backend
2. Vérifiez l'URL dans `src/core/config.ts`
3. Assurez-vous d'être sur le même réseau WiFi
4. Utilisez votre IP locale (pas localhost)

### Problème 2 : "Token non persisté"

**Causes possibles** :
- `expo-secure-store` non installé correctement
- Permissions manquantes (iOS)

**Solutions** :
1. Réinstallez les dépendances : `npm install`
2. Redémarrez l'application
3. Sur iOS, vérifiez les permissions Keychain

### Problème 3 : Erreurs TypeScript

**Solutions** :
1. Vérifiez que toutes les dépendances sont installées
2. Redémarrez le serveur Metro : `npm start --reset-cache`

### Problème 4 : Navigation ne fonctionne pas

**Solutions** :
1. Vérifiez que vous êtes bien sur la branche `front-etud`
2. Assurez-vous que tous les fichiers sont à jour
3. Redémarrez l'application

---

## 📊 Checklist de Test Complète

### Fonctionnalités d'Authentification
- [ ] Réclamation de compte avec données valides
- [ ] Réclamation avec email invalide (erreur)
- [ ] Réclamation avec champs vides (erreur)
- [ ] Connexion avec identifiants valides
- [ ] Connexion avec identifiants invalides (erreur)
- [ ] Connexion avec champs vides (erreur)
- [ ] Déconnexion
- [ ] Persistance de session (fermer/rouvrir)

### Navigation
- [ ] Redirection automatique vers login si non authentifié
- [ ] Redirection automatique vers app si authentifié
- [ ] Navigation entre les 3 onglets
- [ ] Affichage correct de l'onglet Accueil
- [ ] Affichage correct de l'onglet Quizz
- [ ] Affichage correct de l'onglet Profil

### Affichage des Données
- [ ] Nom utilisateur affiché correctement
- [ ] Prénom utilisateur affiché correctement
- [ ] Email utilisateur affiché correctement
- [ ] Rôle utilisateur affiché correctement

### Gestion des Erreurs
- [ ] Message d'erreur pour serveur inaccessible
- [ ] Message d'erreur pour identifiants invalides
- [ ] Messages de validation des formulaires
- [ ] Gestion du timeout des requêtes

---

## 🔍 Logs de Débogage

Pour activer les logs de débogage, ouvrez la console Metro et vérifiez :

```bash
# Dans le terminal où vous avez lancé npm start
# Les logs s'afficheront automatiquement
```

Pour voir les logs dans l'application :
- **Android** : Secouez le téléphone → "Debug" → "Show Dev Menu"
- **iOS** : Secouez le téléphone → "Debug" → "Show Dev Menu"

---

## 📝 Données de Test Suggérées

### Compte Test 1
```
Matricule: ETU001
Email: etudiant1@institution.edu
Classe: CLASSE_ID_1
```

### Compte Test 2
```
Matricule: ETU002
Email: etudiant2@institution.edu
Classe: CLASSE_ID_2
```

---

## ✅ Validation Finale

Une fois tous les tests passés :
1. ✅ L'authentification fonctionne de bout en bout
2. ✅ La navigation protégée est opérationnelle
3. ✅ La persistance de session fonctionne
4. ✅ Les fonctionnalités Quiz existantes sont préservées
5. ✅ L'intégration est complète et stable

---

**Branche** : `front-etud`
**Date** : Novembre 2025
**Status** : Prêt pour tests
