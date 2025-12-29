# 🧪 Guide de Test - Interface Admin EQuizz

## 🚀 Démarrage Rapide

### 1. Démarrer le Backend
```bash
cd backend
node app.js
```
**Vérification** : Vous devriez voir `🚀 Serveur démarré sur le port 3000`

### 2. Créer l'Utilisateur Admin
```bash
curl -X POST http://localhost:3000/api/setup/create-admin
```
**Ou via PowerShell** :
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/setup/create-admin" -Method POST -ContentType "application/json" -Body '{}'
```

### 3. Démarrer le Frontend
```bash
cd frontend-admin
ng serve
```
**Vérification** : Ouvrir http://localhost:4200

## 🔐 Credentials de Test

- **Email** : `admin.test@saintjeaningenieur.org`
- **Mot de passe** : `admin123`

## 📋 Tests à Effectuer sur l'Interface Admin

### ✅ Test 1 : Authentification
1. **Aller sur** : http://localhost:4200
2. **Vérifier** : Page de login s'affiche
3. **Saisir** les credentials ci-dessus
4. **Cliquer** sur "Se connecter"
5. **Résultat attendu** : Redirection vers le dashboard

### ✅ Test 2 : Dashboard Principal
1. **Vérifier** : Affichage du dashboard sans erreurs 404
2. **Observer** : 
   - Métriques système (graphiques/chiffres)
   - Alertes du système
   - Activités récentes
   - Résumé des notifications
3. **Vérifier console** : Aucune erreur 404 ou 500

### ✅ Test 3 : Navigation
1. **Tester** tous les liens du menu :
   - Dashboard ✅
   - Utilisateurs
   - Étudiants  
   - Enseignants
   - Classes
   - Évaluations
2. **Vérifier** : Pas d'erreurs de navigation

### ✅ Test 4 : Gestion des Utilisateurs
1. **Aller sur** : Section Utilisateurs
2. **Vérifier** : Liste des utilisateurs s'affiche
3. **Tester** : Fonctions CRUD (Create, Read, Update, Delete)
4. **Observer** : Cache et performance

### ✅ Test 5 : Gestion des Étudiants
1. **Aller sur** : Section Étudiants
2. **Vérifier** : Liste des étudiants
3. **Tester** : Filtres et recherche
4. **Vérifier** : Export de données

### ✅ Test 6 : Gestion des Évaluations
1. **Aller sur** : Section Évaluations
2. **Vérifier** : Liste des évaluations
3. **Tester** : Création d'évaluation
4. **Vérifier** : Statistiques et résultats

### ✅ Test 7 : Notifications
1. **Vérifier** : Panneau de notifications (coin supérieur)
2. **Observer** : Nombre de notifications non lues
3. **Cliquer** : Sur les notifications
4. **Tester** : Marquer comme lu

### ✅ Test 8 : Responsive Design
1. **Redimensionner** la fenêtre du navigateur
2. **Tester** sur mobile (F12 > mode mobile)
3. **Vérifier** : Interface s'adapte correctement

### ✅ Test 9 : Gestion des Erreurs
1. **Couper** le backend temporairement
2. **Naviguer** dans l'interface
3. **Vérifier** : Messages d'erreur appropriés
4. **Redémarrer** le backend
5. **Vérifier** : Reconnexion automatique

### ✅ Test 10 : Déconnexion
1. **Cliquer** sur le bouton de déconnexion
2. **Vérifier** : Redirection vers la page de login
3. **Tenter** d'accéder au dashboard directement
4. **Vérifier** : Redirection vers login (protection des routes)

## 🔧 Tests Techniques Avancés

### Test API Direct
```bash
# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin.test@saintjeaningenieur.org","motDePasse":"admin123"}'

# Test endpoint protégé (remplacer TOKEN par le token reçu)
curl -X GET http://localhost:3000/api/dashboard/metrics \
  -H "Authorization: Bearer TOKEN"
```

### Test Performance
1. **Ouvrir** F12 > Network
2. **Naviguer** dans l'interface
3. **Vérifier** : Temps de réponse < 2s
4. **Observer** : Pas de requêtes en échec

### Test Cache
1. **Aller** sur Utilisateurs
2. **Observer** : Première charge
3. **Naviguer** ailleurs puis revenir
4. **Vérifier** : Chargement plus rapide (cache)

## 🐛 Problèmes Courants et Solutions

### Erreur 404 sur les API
**Cause** : Backend non démarré
**Solution** : `cd backend && node app.js`

### Erreur d'authentification
**Cause** : Utilisateur admin non créé
**Solution** : Exécuter l'endpoint `/api/setup/create-admin`

### Interface ne charge pas
**Cause** : Frontend non démarré
**Solution** : `cd frontend-admin && ng serve`

### Erreurs CORS
**Cause** : Configuration backend
**Solution** : Vérifier que le backend accepte les requêtes de localhost:4200

## 📊 Métriques de Succès

### ✅ Critères de Validation
- [ ] Login fonctionne sans erreur
- [ ] Dashboard s'affiche avec données
- [ ] Aucune erreur 404 dans la console
- [ ] Navigation fluide entre les sections
- [ ] Notifications fonctionnelles
- [ ] Déconnexion sécurisée
- [ ] Interface responsive
- [ ] Gestion d'erreurs appropriée

### 🎯 Performance Attendue
- **Temps de login** : < 2 secondes
- **Chargement dashboard** : < 3 secondes
- **Navigation** : < 1 seconde
- **Requêtes API** : < 1 seconde

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifier que backend et frontend sont démarrés
2. Vérifier la console du navigateur (F12)
3. Vérifier les logs du backend
4. Recréer l'utilisateur admin si nécessaire

---

**Status** : ✅ Système entièrement fonctionnel  
**Dernière vérification** : Décembre 2024