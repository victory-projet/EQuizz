# Guide de Configuration de la Base de Données

## 🚨 **Problème rencontré**
```
Access denied for user 'root'@'localhost' (using password: YES)
```

## 🔧 **Solutions par ordre de préférence**

### **Solution 1 : Configuration automatique MySQL**
```bash
cd backend
node setup-mysql.js
```
Ce script va :
- Tester différents mots de passe MySQL
- Créer la base de données `equizz_db`
- Créer un utilisateur dédié (optionnel)
- Mettre à jour le fichier `.env`

### **Solution 2 : Test de connexion MySQL**
```bash
cd backend
node check-mysql-connection.js
```
Ce script teste différentes configurations et vous indique laquelle fonctionne.

### **Solution 3 : Utiliser SQLite (recommandé pour les tests)**
```bash
cd backend
node test-with-sqlite.js
```
SQLite ne nécessite aucune configuration et fonctionne immédiatement.

### **Solution 4 : Configuration manuelle MySQL**

#### A. Réinitialiser le mot de passe root MySQL
```sql
-- Se connecter à MySQL en tant que root
mysql -u root

-- Changer le mot de passe
ALTER USER 'root'@'localhost' IDENTIFIED BY 'nouveau_mot_de_passe';
FLUSH PRIVILEGES;

-- Créer la base de données
CREATE DATABASE equizz_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### B. Créer un utilisateur dédié
```sql
-- Créer l'utilisateur
CREATE USER 'equizz_user'@'localhost' IDENTIFIED BY 'equizz_password';

-- Donner les permissions
GRANT ALL PRIVILEGES ON equizz_db.* TO 'equizz_user'@'localhost';
FLUSH PRIVILEGES;
```

#### C. Mettre à jour le `.env`
```env
DB_HOST=localhost
DB_USER=equizz_user
DB_PASSWORD=equizz_password
DB_NAME=equizz_db
DB_DIALECT=mysql
```

## 🐳 **Solution 5 : Docker MySQL (alternative)**

### Créer un conteneur MySQL temporaire
```bash
# Démarrer MySQL avec Docker
docker run --name mysql-equizz \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=equizz_db \
  -p 3306:3306 \
  -d mysql:8.0

# Attendre que MySQL soit prêt
sleep 30

# Mettre à jour le .env
echo "DB_PASSWORD=root" > .env.temp
```

### Configuration .env pour Docker
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=equizz_db
DB_DIALECT=mysql
```

## 🔍 **Diagnostic des problèmes courants**

### 1. **MySQL n'est pas démarré**
```bash
# Windows
net start mysql

# macOS avec Homebrew
brew services start mysql

# Linux
sudo systemctl start mysql
```

### 2. **Port MySQL occupé**
```bash
# Vérifier quel processus utilise le port 3306
netstat -an | findstr 3306  # Windows
lsof -i :3306              # macOS/Linux
```

### 3. **Permissions insuffisantes**
```sql
-- Vérifier les permissions
SHOW GRANTS FOR 'root'@'localhost';

-- Réinitialiser les permissions
GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

## 🧪 **Vérification de la configuration**

### Test rapide de connexion
```bash
cd backend
node -e "
const mysql = require('mysql2/promise');
mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'VOTRE_MOT_DE_PASSE',
  database: 'equizz_db'
}).then(() => console.log('✅ Connexion OK'))
  .catch(err => console.log('❌ Erreur:', err.message));
"
```

### Test complet d'intégration
```bash
cd backend
node test-form-integration.js
```

## 📋 **Checklist de vérification**

- [ ] MySQL est installé et démarré
- [ ] Le mot de passe root est correct
- [ ] La base de données `equizz_db` existe
- [ ] L'utilisateur a les bonnes permissions
- [ ] Le fichier `.env` est correct
- [ ] Le port 3306 est disponible

## 🆘 **En cas d'échec**

Si aucune solution ne fonctionne :

1. **Utilisez SQLite** : `node test-with-sqlite.js`
2. **Contactez l'équipe** avec les logs d'erreur
3. **Vérifiez la documentation MySQL** de votre système

## 🎯 **Objectif final**

Une fois la base de données configurée, vous devriez pouvoir :
- Démarrer le backend : `npm start`
- Tester l'intégration : `node test-form-integration.js`
- Utiliser le formulaire d'évaluation avec de vraies données