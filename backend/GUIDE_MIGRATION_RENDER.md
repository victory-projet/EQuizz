# Guide de Migration vers Render (100% Gratuit)

## 🎯 Solution Choisie : Render + Aiven MySQL

- **Backend Node.js** : Render (gratuit, 750h/mois)
- **Base de données MySQL** : Aiven (gratuit, 1 GB)

---

## 📋 Étape 1 : Créer la Base de Données MySQL sur Aiven

1. Allez sur **https://aiven.io**
2. Créez un compte gratuit (pas de carte bancaire requise)
3. Cliquez sur **"Create Service"**
4. Sélectionnez :
   - Service : **MySQL**
   - Cloud : **Google Cloud** ou **AWS**
   - Region : Choisissez la plus proche (ex: europe-west1)
   - Plan : **Free** (1 GB)
5. Nommez votre service : `equizz-mysql`
6. Cliquez sur **"Create Service"**
7. Attendez 2-3 minutes que le service démarre

### Récupérer les informations de connexion :

Une fois le service démarré, notez ces informations (onglet "Overview") :

```
Host: mysql-xxxxx.aivencloud.com
Port: 12345
User: avnadmin
Password: xxxxxxxxxx
Database: defaultdb
```

---

## 📋 Étape 2 : Déployer le Backend sur Render

### Option A : Déploiement via GitHub (Recommandé)

1. **Poussez votre code sur GitHub** :
   ```bash
   git add .
   git commit -m "Configuration pour Render"
   git push origin main
   ```

2. **Allez sur https://render.com**
3. Créez un compte gratuit (pas de carte bancaire requise)
4. Cliquez sur **"New +"** → **"Web Service"**
5. Connectez votre repository GitHub
6. Sélectionnez le repository `EQuizz`

### Configuration du Service :

- **Name** : `equizz-backend`
- **Region** : Frankfurt (ou le plus proche)
- **Root Directory** : `backend`
- **Environment** : `Node`
- **Build Command** : `npm install`
- **Start Command** : `npm start`
- **Plan** : **Free**

### Configurer les Variables d'Environnement :

Dans l'onglet "Environment", ajoutez :

```
NODE_ENV=production
PORT=10000
DB_DIALECT=mysql

# Informations depuis Aiven (IMPORTANT: vérifiez bien ces valeurs)
DB_HOST=mysql-xxxxx.aivencloud.com
DB_PORT=12345
DB_USER=avnadmin
DB_PASSWORD=votre_mot_de_passe_aiven
DB_NAME=defaultdb

# Vos clés API existantes
JWT_SECRET=votre_secret_jwt_tres_long_et_aleatoire
JWT_EXPIRES_IN=8h
SENDGRID_API_KEY=votre_cle_sendgrid
SENDGRID_VERIFIED_SENDER=votre.email@verifie.com
GOOGLE_AI_API_KEY=votre_cle_google_ai
```

7. Cliquez sur **"Create Web Service"**

---

## 📋 Étape 3 : Initialiser la Base de Données

Une fois le déploiement terminé :

1. Votre backend sera accessible à : `https://equizz-backend.onrender.com`
2. La base de données se synchronisera automatiquement au premier démarrage
3. Testez l'API : `https://equizz-backend.onrender.com/api/init/status`

---

## 🔧 Option B : Déploiement Manuel (sans GitHub)

Si vous ne voulez pas utiliser GitHub :

1. Sur Render, choisissez **"Deploy from Git"** → **"Public Git repository"**
2. Ou utilisez le fichier `render.yaml` fourni

---

## ⚠️ Points Importants

### Limitations du Plan Gratuit Render :
- Le service s'endort après 15 minutes d'inactivité
- Premier démarrage peut prendre 30-60 secondes
- 750 heures/mois (suffisant pour un projet étudiant)

### Limitations Aiven MySQL Gratuit :
- 1 GB de stockage
- Pas de backup automatique
- Suffisant pour développement/test

### Pour éviter que le service s'endorme :
Vous pouvez utiliser un service de ping gratuit comme **UptimeRobot** ou **Cron-job.org** pour faire une requête toutes les 10 minutes.

---

## 🔄 Migration des Données (si vous avez déjà des données)

Si vous avez des données sur Railway/PlanetScale :

1. **Exportez depuis l'ancienne base** :
   ```bash
   mysqldump -h ancien_host -u ancien_user -p ancien_db > backup.sql
   ```

2. **Importez vers Aiven** :
   ```bash
   mysql -h mysql-xxxxx.aivencloud.com -u avnadmin -p defaultdb < backup.sql
   ```

---

## 🧪 Tester Localement avec Aiven

Mettez à jour votre `.env` local :

```env
DB_HOST=mysql-xxxxx.aivencloud.com
DB_USER=avnadmin
DB_PASSWORD=votre_mot_de_passe_aiven
DB_NAME=defaultdb
DB_DIALECT=mysql
```

Puis testez :
```bash
npm start
```

---

## 📱 Mettre à Jour le Frontend

Dans votre frontend Angular, mettez à jour l'URL de l'API :

```typescript
// frontend-admin/src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://equizz-backend.onrender.com/api'
};
```

---

## ✅ Checklist de Migration

- [ ] Compte Aiven créé
- [ ] Base MySQL Aiven créée et démarrée
- [ ] Informations de connexion notées
- [ ] Code poussé sur GitHub
- [ ] Compte Render créé
- [ ] Web Service créé sur Render
- [ ] Variables d'environnement configurées
- [ ] Déploiement réussi
- [ ] Base de données synchronisée
- [ ] API testée et fonctionnelle
- [ ] Frontend mis à jour avec nouvelle URL

---

## 🆘 Dépannage

### Le service ne démarre pas :
- Vérifiez les logs dans Render Dashboard
- Vérifiez que toutes les variables d'environnement sont définies

### Erreur de connexion à la base (ETIMEDOUT) :
1. **Vérifiez que TOUTES les variables d'environnement sont configurées sur Render**
   - Allez dans Environment → vérifiez DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
   - Cliquez sur "Save Changes" après avoir ajouté les variables
   
2. **Vérifiez que le service Aiven MySQL est démarré**
   - Allez sur https://console.aiven.io
   - Le statut doit être "Running" (vert)
   - Notez bien le Host ET le Port (pas seulement le host)
   
3. **Vérifiez les informations de connexion depuis Aiven**
   - Dans Aiven, onglet "Overview"
   - Copiez exactement : Host, Port, User, Password, Database
   - Le port n'est PAS 3306 par défaut sur Aiven (souvent 12xxx)
   
4. **Après avoir modifié les variables, redéployez**
   - Sur Render, cliquez sur "Manual Deploy" → "Clear build cache & deploy"

### Le service est lent :
- Normal pour le plan gratuit après inactivité
- Utilisez UptimeRobot pour le garder actif

---

## 💰 Coût Total : 0€

✅ Render : Gratuit (750h/mois)
✅ Aiven MySQL : Gratuit (1 GB)
✅ Pas de carte bancaire requise

---

## 🚀 Prochaines Étapes

Une fois la migration terminée, vous pouvez :
1. Supprimer vos services Railway/PlanetScale
2. Configurer un nom de domaine personnalisé (optionnel)
3. Mettre en place UptimeRobot pour éviter l'endormissement
