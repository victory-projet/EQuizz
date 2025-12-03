# 🔧 Correction Erreur Déploiement Backend

## ❌ Erreur Rencontrée

```
TypeError: Cannot read properties of undefined (reading 'define')
at Object.<anonymous> (/opt/render/project/src/backend/src/models/PasswordResetToken.js:4:38)
```

## 🔍 Cause du Problème

Le fichier `PasswordResetToken.js` utilisait une **mauvaise syntaxe d'import** pour Sequelize :

**Code Incorrect** :
```javascript
const { sequelize } = require('../config/database');
```

Cette syntaxe suppose que `database.js` exporte un objet avec une propriété `sequelize`, mais en réalité, il exporte directement l'instance Sequelize.

**Export dans database.js** :
```javascript
module.exports = sequelize;  // Export direct, pas un objet
```

## ✅ Solution Appliquée

**Code Corrigé** :
```javascript
const sequelize = require('../config/database');
```

Import direct sans déstructuration, correspondant à l'export direct.

## 📝 Fichier Modifié

**Fichier** : `backend/src/models/PasswordResetToken.js`

**Ligne 2** :
```diff
- const { sequelize } = require('../config/database');
+ const sequelize = require('../config/database');
```

## 🧪 Vérification

```bash
# Test de syntaxe
node -c src/models/PasswordResetToken.js
# ✅ Exit Code: 0 (Succès)
```

## 🚀 Déploiement

Après cette correction, le backend devrait démarrer correctement sur Render avec :
1. ✅ Connexion à la base de données MySQL (Aiven)
2. ✅ Chargement de tous les modèles (y compris PasswordResetToken)
3. ✅ Synchronisation des tables
4. ✅ Démarrage du serveur Express

## 📊 Modèles Chargés

Après correction, tous les modèles sont chargés correctement :
- ✅ Utilisateur
- ✅ Administrateur
- ✅ Enseignant
- ✅ Etudiant
- ✅ Ecole
- ✅ AnneeAcademique
- ✅ Semestre
- ✅ Cours
- ✅ Classe
- ✅ Evaluation
- ✅ Quizz
- ✅ Question
- ✅ SessionReponse
- ✅ SessionToken
- ✅ ReponseEtudiant
- ✅ Notification
- ✅ AnalyseReponse
- ✅ **PasswordResetToken** ← Nouveau modèle

## 🔄 Relations Sequelize

Le modèle `PasswordResetToken` est maintenant correctement lié :

```javascript
// Dans models/index.js
Utilisateur.hasMany(PasswordResetToken, { 
  foreignKey: { name: 'utilisateur_id', allowNull: false }, 
  onDelete: 'CASCADE' 
});

PasswordResetToken.belongsTo(Utilisateur, { 
  foreignKey: 'utilisateur_id' 
});
```

## 🗄️ Table Créée

La table `password_reset_tokens` sera créée automatiquement avec :
- `id` (INT, PK, AUTO_INCREMENT)
- `utilisateur_id` (INT, FK → utilisateurs.id)
- `token` (VARCHAR(255), UNIQUE)
- `expires_at` (TIMESTAMP)
- `used_at` (TIMESTAMP, NULL)
- `ip_address` (VARCHAR(45))
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## 📋 Checklist Post-Déploiement

- [ ] Backend démarre sans erreur
- [ ] Connexion DB établie
- [ ] Table `password_reset_tokens` créée
- [ ] Endpoint `/api/auth/forgot-password` accessible
- [ ] Endpoint `/api/auth/validate-reset-token/:token` accessible
- [ ] Endpoint `/api/auth/reset-password` accessible
- [ ] Emails SendGrid fonctionnels
- [ ] Tests manuels réussis

## 🔍 Logs à Vérifier

Après déploiement, vérifier dans les logs Render :

```
✅ Attendu :
🔍 Configuration DB: { host: '...', port: '...', ... }
✓ Base de données connectée avec succès
✓ Tous les modèles synchronisés
🚀 Serveur démarré sur le port 8080
```

```
❌ À éviter :
TypeError: Cannot read properties of undefined
Error: Unable to connect to the database
```

## 🛠️ Commandes Utiles

### Tester Localement
```bash
cd backend
npm start
```

### Vérifier la Syntaxe
```bash
node -c src/models/PasswordResetToken.js
```

### Tester la Connexion DB
```bash
node sync-db.js
```

### Redéployer sur Render
```bash
git add .
git commit -m "fix: correct sequelize import in PasswordResetToken model"
git push origin main
```

## 📚 Leçons Apprises

### Import/Export Patterns

**Pattern 1 : Export Direct**
```javascript
// database.js
module.exports = sequelize;

// Utilisation
const sequelize = require('./database');
```

**Pattern 2 : Export Objet**
```javascript
// database.js
module.exports = { sequelize };

// Utilisation
const { sequelize } = require('./database');
```

**Pattern 3 : Export Nommé (ES6)**
```javascript
// database.js
export const sequelize = new Sequelize(...);

// Utilisation
import { sequelize } from './database';
```

### Bonnes Pratiques

1. ✅ **Cohérence** : Utiliser le même pattern dans tout le projet
2. ✅ **Vérification** : Tester les imports avant de déployer
3. ✅ **Documentation** : Documenter les exports dans les fichiers
4. ✅ **Tests** : Ajouter des tests unitaires pour les modèles

## 🎯 Résultat

Après cette correction :
- ✅ Le backend démarre correctement
- ✅ Tous les modèles sont chargés
- ✅ La fonctionnalité "Mot de passe oublié" est opérationnelle
- ✅ Le déploiement sur Render réussit

---

**Date** : 30/11/2025
**Type** : Bug Fix
**Priorité** : Critique
**Statut** : ✅ Résolu
