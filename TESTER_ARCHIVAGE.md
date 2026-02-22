# 🧪 Guide de Test - Archivage

## 🚀 Démarrage Rapide

### 1. Démarrer le Backend
```bash
cd backend
npm run dev
```

Le serveur démarre sur `http://localhost:3000`

### 2. Démarrer le Frontend
```bash
cd frontend-admin
npm start
```

L'application démarre sur `http://localhost:4200`

---

## 🧪 Tests Manuels dans le Navigateur

### Test 1: Archivage des Cours

1. Ouvrir `http://localhost:4200/courses`
2. Observer la liste des cours actifs
3. Cliquer sur "Archiver" pour un cours
4. **Résultat attendu:** Le cours disparaît de la liste
5. Activer le toggle "Afficher les cours archivés"
6. **Résultat attendu:** Le cours apparaît avec un badge orange "Archivé"
7. Cliquer sur "Désarchiver"
8. **Résultat attendu:** Le cours réapparaît dans les actifs

### Test 2: Archivage des Classes

1. Ouvrir `http://localhost:4200/classes`
2. Observer la liste des classes actives
3. Cliquer sur "Archiver" pour une classe
4. **Résultat attendu:** La classe disparaît de la liste
5. Activer le toggle "Afficher les classes archivées"
6. **Résultat attendu:** La classe apparaît avec un badge orange "Archivé"
7. Cliquer sur "Désarchiver"
8. **Résultat attendu:** La classe réapparaît dans les actifs

### Test 3: Archivage des Évaluations

1. Ouvrir `http://localhost:4200/evaluations`
2. Observer la liste des évaluations actives
3. Cliquer sur les 3 points (menu) d'une évaluation
4. Cliquer sur "Archiver"
5. **Résultat attendu:** L'évaluation disparaît de la liste
6. Activer le toggle "Afficher les évaluations archivées"
7. **Résultat attendu:** L'évaluation apparaît avec un badge orange "Archivé"
8. Cliquer sur les 3 points puis "Désarchiver"
9. **Résultat attendu:** L'évaluation réapparaît dans les actifs

---

## 🔧 Tests avec Postman/Thunder Client

### Prérequis: Obtenir un Token

```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "super.admin@saintjeaningenieur.org",
  "password": "Admin123!"
}
```

Copier le `token` de la réponse.

---

### Test 1: Classes

#### 1.1 Lister les classes (sans archivés)
```http
GET http://localhost:3000/api/academic/classes
Authorization: Bearer <votre_token>
```

**Résultat attendu:** Liste des classes actives uniquement

#### 1.2 Archiver une classe
```http
PUT http://localhost:3000/api/academic/classes/<id_classe>/archive
Authorization: Bearer <votre_token>
```

**Résultat attendu:**
```json
{
  "success": true,
  "message": "Classe archivée avec succès",
  "data": { ... }
}
```

#### 1.3 Vérifier qu'elle n'apparaît plus
```http
GET http://localhost:3000/api/academic/classes
Authorization: Bearer <votre_token>
```

**Résultat attendu:** La classe archivée n'est plus dans la liste

#### 1.4 Lister avec les archivés
```http
GET http://localhost:3000/api/academic/classes?includeArchived=true
Authorization: Bearer <votre_token>
```

**Résultat attendu:** La classe archivée apparaît avec `estArchive: true`

#### 1.5 Restaurer la classe
```http
PUT http://localhost:3000/api/academic/classes/<id_classe>/restore
Authorization: Bearer <votre_token>
```

**Résultat attendu:**
```json
{
  "success": true,
  "message": "Classe restaurée avec succès",
  "data": { ... }
}
```

#### 1.6 Vérifier qu'elle réapparaît
```http
GET http://localhost:3000/api/academic/classes
Authorization: Bearer <votre_token>
```

**Résultat attendu:** La classe est de nouveau dans la liste

---

### Test 2: Cours

Même processus que pour les classes, mais avec:
- `GET /api/academic/cours`
- `PUT /api/academic/cours/<id_cours>/archive`
- `PUT /api/academic/cours/<id_cours>/restore`

