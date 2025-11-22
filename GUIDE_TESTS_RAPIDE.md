# 🧪 GUIDE DE TESTS RAPIDE

## 🎯 Objectif

Tester que le frontend admin est correctement connecté au backend.

---

## 🚀 ÉTAPE 1: LANCER LE BACKEND LOCAL (5 min)

```bash
cd backend
npm start
```

**Vérifications**:
- ✅ Le serveur démarre sur le port 8080
- ✅ Message "Server running on port 8080"
- ✅ Base de données connectée

---

## 🚀 ÉTAPE 2: LANCER LE FRONTEND (2 min)

```bash
cd frontend-admin
ng serve --port 4201
```

**Vérifications**:
- ✅ Compilation réussie
- ✅ Aucune erreur TypeScript
- ✅ Application accessible sur http://localhost:4201

---

## 🧪 ÉTAPE 3: TESTER L'AUTHENTIFICATION (5 min)

### 3.1 Ouvrir l'application
```
URL: http://localhost:4201/login
```

### 3.2 Se connecter
```
Email: super.admin@saintjeaningenieur.org
Mot de passe: admin123
```

### 3.3 Vérifications
- [ ] Le formulaire de connexion s'affiche
- [ ] Pas d'erreur dans la console
- [ ] Après connexion, redirection vers le dashboard
- [ ] Token stocké dans localStorage (`auth_token`)
- [ ] User stocké dans localStorage (`user`)

### 3.4 Vérifier la console
Ouvrir les DevTools (F12) et vérifier:
- [ ] Requête `POST /api/auth/login` réussie (200)
- [ ] Réponse contient `token` et `user`
- [ ] Aucune erreur CORS

---

## 🧪 ÉTAPE 4: TESTER LES ANNÉES ACADÉMIQUES (10 min)

### 4.1 Naviguer vers Années Académiques
```
URL: http://localhost:4201/academic-year
```

### 4.2 Vérifications
- [ ] La liste des années s'affiche
- [ ] Requête `GET /api/academic/annees-academiques` réussie
- [ ] Les données sont affichées correctement

### 4.3 Créer une année académique
1. Cliquer sur "Nouvelle année"
2. Remplir le formulaire:
   - Nom: 2026-2027
   - Date début: 01/09/2026
   - Date fin: 30/06/2027
3. Enregistrer

**Vérifications**:
- [ ] Requête `POST /api/academic/annees-academiques` réussie
- [ ] L'année apparaît dans la liste
- [ ] Message de succès affiché

### 4.4 Modifier une année
1. Cliquer sur "Modifier" sur une année
2. Changer le nom
3. Enregistrer

**Vérifications**:
- [ ] Requête `PUT /api/academic/annees-academiques/:id` réussie
- [ ] Les modifications sont visibles
- [ ] Message de succès affiché

### 4.5 Supprimer une année
1. Cliquer sur "Supprimer" sur une année
2. Confirmer

**Vérifications**:
- [ ] Requête `DELETE /api/academic/annees-academiques/:id` réussie
- [ ] L'année disparaît de la liste
- [ ] Message de succès affiché

---

## 🧪 ÉTAPE 5: TESTER LES CLASSES (10 min)

### 5.1 Naviguer vers Classes
```
URL: http://localhost:4201/classes
```

### 5.2 Vérifications
- [ ] La liste des classes s'affiche
- [ ] Requête `GET /api/academic/classes` réussie
- [ ] Les données sont affichées correctement

### 5.3 Créer une classe
1. Cliquer sur "Nouvelle classe"
2. Remplir le formulaire:
   - Nom: L3 Info A
   - Niveau: Licence 3
   - Année académique: Sélectionner une année
3. Enregistrer

**Vérifications**:
- [ ] Requête `POST /api/academic/classes` réussie
- [ ] La classe apparaît dans la liste
- [ ] Message de succès affiché

---

## 🧪 ÉTAPE 6: TESTER LES COURS (10 min)

### 6.1 Naviguer vers Cours
```
URL: http://localhost:4201/courses
```

### 6.2 Vérifications
- [ ] La liste des cours s'affiche
- [ ] Requête `GET /api/academic/cours` réussie
- [ ] Les données sont affichées correctement

### 6.3 Créer un cours
1. Cliquer sur "Nouveau cours"
2. Remplir le formulaire:
   - Code: WEB301
   - Nom: Développement Web Avancé
   - Description: ...
   - Année académique: Sélectionner une année
3. Enregistrer

**Vérifications**:
- [ ] Requête `POST /api/academic/cours` réussie
- [ ] Le cours apparaît dans la liste
- [ ] Message de succès affiché

---

