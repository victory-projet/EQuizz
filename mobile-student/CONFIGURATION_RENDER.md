# Configuration Backend Render pour Mobile

## 🎯 URL du Backend

L'application mobile est maintenant configurée pour utiliser le backend hébergé sur Render :

```
https://equizz-backend.onrender.com/api
```

---

## 📋 Initialisation de la Base de Données en Ligne

### Méthode 1 : Via l'API (Recommandé)

Utilisez ces endpoints pour initialiser la base de données sur Render :

#### 1. Réinitialiser la base de données
```bash
curl -X POST https://equizz-backend.onrender.com/api/init/reset
```

#### 2. Peupler avec des données de test
```bash
curl -X POST https://equizz-backend.onrender.com/api/init/seed
```

#### 3. Vérifier le statut
```bash
curl https://equizz-backend.onrender.com/api/init/status
```

### Méthode 2 : Via Postman/Insomnia

1. Ouvrez Postman ou Insomnia
2. Créez une nouvelle requête POST
3. URL : `https://equizz-backend.onrender.com/api/init/reset`
4. Envoyez la requête
5. Puis envoyez une requête POST à : `https://equizz-backend.onrender.com/api/init/seed`

---

## 👤 Comptes de Test Créés

Après avoir exécuté `/api/init/seed`, ces comptes sont disponibles :

### Administrateur
```
Email: super.admin@saintjeaningenieur.org
Mot de passe: Admin123!
```

### Enseignant
```
Email: marie.dupont@saintjeaningenieur.org
Mot de passe: Prof123!
```

### Étudiant
```
Email: sophie.bernard@saintjeaningenieur.org
Mot de passe: Etudiant123!
```

---

## 🔧 Configuration Locale (Développement)

Si vous voulez tester avec votre backend local :

### 1. Trouver votre IP locale

**Windows :**
```bash
ipconfig
# Cherchez "Adresse IPv4" (ex: 192.168.1.100)
```

**Mac/Linux :**
```bash
ifconfig
# Cherchez "inet" (ex: 192.168.1.100)
```

### 2. Modifier la configuration

Dans `mobile-student/src/core/config.ts` et `mobile-student/src/core/api.ts`, remplacez :
```typescript
'https://equizz-backend.onrender.com/api'
```

Par :
```typescript
'http://VOTRE_IP:8080/api'  // Exemple: 'http://192.168.1.100:8080/api'
```

⚠️ **Important** : N'utilisez PAS `localhost` ou `127.0.0.1` car le mobile ne peut pas y accéder !

---

## 🚀 Lancer l'Application Mobile

```bash
cd mobile-student
npm install
npx expo start
```

Puis scannez le QR code avec :
- **Android** : Expo Go app
- **iOS** : Camera app

---

## ⚠️ Points Importants

### Délai de Démarrage Render
- Le service Render gratuit s'endort après 15 minutes d'inactivité
- Le premier appel peut prendre **30-60 secondes** pour réveiller le service
- Soyez patient lors de la première connexion !

### Timeout
- Le timeout est configuré à 15 secondes dans `api.ts`
- Suffisant pour le réveil du service Render

### CORS
- Le backend est configuré pour accepter toutes les origines
- Pas de problème CORS avec l'application mobile

---

## 🧪 Tester la Connexion

### Test Rapide
```bash
# Vérifier que le backend répond
curl https://equizz-backend.onrender.com/api/init/status

# Devrait retourner quelque chose comme :
# {"status":"ok","database":"connected","timestamp":"..."}
```

### Depuis l'Application Mobile

1. Lancez l'app mobile
2. Allez sur l'écran de connexion
3. Utilisez les identifiants de test
4. Si ça prend du temps, c'est normal (réveil du service)

---

## 🔄 Réinitialiser les Données

Si vous voulez repartir de zéro :

```bash
# 1. Réinitialiser
curl -X POST https://equizz-backend.onrender.com/api/init/reset

# 2. Repeupler
curl -X POST https://equizz-backend.onrender.com/api/init/seed
```

---

## 📱 Variables d'Environnement (Optionnel)

Vous pouvez aussi utiliser un fichier `.env` dans `mobile-student/` :

```env
EXPO_PUBLIC_API_URL=https://equizz-backend.onrender.com/api
```

Puis dans le code, ça sera automatiquement utilisé via `process.env.EXPO_PUBLIC_API_URL`

---

## 🆘 Dépannage

### L'app ne se connecte pas
1. Vérifiez que le backend est bien démarré sur Render
2. Testez l'URL dans votre navigateur : https://equizz-backend.onrender.com/api/init/status
3. Vérifiez les logs dans la console Expo

### Erreur "Network Error"
- Le service Render est peut-être en train de démarrer (attendez 30-60s)
- Vérifiez votre connexion internet
- Vérifiez l'URL dans `config.ts` et `api.ts`

### Erreur 401 (Unauthorized)
- Le token a expiré, reconnectez-vous
- Vérifiez que la base de données est initialisée

### Base de données vide
- Exécutez les endpoints `/api/init/reset` puis `/api/init/seed`

---

## ✅ Checklist

- [x] URL Render configurée dans `config.ts`
- [x] URL Render configurée dans `api.ts`
- [ ] Base de données initialisée (exécuter `/api/init/reset` et `/api/init/seed`)
- [ ] Comptes de test créés
- [ ] Application mobile testée avec les identifiants

---

**🎉 Configuration terminée ! Vous pouvez maintenant utiliser l'application mobile avec le backend Render.**
