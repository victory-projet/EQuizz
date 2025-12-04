# Guide d'Installation - EQuizz Admin

Ce guide vous accompagne pas à pas dans l'installation et la configuration de l'application EQuizz Admin.

## 📋 Prérequis

### Logiciels Requis

| Logiciel | Version Minimale | Version Recommandée | Lien de Téléchargement |
|----------|------------------|---------------------|------------------------|
| Node.js  | 18.x            | 20.x LTS            | [nodejs.org](https://nodejs.org/) |
| npm      | 9.x             | 10.x                | Inclus avec Node.js |
| Git      | 2.x             | Dernière            | [git-scm.com](https://git-scm.com/) |

### Vérification des Prérequis

```bash
# Vérifier Node.js
node --version
# Devrait afficher: v20.x.x ou supérieur

# Vérifier npm
npm --version
# Devrait afficher: 10.x.x ou supérieur

# Vérifier Git
git --version
# Devrait afficher: git version 2.x.x ou supérieur
```

### Installation de Node.js

#### Windows

1. Télécharger l'installateur depuis [nodejs.org](https://nodejs.org/)
2. Exécuter l'installateur
3. Suivre les instructions (cocher "Add to PATH")
4. Redémarrer le terminal

#### macOS

```bash
# Avec Homebrew
brew install node

# Ou télécharger depuis nodejs.org
```

#### Linux (Ubuntu/Debian)

```bash
# Installer Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Vérifier l'installation
node --version
npm --version
```

## 🚀 Installation du Projet

### Étape 1 : Cloner le Repository

```bash
# HTTPS
git clone https://github.com/votre-organisation/equizz.git

# SSH (recommandé si configuré)
git clone git@github.com:votre-organisation/equizz.git

# Naviguer vers le dossier frontend
cd equizz/frontend-admin
```

### Étape 2 : Installer les Dépendances

```bash
# Installation des packages npm
npm install

# Cela peut prendre 2-5 minutes selon votre connexion
```

**Résolution des problèmes** :

Si vous rencontrez des erreurs :

```bash
# Nettoyer le cache npm
npm cache clean --force

# Supprimer node_modules et package-lock.json
rm -rf node_modules package-lock.json

# Réinstaller
npm install
```

### Étape 3 : Configuration de l'Environnement

#### Créer le Fichier d'Environnement

```bash
# Copier le fichier d'exemple
cp src/environments/environment.example.ts src/environments/environment.ts
```

#### Configurer `environment.ts`

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api', // URL de votre backend
  enableCache: false,
  cacheTimeout: 60000, // 1 minute
  enableAnalytics: false
};
```

#### Configurer `environment.prod.ts`

```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.equizz.com/api', // URL de production
  enableCache: true,
  cacheTimeout: 300000, // 5 minutes
  enableAnalytics: true
};
```

### Étape 4 : Vérifier l'Installation

```bash
# Lancer le serveur de développement
npm start

# Ou avec Angular CLI
ng serve
```

L'application devrait être accessible sur `http://localhost:4200`

**Vous devriez voir** :
```
✔ Browser application bundle generation complete.
Initial chunk files | Names         | Raw size
polyfills.js        | polyfills     | 1.03 MB
main.js             | main          | 500 KB
styles.css          | styles        | 50 KB

Application bundle generation complete. [2.5 seconds]
Watch mode enabled. Watching for file changes...
➜ Local:   http://localhost:4200/
```

## 🔧 Configuration Avancée

### Configuration du Backend

Si vous développez en local avec le backend :

1. **Cloner et installer le backend** :
```bash
cd ../backend
npm install
```

2. **Configurer la base de données** :
```bash
# Créer le fichier .env
cp .env.example .env

# Éditer .env avec vos paramètres
```

3. **Lancer le backend** :
```bash
npm run dev
```

4. **Vérifier la connexion** :
```bash
curl http://localhost:3000/api/health
# Devrait retourner: {"status":"ok"}
```

### Configuration du Proxy (Optionnel)

Pour éviter les problèmes CORS en développement :

1. **Créer `proxy.conf.json`** :
```json
{
  "/api": {
    "target": "http://localhost:3000",
    "secure": false,
    "changeOrigin": true
  }
}
```

2. **Modifier `angular.json`** :
```json
{
  "serve": {
    "options": {
      "proxyConfig": "proxy.conf.json"
    }
  }
}
```

