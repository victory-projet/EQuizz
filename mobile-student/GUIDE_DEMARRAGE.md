# Guide de Démarrage - Application Mobile EQuizz (Étudiant)

## 🚀 Démarrage Rapide

### Prérequis
- Node.js (v18 ou supérieur)
- npm ou yarn
- Expo Go installé sur votre appareil mobile (iOS ou Android)

### Installation

1. **Installer les dépendances**
```bash
npm install
```

2. **Vérifier la configuration**
Le fichier `.env` doit contenir :
```env
EXPO_PUBLIC_API_URL=https://equizz-production.up.railway.app/api
```

3. **Démarrer l'application**
```bash
npm start
```

4. **Scanner le QR code**
- Ouvrez Expo Go sur votre appareil
- Scannez le QR code affiché dans le terminal
- L'application se chargera automatiquement

## 📱 Test de l'Application

### 1. Flux d'Authentification

#### Option A : Réclamation de Compte (Nouveau Utilisateur)
1. Sur l'écran de connexion, cliquez sur "S'inscrire ?"
2. Remplissez le formulaire :
   - Matricule : Votre matricule étudiant
   - Email : Votre email institutionnel
   - Classe : Votre classe
3. Cliquez sur "Activer mon compte"
4. Vous recevrez un email avec vos identifiants

#### Option B : Connexion Standard
1. Entrez votre matricule
2. Entrez votre mot de passe
3. Cliquez sur "Connexion"

### 2. Écran d'Accueil (Dashboard)

Une fois connecté, vous verrez :
- **En-tête** : Titre et barre de recherche
- **Période d'évaluation** : Dates de la période en cours
- **Liste des évaluations** : Cartes avec toutes les infos
  - Nom de l'UE
  - Statut (En cours / À venir / Terminé)
  - Classes concernées
  - Nombre de questions
  - Période de validité
  - Bouton "Évaluer"

**Actions possibles :**
- Rechercher un quiz par nom
- Cliquer sur "Évaluer" pour démarrer un quiz

### 3. Écran de Profil

Accédez au profil via l'onglet "Profil" en bas :

**Fonctionnalités :**
- **Avatar** : Cliquez sur l'icône caméra pour changer votre photo
  - Sélectionnez une image depuis votre galerie
  - L'image s'affiche immédiatement
  - (Upload vers le serveur : en attente de l'endpoint API)
- **Informations** : Consultez vos informations personnelles
  - Nom & Prénom
  - Matricule
  - Classe et Niveau
  - École
  - Année Académique
- **Déconnexion** : Cliquez sur "Se Déconnecter" pour vous déconnecter

### 4. Passer un Quiz

1. Depuis l'écran d'accueil, cliquez sur "Évaluer" sur une carte de quiz
2. Confirmez le démarrage du quiz
3. **Navigation dans le quiz :**
   - Lisez la question
   - Pour les questions à choix multiple : sélectionnez une option
   - Pour les questions ouvertes : entrez votre réponse
   - Cliquez sur "Suivant" pour passer à la question suivante
   - Cliquez sur "Précédent" pour revenir en arrière
4. **Soumission :**
   - Sur la dernière question, cliquez sur "Soumettre"
   - Confirmez la soumission
   - Vous serez redirigé vers l'écran d'accueil

## 🔍 Points à Vérifier

### ✅ Authentification
- [ ] La connexion fonctionne avec des identifiants valides
- [ ] Un message d'erreur s'affiche avec des identifiants invalides
- [ ] Le token est stocké de manière sécurisée
- [ ] La déconnexion fonctionne correctement

### ✅ Écran d'Accueil
- [ ] Les évaluations se chargent depuis l'API
- [ ] La recherche filtre correctement les résultats
- [ ] Les badges de statut sont corrects (En cours / À venir / Terminé)
- [ ] Les boutons "Évaluer" sont désactivés pour les quiz terminés ou à venir
- [ ] La navigation vers le quiz fonctionne

### ✅ Écran de Profil
- [ ] Les informations de l'utilisateur s'affichent correctement
- [ ] Le changement d'avatar ouvre le sélecteur d'images
- [ ] L'image sélectionnée s'affiche immédiatement
- [ ] La déconnexion fonctionne avec confirmation

### ✅ Écran de Quiz
- [ ] Les questions se chargent correctement
- [ ] La barre de progression se met à jour
- [ ] Les badges de type de question s'affichent
- [ ] La sélection des réponses fonctionne
- [ ] La navigation entre questions fonctionne
- [ ] La soumission envoie les réponses à l'API
- [ ] Un message de succès s'affiche après soumission

## 🐛 Débogage

### Problèmes Courants

#### L'application ne se connecte pas à l'API
1. Vérifiez que le fichier `.env` existe et contient la bonne URL
2. Vérifiez votre connexion internet
3. Consultez les logs dans le terminal :
```bash
# Les logs afficheront l'URL de l'API au démarrage
🌐 API URL configurée: https://equizz-production.up.railway.app/api
```

#### Erreur 401 (Non authentifié)
- Le token a peut-être expiré
- Déconnectez-vous et reconnectez-vous

#### Les images ne se chargent pas
- Vérifiez que vous avez accordé les permissions d'accès à la galerie
- Sur iOS : Paramètres > Expo Go > Photos
- Sur Android : Paramètres > Applications > Expo Go > Autorisations

### Logs de Débogage

L'application affiche des logs utiles dans la console :
```javascript
// État d'authentification
console.log('Auth state:', { isAuthenticated, utilisateur });

// Chargement des quiz
console.log('Accueil state:', { quizzes, loading, error });

// Détails d'un quiz
console.log('Quiz details:', { quizz, loading, error });

// Sélection d'avatar
console.log('📸 Image sélectionnée:', imageUri);
```

## 📊 Structure de Données

### Utilisateur
```typescript
{
  id: string;
  nom: string;
  prenom: string;
  email: string;
  matricule: string;
  role: 'etudiant';
  Classe?: {
    nom: string;
    Niveau: { nom: string; }
  };
  Ecole?: { nom: string; };
  anneeScolaire?: string;
}
```

### Évaluation
```typescript
{
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
{
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

## 🎯 Scénarios de Test Recommandés

### Scénario 1 : Premier Utilisateur
1. Réclamation de compte
2. Connexion avec les identifiants reçus
3. Consultation du profil
4. Changement d'avatar
5. Consultation des quiz disponibles
6. Passage d'un quiz complet
7. Déconnexion

### Scénario 2 : Utilisateur Existant
1. Connexion directe
2. Recherche d'un quiz spécifique
3. Démarrage d'un quiz
4. Navigation entre les questions
5. Soumission du quiz
6. Vérification du profil
7. Déconnexion

### Scénario 3 : Gestion des Erreurs
1. Tentative de connexion avec des identifiants invalides
2. Tentative d'accès à un quiz sans connexion internet
3. Tentative de soumission d'un quiz incomplet
4. Vérification des messages d'erreur

## 📞 Support

En cas de problème :
1. Consultez les logs dans le terminal
2. Vérifiez la configuration de l'API
3. Assurez-vous que l'API de production est accessible
4. Vérifiez les permissions de l'application

## 🎉 Bon Test !

L'application est prête à être testée. Tous les flux sont fonctionnels et connectés à l'API de production.

**Branche Git** : `feature/STUDENT-full-ui-flow`
