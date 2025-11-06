# EQuizz - Application Mobile Étudiant

Application mobile pour les étudiants de la plateforme EQuizz, construite avec **React Native**, **Expo** et **Clean Architecture**.

## 📱 Fonctionnalités

- **Authentification** : Connexion sécurisée avec JWT
- **Profil Étudiant** : Consultation et modification du profil avec avatar
- **Quiz Disponibles** : Liste des évaluations avec statuts (Nouveau, En cours, Terminé)
- **Passage de Quiz** : Interface intuitive pour répondre aux questions (choix multiple et ouvertes)
- **Suivi de Progression** : Sauvegarde automatique et reprise des quiz en cours
- **Gestion de Session** : Soumission anonyme des réponses

## 🏗️ Architecture Clean

Ce projet suit les principes de **Clean Architecture** avec une séparation stricte des responsabilités :

```
src/
├── domain/              # Logique métier pure
│   ├── entities/       # Entités (Utilisateur, Evaluation, Quizz, Question)
│   ├── repositories/   # Interfaces des repositories
│   └── usecases/       # Cas d'utilisation métier
│
├── data/                # Implémentation données
│   ├── repositories/   # Implémentations des repositories
│   └── datasources/    # Sources de données (API)
│
├── presentation/        # Interface utilisateur
│   ├── hooks/          # Custom React hooks
│   └── components/     # Composants UI réutilisables
│
├── core/                # Utilitaires transversaux
│   ├── di/             # Dependency Injection Container
│   ├── api.ts          # Configuration Axios
│   └── constants/      # Constantes
│
└── app/                 # Navigation Expo Router
    ├── (auth)/         # Écrans d'authentification
    └── (tabs)/         # Écrans principaux (Accueil, Quizz, Profil)
```

### Principes Respectés
- ✅ **SOLID** : Tous les principes appliqués
- ✅ **Séparation des responsabilités** : Chaque couche a son rôle
- ✅ **Testabilité** : Facile de mocker les dépendances
- ✅ **Maintenabilité** : Code organisé et prévisible

## 🛠️ Stack Technique

- **React Native** 0.81.5
- **Expo** ~54.0.20
- **TypeScript** ~5.9.2
- **Expo Router** : Navigation basée sur le système de fichiers
- **Axios** : Client HTTP
- **AsyncStorage** : Stockage local
- **Expo Image Picker** : Sélection d'avatar
- **Clean Architecture** : Architecture en couches

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** (v18 ou supérieur)
- **npm** ou **yarn**
- **Expo CLI** : `npm install -g expo-cli`
- **Expo Go** sur votre téléphone (Android/iOS) OU un émulateur configuré

## 🚀 Installation & Lancement

### 1. Cloner le Projet

```bash
git clone <URL_DU_DEPOT>
cd mobile-student
```

### 2. Installer les Dépendances

```bash
npm install
```

### 3. Configurer l'Environnement

Créez un fichier `.env` à la racine du projet :

```env
API_URL=http://192.168.X.X:3000/api
```

**Important** : Remplacez `192.168.X.X` par l'adresse IP locale de votre machine (pas `localhost`).

Pour trouver votre IP :
- **Windows** : `ipconfig` dans cmd
- **macOS/Linux** : `ifconfig` ou `ip a` dans le terminal

### 4. Lancer l'Application

```bash
npm start
```

Scannez le QR code avec **Expo Go** ou appuyez sur :
- `a` pour Android
- `i` pour iOS

## 📱 Utilisation

### Connexion

Utilisez les identifiants d'un étudiant existant dans la base de données :
- **Email** : `etudiant@example.com`
- **Mot de passe** : `password123`

### Navigation

L'application comporte 3 onglets principaux :

1. **Accueil** : Liste des évaluations disponibles avec leurs statuts
2. **Quizz** : Passage des quiz ou reprise d'un quiz en cours
3. **Profil** : Consultation et modification du profil étudiant

### Passer un Quiz

1. Depuis l'**Accueil**, cliquez sur "Commencer" pour un nouveau quiz
2. Répondez aux questions (choix multiple ou ouvertes)
3. Naviguez avec les boutons "Précédent" et "Suivant"
4. Soumettez vos réponses à la fin

Le quiz est automatiquement sauvegardé et peut être repris plus tard depuis l'onglet **Quizz**.

## 💻 Développement

### Structure des Écrans

```
app/
├── (auth)/
│   └── login.tsx       # Écran de connexion
└── (tabs)/
    ├── accueil.tsx     # Liste des évaluations
    ├── quizz.tsx       # Passage de quiz
    └── profil.tsx      # Profil étudiant
```

### Utiliser un Hook

```typescript
import { useAuth } from '@/src/presentation/hooks/useAuth';

export default function MyScreen() {
    const { utilisateur, loading, error } = useAuth();
    
    if (loading) return <LoadingSpinner />;
    if (error) return <Text>Erreur: {error}</Text>;
    
    return <Text>Bonjour {utilisateur?.prenom}</Text>;
}
```

### Ajouter une Nouvelle Fonctionnalité

1. **Créer l'entité** dans `domain/entities/`
2. **Créer l'interface repository** dans `domain/repositories/`
3. **Créer le use case** dans `domain/usecases/`
4. **Implémenter le repository** dans `data/repositories/`
5. **Créer le datasource** dans `data/datasources/`
6. **Créer le hook** dans `presentation/hooks/`
7. **Enregistrer dans le DI Container** (`core/di/container.ts`)
8. **Utiliser dans l'écran** via le hook

## 🔧 Configuration Backend

L'application nécessite un backend EQuizz fonctionnel. Assurez-vous que :

1. Le backend est démarré sur `http://localhost:3000`
2. Les endpoints suivants sont disponibles :
   - `POST /api/auth/login` : Authentification
   - `GET /api/student/me` : Profil étudiant
   - `GET /api/student/quizzes` : Liste des évaluations
   - `GET /api/student/quizzes/:id` : Détails d'un quiz
   - `POST /api/student/quizzes/:id/submit` : Soumission des réponses

## 📝 Workflow Git

1. Créez votre branche : `git checkout -b feature/STUDENT-description`
2. Développez et commitez régulièrement
3. Poussez : `git push origin feature/STUDENT-description`
4. Créez une Pull Request vers `develop`

### Conventions de Commit

```
feat: Ajout d'une nouvelle fonctionnalité
fix: Correction d'un bug
refactor: Refactorisation du code
style: Modifications de style (formatage)
docs: Mise à jour de la documentation
```

## 🐛 Dépannage

### L'application ne se connecte pas au backend

- Vérifiez que l'adresse IP dans `.env` est correcte
- Assurez-vous que le backend est démarré
- Vérifiez que votre téléphone et votre ordinateur sont sur le même réseau WiFi

### Erreur "Network request failed"

- Désactivez temporairement le pare-feu
- Vérifiez que le port 3000 n'est pas bloqué

### Le quiz ne se charge pas

- Vérifiez que l'étudiant est bien associé à une classe
- Vérifiez que des évaluations sont publiées pour cette classe

## 📄 Licence

Ce projet est développé dans le cadre d'un projet académique.

## 👥 Contributeurs

- Équipe de développement EQuizz