## 🧪 ÉTAPE 7: TESTER LES ÉVALUATIONS (10 min)

### 7.1 Naviguer vers Évaluations
```
URL: http://localhost:4201/evaluation
```

### 7.2 Vérifications
- [ ] La liste des évaluations s'affiche
- [ ] Requête `GET /api/evaluations` réussie
- [ ] Les données sont affichées correctement

### 7.3 Créer une évaluation
1. Cliquer sur "Nouvelle évaluation"
2. Remplir le formulaire:
   - Titre: Examen Final - Web
   - Description: ...
   - Cours: Sélectionner un cours
   - Date début: Date actuelle
   - Date fin: Date future
3. Enregistrer

**Vérifications**:
- [ ] Requête `POST /api/evaluations` réussie
- [ ] L'évaluation apparaît dans la liste
- [ ] Message de succès affiché

---

## 🧪 ÉTAPE 8: TESTER LA DÉCONNEXION (2 min)

### 8.1 Se déconnecter
1. Cliquer sur le bouton de déconnexion

**Vérifications**:
- [ ] Redirection vers `/login`
- [ ] Token supprimé du localStorage
- [ ] User supprimé du localStorage
- [ ] Impossible d'accéder aux pages protégées

---

## 🧪 ÉTAPE 9: TESTER AVEC BACKEND PRODUCTION (15 min)

### 9.1 Modifier l'environnement
Le frontend utilise déjà `environment.ts` en développement.

Pour tester avec la production, vous pouvez:
1. Modifier temporairement `environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'https://equizz-backend.onrender.com/api'
};
```

2. Ou builder en mode production:
```bash
ng build --configuration production
```

### 9.2 Se connecter
```
Email: super.admin@saintjeaningenieur.org
Mot de passe: Admin123!
```

**⚠️ Important**: 
- Le premier appel peut prendre 30-60 secondes (réveil du serveur)
- Afficher un message de chargement

### 9.3 Répéter les tests
- [ ] Authentification
- [ ] Années académiques
- [ ] Classes
- [ ] Cours
- [ ] Évaluations

---

## ✅ CHECKLIST FINALE

### Authentification
- [ ] Login fonctionne (local)
- [ ] Login fonctionne (production)
- [ ] Token stocké correctement
- [ ] Logout fonctionne
- [ ] Redirection 401 fonctionne

### Années Académiques
- [ ] Liste affichée
- [ ] Création fonctionne
- [ ] Modification fonctionne
- [ ] Suppression fonctionne

### Classes
- [ ] Liste affichée
- [ ] Création fonctionne
- [ ] Modification fonctionne
- [ ] Suppression fonctionne

### Cours
- [ ] Liste affichée
- [ ] Création fonctionne
- [ ] Modification fonctionne
- [ ] Suppression fonctionne

### Évaluations
- [ ] Liste affichée
- [ ] Création fonctionne
- [ ] Modification fonctionne
- [ ] Suppression fonctionne
- [ ] Publication fonctionne

### Gestion des Erreurs
- [ ] Erreurs 401 gérées (redirection)
- [ ] Erreurs 403 gérées (message)
- [ ] Erreurs 404 gérées (message)
- [ ] Erreurs 500 gérées (message)
- [ ] Erreurs réseau gérées (message)

---

## 🐛 DÉPANNAGE

### Erreur CORS
```
Access to XMLHttpRequest at 'http://localhost:8080/api/...' from origin 'http://localhost:4201' has been blocked by CORS policy
```

**Solution**: Vérifier que le backend autorise l'origine `http://localhost:4201`

### Erreur 401 en boucle
**Solution**: 
1. Vider le localStorage
2. Se reconnecter

### Erreur "Cannot read property of undefined"
**Solution**: 
1. Vérifier que le backend retourne les bonnes données
2. Vérifier les mappers
3. Vérifier la console pour plus de détails

### Backend Render lent
**Solution**: 
- C'est normal pour le premier appel (30-60s)
- Afficher un message de chargement
- Utiliser UptimeRobot pour garder le serveur actif

---

## 📊 RÉSULTATS ATTENDUS

### Temps Total
- **Tests locaux**: 45 minutes
- **Tests production**: 15 minutes
- **Total**: 1 heure

### Taux de Réussite Attendu
- **Authentification**: 100%
- **Années académiques**: 100%
- **Classes**: 100%
- **Cours**: 100%
- **Évaluations**: 100%
- **Gestion des erreurs**: 100%

---

## 🎉 SUCCÈS !

Si tous les tests passent, la migration est **100% réussie** ! 🎉

Le frontend admin est maintenant **complètement connecté** au backend.

---

**Date**: 2025-11-22  
**Statut**: Prêt pour tests
