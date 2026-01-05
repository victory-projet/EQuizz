# Guide de Déploiement Netlify - EQuizz Frontend Admin

## Configuration automatique mise en place

### 1. Fichiers créés/modifiés :
- ✅ `frontend-admin/public/_redirects` - Redirection SPA Angular
- ✅ `netlify.toml` - Configuration Netlify
- ✅ `.github/workflows/deploy-netlify.yml` - Pipeline CI/CD
- ✅ `frontend-admin/package.json` - Scripts de build améliorés

### 2. Configuration Netlify requise :

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

### 3. Déploiement :

#### Automatique :
- Push sur `main` → Déploiement en production
- Push sur `develop` → Déploiement de preview
- Pull Request → Déploiement de preview

#### Manuel :
```bash
cd frontend-admin
npm run build
# Les fichiers sont dans dist/frontend-admin/
```

### 4. Configuration Netlify (si déploiement manuel) :
- **Build command:** `cd frontend-admin && npm ci && npm run build`
- **Publish directory:** `frontend-admin/dist/frontend-admin`
- **Node version:** 18

### 5. Variables d'environnement Netlify :
Si besoin de variables d'environnement spécifiques :
- Aller dans Site settings > Environment variables
- Ajouter les variables nécessaires

### 6. Domaine personnalisé (optionnel) :
- Site settings > Domain management
- Ajouter un domaine personnalisé
- Configurer les DNS selon les instructions Netlify

## Vérifications post-déploiement :
- ✅ L'application se charge correctement
- ✅ Le refresh de page fonctionne (grâce à _redirects)
- ✅ L'API backend est accessible
- ✅ Les routes Angular fonctionnent
- ✅ Les assets sont chargés correctement

## Troubleshooting :
- **404 au refresh** → Vérifier que `_redirects` est bien dans le dossier publié
- **API non accessible** → Vérifier l'URL de l'API dans environment.prod.ts
- **Build échoue** → Vérifier les dépendances et la version Node.js