3. **Mettre à jour `environment.ts`** :
```typescript
export const environment = {
  apiUrl: '/api' // Utiliser le proxy
};
```

### Configuration des Ports

Si le port 4200 est déjà utilisé :

```bash
# Utiliser un port différent
ng serve --port 4300

# Ou modifier angular.json
{
  "serve": {
    "options": {
      "port": 4300
    }
  }
}
```

## 🧪 Vérification de l'Installation

### Test 1 : Compilation

```bash
npm run build

# Devrait se terminer sans erreur
# Les fichiers sont dans dist/frontend-admin/
```

### Test 2 : Tests Unitaires

```bash
npm test

# Ouvrir manuellement http://localhost:9876/
# Tous les tests devraient passer
```

### Test 3 : Linting

```bash
ng lint

# Devrait afficher: All files pass linting
```

## 🐛 Résolution des Problèmes

### Problème : Port déjà utilisé

**Erreur** :
```
Port 4200 is already in use.
```

**Solution** :
```bash
# Trouver le processus
lsof -i :4200  # macOS/Linux
netstat -ano | findstr :4200  # Windows

# Tuer le processus
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Ou utiliser un autre port
ng serve --port 4300
```

### Problème : Erreurs de dépendances

**Erreur** :
```
npm ERR! peer dep missing
```

**Solution** :
```bash
# Installer avec --legacy-peer-deps
npm install --legacy-peer-deps

# Ou forcer l'installation
npm install --force
```

### Problème : Erreurs de mémoire

**Erreur** :
```
FATAL ERROR: Ineffective mark-compacts near heap limit
```

**Solution** :
```bash
# Augmenter la mémoire Node.js
export NODE_OPTIONS="--max-old-space-size=4096"

# Windows
set NODE_OPTIONS=--max-old-space-size=4096

# Puis relancer
npm start
```

### Problème : Erreurs TypeScript

**Erreur** :
```
error TS2307: Cannot find module
```

**Solution** :
```bash
# Réinstaller les types
npm install --save-dev @types/node

# Nettoyer et rebuild
rm -rf node_modules dist
npm install
```

## 📦 Installation pour Production

### Build de Production

```bash
# Build optimisé
npm run build -- --configuration=production

# Les fichiers sont dans dist/frontend-admin/browser/
```

### Vérifier le Build

```bash
# Installer un serveur HTTP simple
npm install -g http-server

# Servir les fichiers de production
cd dist/frontend-admin/browser
http-server -p 8080

# Ouvrir http://localhost:8080
```

## 🔐 Configuration de Sécurité

### Variables d'Environnement Sensibles

**Ne jamais commiter** :
- Clés API
- Tokens
- Mots de passe
- URLs de production

**Utiliser** :
- Variables d'environnement
- Fichiers `.env` (dans `.gitignore`)
- Secrets managers (pour production)

### Fichier `.gitignore`

Vérifier que ces fichiers sont ignorés :
```
# Environnements
/src/environments/environment.ts
/src/environments/environment.prod.ts

# Dépendances
/node_modules

# Build
/dist

# IDE
/.vscode
/.idea
```

## ✅ Checklist d'Installation

- [ ] Node.js 18+ installé
- [ ] npm 9+ installé
- [ ] Git installé
- [ ] Repository cloné
- [ ] Dépendances installées (`npm install`)
- [ ] Fichiers d'environnement configurés
- [ ] Backend accessible (si nécessaire)
- [ ] Application démarre (`npm start`)
- [ ] Application accessible sur http://localhost:4200
- [ ] Tests passent (`npm test`)
- [ ] Build de production fonctionne (`npm run build`)

## 📞 Support

Si vous rencontrez des problèmes :

1. **Vérifier la documentation** : [README.md](../README.md)
2. **Consulter les issues** : [GitHub Issues](https://github.com/votre-repo/equizz/issues)
3. **Contacter l'équipe** : support@equizz.com

## 🎉 Prochaines Étapes

Une fois l'installation terminée :

1. Lire le [Guide de Développement](./DEVELOPMENT.md)
2. Consulter l'[Architecture](./ARCHITECTURE.md)
3. Explorer le [Guide Utilisateur](./USER_GUIDE_ADMIN.md)

---

**Installation réussie ! Bon développement ! 🚀**
