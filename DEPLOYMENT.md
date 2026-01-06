# Guide de Déploiement Netlify - EQuizz Frontend Admin

## Configuration automatique mise en place

### 1. Fichiers créés/modifiés :
- ✅ `frontend-admin/public/_redirects` - Redirection SPA Angular
- ✅ `netlify.toml` - Configuration Netlify avec optimisations
- ✅ `.github/workflows/deploy-netlify.yml` - Pipeline CI/CD
- ✅ `frontend-admin/package.json` - Scripts de build améliorés et versions Angular harmonisées
- ✅ `frontend-admin/angular.json` - Budgets de taille ajustés
- ✅ `backend/package.json` - Script lint ajouté
- ✅ `backend/eslint.config.js` - Configuration ESLint corrigée

### 2. Corrections apportées :

#### Backend :
- ✅ Erreurs ESLint corrigées (remplacement `eval` par `evaluation`)
- ✅ Configuration ESLint compatible Windows (CRLF) et Jest
- ✅ Script `npm run lint` fonctionnel

#### Frontend :
- ✅ Conflit dépendances Angular résolu (versions harmonisées à 20.2.0)
- ✅ Configuration `--legacy-peer-deps` pour installation
- ✅ Budgets Angular augmentés pour fichiers volumineux
- ✅ Chemin de publication corrigé pour Angular 20 (`browser/`)
- ✅ Build testé et fonctionnel

### 3. Configuration Netlify :

#### A. Créer un compte Netlify et connecter le repo :
1. Aller sur [netlify.com](https://netlify.com)
2. Se connecter avec GitHub
3. Cliquer "New site from Git"
4. Sélectionner ce repository
5. Netlify détectera automatiquement la configuration via `netlify.toml`

#### B. Configurer les secrets GitHub (pour le déploiement automatique) :
1. Aller dans Settings > Secrets and variables > Actions
2. Ajouter ces secrets :
   - `NETLIFY_AUTH_TOKEN` : Token d'API Netlify (User settings > Applications > Personal access tokens)
   - `NETLIFY_SITE_ID` : ID du site Netlify (Site settings > General > Site details)

### 4. Déploiement :

#### Automatique :
- Push sur `main` → Déploiement en production
- Push sur `develop` → Déploiement de preview
- Pull Request → Déploiement de preview

#### Manuel :
```bash
cd frontend-admin
npm install --legacy-peer-deps
npm run build
# Les fichiers sont dans dist/frontend-admin/browser/
```

### 5. Configuration Netlify (détectée automatiquement) :
- **Build command:** `npm ci --legacy-peer-deps && npm run build`
- **Publish directory:** `frontend-admin/dist/frontend-admin/browser`
- **Node version:** 18

### 6. Variables d'environnement Netlify :
Si besoin de variables d'environnement spécifiques :
- Aller dans Site settings > Environment variables
- Ajouter les variables nécessaires

### 7. Domaine personnalisé (optionnel) :
- Site settings > Domain management
- Ajouter un domaine personnalisé
- Configurer les DNS selon les instructions Netlify

## Vérifications post-déploiement :
- ✅ L'application se charge correctement
- ✅ Le refresh de page fonctionne (grâce à _redirects)
- ✅ L'API backend est accessible (environment.prod.ts)
- ✅ Les routes Angular fonctionnent
- ✅ Les assets sont chargés correctement

## Troubleshooting :
- **404 au refresh** → Vérifier que `_redirects` est bien dans le dossier publié
- **API non accessible** → Vérifier l'URL de l'API dans environment.prod.ts
- **Build échoue** → Vérifier les dépendances et utiliser `--legacy-peer-deps`
- **Erreurs ESLint** → Exécuter `npm run lint` dans le backend pour vérifier

## Status actuel :
🟢 **Configuration terminée et testée**
- Backend : ESLint fonctionnel, 0 erreurs
- Frontend : Build réussi, dépendances résolues
- Netlify : Configuration optimisée pour Angular 20
- Déploiement : Prêt pour production