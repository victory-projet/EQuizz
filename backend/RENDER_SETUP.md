# Configuration Render - Guide Étape par Étape

## 📋 Prérequis

1. Compte Aiven (console.aiven.io) avec un service MySQL actif
2. Compte Render (render.com)
3. Dépôt Git avec le code

## 🚀 Étape 1: Récupérer les Informations Aiven

1. Connectez-vous à **console.aiven.io**
2. Sélectionnez votre service MySQL
3. Cliquez sur **"Overview"**
4. Notez les informations suivantes:

```
Host: mysql-xxxxx-xxxxx.aivencloud.com
Port: 12345
User: avnadmin
Password: [Cliquez sur "Show" pour voir]
Database: defaultdb
```

## 🔧 Étape 2: Créer le Service sur Render

1. Connectez-vous à **render.com**
2. Cliquez sur **"New +"** → **"Web Service"**
3. Connectez votre dépôt Git
4. Configurez le service:

### Configuration de Base

```
Name: equizz-backend
Region: Frankfurt (ou le plus proche d'Aiven)
Branch: main (ou votre branche de production)
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: npm start
```

### Plan

```
Plan: Free (ou selon vos besoins)
```

## 🔐 Étape 3: Configurer les Variables d'Environnement

Dans la section **"Environment"** de Render, ajoutez ces variables:

### Variables Requises

```bash
# Configuration Serveur
NODE_ENV=production
PORT=10000

# Base de Données Aiven
DB_HOST=mysql-xxxxx-xxxxx.aivencloud.com
DB_PORT=12345
DB_USER=avnadmin
DB_PASSWORD=VOTRE_MOT_DE_PASSE_AIVEN
DB_NAME=defaultdb
DB_DIALECT=mysql

# JWT (Générez un secret fort)
JWT_SECRET=VOTRE_SECRET_JWT_MINIMUM_32_CARACTERES
JWT_EXPIRES_IN=8h

# SendGrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_VERIFIED_SENDER=votre.email@verifie.com

# Google AI (Optionnel)
GOOGLE_AI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### Générer un JWT Secret Fort

Utilisez cette commande dans votre terminal local:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copiez le résultat dans `JWT_SECRET`.

## 📦 Étape 4: Déployer

1. Cliquez sur **"Create Web Service"**
2. Render va automatiquement:
   - Cloner votre dépôt
   - Installer les dépendances (`npm install`)
   - Démarrer l'application (`npm start`)
   - **Créer automatiquement les tables** dans Aiven

3. Attendez que le déploiement soit terminé (vérifiez les logs)

## ✅ Étape 5: Vérifier le Déploiement

### 5.1 Vérifier les Logs

Dans Render, allez dans **"Logs"** et vérifiez:

```
✅ Connexion à la base de données établie avec succès.
✅ Base de données synchronisée avec succès.
🚀 Serveur démarré sur le port 10000
```

### 5.2 Tester l'API

Utilisez l'URL fournie par Render (ex: `https://equizz-backend.onrender.com`)

```bash
# Test de santé (si vous avez une route health)
curl https://equizz-backend.onrender.com/

# Devrait retourner une erreur 404 avec un message JSON
```

## 🌱 Étape 6: Peupler la Base de Données

Une fois le déploiement réussi, peuplez la base:

```bash
curl -X POST https://equizz-backend.onrender.com/api/init/seed
```

**Réponse attendue:**

```json
{
  "success": true,
  "message": "✅ Base de données peuplée avec succès !",
  "data": {
    "ecole": "Saint Jean Ingenieur",
    "classes": 4,
    "cours": 3,
    "enseignants": 2,
    "etudiants": 5,
    "evaluations": 1,
    "questions": 5
  },
  "credentials": {
    "admin": {
      "email": "super.admin@saintjeaningenieur.org",
      "password": "Admin123!"
    },
    "enseignant": {
      "email": "marie.dupont@saintjeaningenieur.org",
      "password": "Prof123!"
    },
    "etudiant": {
      "email": "sophie.bernard@saintjeaningenieur.org",
      "password": "Etudiant123!"
    }
  }
}
```

## 🧪 Étape 7: Tester la Connexion

Testez la connexion avec un compte admin:

```bash
curl -X POST https://equizz-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "super.admin@saintjeaningenieur.org",
    "password": "Admin123!"
  }'
```

**Réponse attendue:**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "nom": "admin",
    "prenom": "super",
    "email": "super.admin@saintjeaningenieur.org",
    "role": "ADMINISTRATEUR"
  }
}
```

## 🔄 Étape 8: Configurer le Frontend

Dans votre application frontend (Angular), mettez à jour l'URL de l'API:

```typescript
// environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://equizz-backend.onrender.com/api'
};
```

## 🛠️ Dépannage

### Erreur: "Table doesn't exist"

**Cause**: Les tables n'ont pas été créées automatiquement.

**Solution**:
1. Vérifiez les logs Render
2. Redéployez le service (Manual Deploy)
3. Ou connectez-vous au shell Render et exécutez:
   ```bash
   npm run db:setup
   ```

### Erreur: "Connection timeout"

**Cause**: Problème de connexion à Aiven.

**Solution**:
1. Vérifiez que le service Aiven est actif
2. Vérifiez les credentials dans les variables d'environnement
3. Vérifiez que `DB_PORT` est correct (généralement 12345)

### Erreur: "SSL connection error"

**Cause**: Configuration SSL incorrecte.

**Solution**: Les changements récents dans `database.js` devraient résoudre ce problème. Si ça persiste:
1. Vérifiez que `NODE_ENV=production` est défini
2. Redéployez le service

### Service en "Sleeping" (Plan Free)

**Cause**: Render met les services gratuits en veille après 15 minutes d'inactivité.

**Solution**:
- Le service se réveille automatiquement à la première requête (peut prendre 30-60 secondes)
- Pour éviter cela, passez à un plan payant

## 📊 Monitoring

### Logs en Temps Réel

Dans Render, allez dans **"Logs"** pour voir les logs en temps réel.

### Métriques

Dans Render, allez dans **"Metrics"** pour voir:
- CPU usage
- Memory usage
- Request count
- Response time

## 🔄 Mises à Jour

Pour déployer une nouvelle version:

1. **Automatique**: Pushez sur votre branche Git
   ```bash
   git add .
   git commit -m "Update: description"
   git push
   ```
   Render redéploie automatiquement.

2. **Manuel**: Dans Render, cliquez sur **"Manual Deploy"** → **"Deploy latest commit"**

## 🔐 Sécurité

### Recommandations

1. ✅ Utilisez des secrets forts (JWT_SECRET minimum 32 caractères)
2. ✅ Ne commitez jamais les fichiers `.env`
3. ✅ Changez les mots de passe par défaut après le premier déploiement
4. ✅ Activez HTTPS (automatique sur Render)
5. ✅ Limitez l'accès à la base de données Aiven si possible

### Rotation des Secrets

Pour changer le JWT_SECRET:
1. Générez un nouveau secret
2. Mettez à jour la variable dans Render
3. Redéployez
4. ⚠️ Tous les tokens existants seront invalidés

## 📞 Support

- **Render**: https://render.com/docs
- **Aiven**: https://docs.aiven.io
- **Documentation API**: Voir `API_DOCUMENTATION.md`
- **Problèmes courants**: Voir `QUICK_FIX.md`
