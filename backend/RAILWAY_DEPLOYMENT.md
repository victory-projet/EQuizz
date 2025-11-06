# Déploiement sur Railway

## Configuration des variables d'environnement

Sur Railway, allez dans votre service backend et ajoutez ces variables d'environnement :

### Base de données (MySQL Railway)
```
DB_HOST=<votre_host_mysql_railway>
DB_USER=<votre_user_mysql_railway>
DB_PASSWORD=<votre_password_mysql_railway>
DB_NAME=equizz_db
DB_DIALECT=mysql
```

### Email (Ethereal pour les tests)
```
EMAIL_HOST=smtp.ethereal.email
EMAIL_PORT=587
EMAIL_USER=alba72@ethereal.email
EMAIL_PASS=E4vA85zmggs5JjXHT3
```

**Note:** Créez de nouveaux identifiants Ethereal sur https://ethereal.email/ car ils expirent après quelques jours.

### JWT
```
JWT_SECRET=VOTRE_CLE_SECRETE_TRES_LONGUE_ET_ALEATOIRE
JWT_EXPIRES_IN=8h
```

### Port
```
PORT=8080
```

## Comment ajouter les variables sur Railway

1. Allez sur https://railway.app/
2. Sélectionnez votre projet
3. Cliquez sur votre service backend
4. Allez dans l'onglet "Variables"
5. Cliquez sur "New Variable"
6. Ajoutez chaque variable une par une
7. Railway redémarrera automatiquement votre service

## Initialiser la base de données

Une fois déployé, utilisez ces endpoints pour initialiser :

```bash
# Réinitialiser la base
curl -X POST https://votre-app.railway.app/api/init/reset

# Peupler avec les données initiales
curl -X POST https://votre-app.railway.app/api/init/seed
```

## Vérifier les logs

Pour voir si l'email est configuré correctement, consultez les logs Railway. Vous devriez voir :

```
📧 Configuration Email:
  EMAIL_HOST: smtp.ethereal.email
  EMAIL_PORT: 587
  EMAIL_USER: alba72@ethereal.email
✅ Serveur email prêt à envoyer des messages
```
