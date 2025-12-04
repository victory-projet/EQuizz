# Configuration du Déploiement Automatique sur Render

## 🎯 Workflow Automatique

Le workflow est configuré pour déployer automatiquement sur Render quand :
1. Une Pull Request de `develop` vers `main` est **mergée**
2. Le déploiement se fait via un Deploy Hook Render

---

## 📋 Configuration du Deploy Hook sur Render

### Étape 1 : Obtenir le Deploy Hook URL

1. Allez sur **https://dashboard.render.com**
2. Cliquez sur votre service **equizz-backend**
3. Allez dans l'onglet **Settings**
4. Scrollez jusqu'à **Deploy Hook**
5. Cliquez sur **Create Deploy Hook**
6. Copiez l'URL générée (elle ressemble à : `https://api.render.com/deploy/srv-xxxxx?key=yyyyy`)

### Étape 2 : Ajouter le Secret sur GitHub

1. Allez sur votre repository GitHub : **https://github.com/victory-projet/EQuizz**
2. Cliquez sur **Settings** (du repository)
3. Dans le menu de gauche, cliquez sur **Secrets and variables** → **Actions**
4. Cliquez sur **New repository secret**
5. Ajoutez :
   - **Name** : `RENDER_DEPLOY_HOOK_URL`
   - **Secret** : Collez l'URL du Deploy Hook
6. Cliquez sur **Add secret**

---

## 🔄 Processus de Déploiement

### Workflow Complet :

```
1. Développement sur develop
   ↓
2. Créer une Pull Request : develop → main
   ↓
3. Review et validation
   ↓
4. Merge de la PR
   ↓
5. GitHub Actions déclenche automatiquement le déploiement sur Render
   ↓
6. Render build et déploie la nouvelle version
```

### Commandes Git :

```bash
# 1. Travailler sur develop
git checkout develop
git add .
git commit -m "Nouvelle fonctionnalité"
git push origin develop

# 2. Créer une Pull Request sur GitHub
# Via l'interface GitHub : develop → main

# 3. Après merge, le déploiement se fait automatiquement !
```

---

## ✅ Vérification

Pour vérifier que tout fonctionne :

1. Faites un petit changement sur `develop`
2. Créez une PR vers `main`
3. Mergez la PR
4. Allez dans l'onglet **Actions** de GitHub
5. Vous devriez voir le workflow **Backend CD** en cours d'exécution
6. Sur Render, vous verrez un nouveau déploiement démarrer

---

## 🔧 Déploiement Manuel (si besoin)

Si vous voulez déployer manuellement sans passer par une PR :

### Option 1 : Via Render Dashboard
- Allez sur Render → votre service → **Manual Deploy** → **Deploy latest commit**

### Option 2 : Via le Deploy Hook
```bash
curl -X POST "https://api.render.com/deploy/srv-xxxxx?key=yyyyy"
```

---

## 🆘 Dépannage

### Le workflow ne se déclenche pas :
- Vérifiez que la PR est bien de `develop` vers `main`
- Vérifiez que la PR a été **mergée** (pas juste fermée)
- Vérifiez dans l'onglet Actions de GitHub

### Erreur "Secret not found" :
- Vérifiez que le secret `RENDER_DEPLOY_HOOK_URL` est bien configuré dans GitHub
- Le nom doit être exactement `RENDER_DEPLOY_HOOK_URL`

### Le déploiement échoue sur Render :
- Vérifiez les logs sur Render Dashboard
- Vérifiez que toutes les variables d'environnement sont configurées
