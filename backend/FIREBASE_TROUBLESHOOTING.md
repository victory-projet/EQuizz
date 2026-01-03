# 🔥 Guide de dépannage Firebase

## 🔍 Problème identifié
- **Erreur 404** sur l'endpoint `/batch` de Firebase
- **Status 401** lors de la vérification du projet
- Le projet `equizz-cab71` semble avoir des problèmes d'accès

## 🛠️ Solutions à tester

### 1. Vérifier le projet Firebase
1. Aller sur [Firebase Console](https://console.firebase.google.com/)
2. Se connecter avec `gillsimo08@gmail.com`
3. Vérifier si le projet `equizz-cab71` existe
4. Si le projet n'existe pas, le recréer

### 2. Activer les APIs nécessaires
Dans la console Firebase :
1. Aller dans **Project Settings** > **Cloud Messaging**
2. Vérifier que l'API Cloud Messaging est activée
3. Aller dans **Google Cloud Console** pour le projet
4. Activer l'API **Firebase Cloud Messaging API**

### 3. Régénérer le service account
1. Dans Firebase Console > **Project Settings** > **Service Accounts**
2. Cliquer sur **Generate new private key**
3. Télécharger le nouveau fichier JSON
4. Remplacer le contenu de `backend/config/firebase-service-account.json`

### 4. Alternative: Créer un nouveau projet Firebase
Si le projet actuel ne fonctionne pas :

1. **Créer un nouveau projet Firebase**
   - Nom: `equizz-v2` ou similaire
   - Activer Google Analytics (optionnel)

2. **Configurer Cloud Messaging**
   - Aller dans **Project Settings** > **Cloud Messaging**
   - Noter le **Server Key** et **Sender ID**

3. **Créer un service account**
   - **Project Settings** > **Service Accounts**
   - **Generate new private key**
   - Télécharger le fichier JSON

4. **Mettre à jour la configuration**
   - Remplacer le fichier `firebase-service-account.json`
   - Mettre à jour le `project_id` dans les variables d'environnement

### 5. Configuration mobile
Après avoir fixé le backend, mettre à jour l'app mobile :

1. **Android**: Remplacer `google-services.json`
2. **iOS**: Remplacer `GoogleService-Info.plist`
3. Reconstruire l'application

## 🧪 Test de validation
Après les corrections, exécuter :
```bash
cd backend
node test-firebase-connection.js
```

Le test devrait afficher :
- ✅ Firebase initialisé avec succès
- ✅ Service Messaging accessible
- ✅ Service Firebase fonctionne (erreur de token attendue)