---

## 🤖 Test Automatisé

### Avec le Script Node.js

```bash
cd backend

# S'assurer que le serveur tourne (dans un autre terminal)
npm run dev

# Exécuter le script de test
node test-archivage.js
```

**Résultat attendu:**
```
╔════════════════════════════════════════╗
║   TEST D'ARCHIVAGE - BACKEND API      ║
╚════════════════════════════════════════╝

🔐 Connexion...
✅ Connexion réussie

📚 Test: Archivage des Classes
1. Liste des classes actives...
   Classe trouvée: ING4 ISI FR (ID: xxx)
2. Archivage de la classe...
   ✅ Classe archivée
3. Vérification: liste sans archivés...
   ✅ Classe masquée
4. Vérification: liste avec archivés...
   ✅ Classe visible
5. Restauration de la classe...
   ✅ Classe restaurée
6. Vérification finale...
   ✅ Classe restaurée

✅ Test Classes: RÉUSSI

📖 Test: Archivage des Cours
...
✅ Test Cours: RÉUSSI

╔════════════════════════════════════════╗
║         TESTS TERMINÉS                 ║
╚════════════════════════════════════════╝
```

---

## ✅ Checklist de Validation

### Frontend
- [ ] Le toggle "Afficher archivés" fonctionne
- [ ] Les statistiques sont correctes (total, actifs, archivés)
- [ ] Le badge "Archivé" apparaît sur les cartes archivées
- [ ] Les cartes archivées ont une opacité réduite
- [ ] Le bouton "Archiver" devient "Désarchiver" pour les éléments archivés
- [ ] La recherche fonctionne avec les éléments archivés
- [ ] Les filtres fonctionnent avec les éléments archivés

### Backend
- [ ] La migration a réussi
- [ ] Les colonnes `est_archive` existent dans la base
- [ ] Les endpoints d'archivage répondent correctement
- [ ] Les scopes Sequelize fonctionnent
- [ ] Les éléments archivés n'apparaissent pas par défaut
- [ ] Les éléments archivés apparaissent avec `includeArchived=true`
- [ ] La restauration fonctionne correctement

### Intégration
- [ ] Archiver depuis le frontend met à jour le backend
- [ ] Le toggle frontend appelle correctement l'API
- [ ] Les messages de succès s'affichent
- [ ] Les erreurs sont gérées correctement
- [ ] Le rechargement de la page conserve l'état

---

## 🐛 Dépannage

### Problème: "Classe non trouvée" lors de l'archivage

**Cause:** Le scope par défaut masque les éléments archivés

**Solution:** Utiliser `scope('all')` dans le repository:
```javascript
const classe = await db.Classe.scope('all').findByPk(id);
```

### Problème: Les éléments archivés apparaissent toujours

**Cause:** Le scope par défaut n'est pas appliqué

**Solution:** Vérifier que le modèle a bien:
```javascript
defaultScope: {
  where: { estArchive: false }
}
```

### Problème: Erreur 401 lors des tests

**Cause:** Token expiré ou invalide

**Solution:** Se reconnecter pour obtenir un nouveau token

---

## 📊 Résultats Attendus

### Base de Données

Après archivage, la colonne `est_archive` doit être à `1` (true):

```sql
SELECT id, nom, est_archive FROM Classe WHERE est_archive = 1;
```

### API

Les réponses doivent inclure le champ `estArchive`:

```json
{
  "id": "xxx",
  "nom": "ING4 ISI FR",
  "estArchive": true,
  ...
}
```

### Frontend

Les cartes archivées doivent avoir:
- Badge orange "Archivé"
- Opacité réduite (70%)
- Bordure en pointillés orange

---

## 🎯 Critères de Succès

✅ Tous les tests manuels passent
✅ Le script automatisé réussit
✅ Les éléments archivés sont masqués par défaut
✅ Le toggle permet de voir les archivés
✅ La restauration fonctionne
✅ Les statistiques sont correctes
✅ L'interface est responsive
✅ Les messages de succès/erreur s'affichent

---

**Bon test ! 🚀**
