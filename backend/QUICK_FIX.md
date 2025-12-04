# 🚨 Solution Rapide - Erreur "Table doesn't exist"

## Problème
L'erreur `Table 'defaultdb.utilisateur' doesn't exist` signifie que les tables n'ont pas été créées dans votre base de données Aiven.

## Solution Immédiate

### Option 1: Redéployer sur Render (Recommandé)

1. **Commitez les changements**:
   ```bash
   git add .
   git commit -m "Fix: Auto-create database tables on startup"
   git push
   ```

2. **Render va automatiquement redéployer** et créer les tables au démarrage

3. **Attendez que le déploiement soit terminé** (vérifiez les logs Render)

4. **Peuplez la base de données**:
   ```bash
   curl -X POST https://equizz-backend.onrender.com/api/init/seed
   ```

### Option 2: Créer les tables manuellement

Si vous avez accès au shell Render:

1. **Connectez-vous au shell Render**

2. **Exécutez**:
   ```bash
   npm run db:setup
   ```

3. **Peuplez la base**:
   ```bash
   curl -X POST https://equizz-backend.onrender.com/api/init/seed
   ```

### Option 3: Via Aiven Console

1. **Connectez-vous à console.aiven.io**

2. **Ouvrez votre service MySQL**

3. **Allez dans "Query Editor"**

4. **Exécutez le script SQL** (voir ci-dessous)

## Script SQL Manuel (Si nécessaire)

Si les options ci-dessus ne fonctionnent pas, vous pouvez créer les tables manuellement via Aiven Query Editor:

```sql
-- Créer la table utilisateur
CREATE TABLE IF NOT EXISTS utilisateur (
  id VARCHAR(36) PRIMARY KEY,
  nom VARCHAR(255) NOT NULL,
  prenom VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  mot_de_passe_hash VARCHAR(255),
  est_actif BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

-- Créer les autres tables...
-- (Le script complet est trop long, utilisez plutôt npm run db:setup)
```

## Vérification

Après avoir appliqué la solution:

1. **Testez l'endpoint de seed**:
   ```bash
   curl -X POST https://equizz-backend.onrender.com/api/init/seed
   ```

2. **Vous devriez recevoir**:
   ```json
   {
     "success": true,
     "message": "✅ Base de données peuplée avec succès !",
     "credentials": {
       "admin": {
         "email": "super.admin@saintjeaningenieur.org",
         "password": "Admin123!"
       }
     }
   }
   ```

3. **Testez la connexion**:
   ```bash
   curl https://equizz-backend.onrender.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"super.admin@saintjeaningenieur.org","password":"Admin123!"}'
   ```

## Changements Effectués

Les fichiers suivants ont été modifiés pour résoudre le problème:

1. **backend/app.js**: Ajout de `sequelize.sync()` au démarrage
2. **backend/src/config/database.js**: Configuration SSL améliorée pour Aiven
3. **backend/setup-db.js**: Nouveau script pour créer les tables
4. **backend/test-aiven-connection.js**: Script de test de connexion
5. **backend/package.json**: Ajout des scripts `db:setup` et `db:test`

## Prochaines Étapes

1. ✅ Commitez et pushez les changements
2. ✅ Attendez le redéploiement Render
3. ✅ Appelez `/api/init/seed` pour peupler la base
4. ✅ Testez votre application

## Support

Si le problème persiste:
- Vérifiez les logs Render
- Exécutez `npm run db:test` localement avec les credentials Aiven
- Vérifiez que le service Aiven est actif
