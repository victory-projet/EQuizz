# ✅ Vérification de Cohérence du Projet

## Architecture Vérifiée

### 🔹 Modèles (Models)
- ✅ Tous les modèles sont importés dans `src/models/index.js`
- ✅ Relations correctement définies
- ✅ `underscored: true` configuré globalement dans `database.js`
- ✅ `SessionToken` et `SessionReponse` ont `underscored: true` explicitement
- ✅ Pas de relation directe Etudiant → SessionReponse (anonymat préservé)

### 🔹 Routes (Routes)
- ✅ `/api/auth` → authRoutes (login, claim-account)
- ✅ `/api/student` → studentRoutes (me, quizzes, quizzes/:id, quizzes/:id/submit)
- ✅ `/api/academic` → academicRoutes
- ✅ `/api/evaluations` → evaluationRoutes
- ✅ `/api/init` → initRoutes (seed, reset)

### 🔹 Controllers
- ✅ `auth.controller.js` : login retourne toutes les infos (role, matricule, classe)
- ✅ `student.controller.js` : getMe retourne les infos complètes de l'étudiant
- ✅ `quizz.controller.js` : 
  - getAvailableQuizzes → passe userId
  - getQuizzDetails → passe etudiantId
  - submitReponses → passe etudiantId et estFinal

### 🔹 Services
- ✅ `auth.service.js` : login retourne utilisateur avec relations
- ✅ `quizz.service.js` :
  - getAvailableQuizzesForStudent(userId) → passe etudiantId au repository
  - getQuizzDetails(quizzId, etudiantId) → cherche SessionToken
  - submitReponses(quizzId, etudiantId, reponses, estFinal) → gère anonymat

### 🔹 Repositories
- ✅ `utilisateur.repository.js` : findByLogin inclut Etudiant avec Classe
- ✅ `etudiant.repository.js` : findById retourne classe_id
- ✅ `quizz.repository.js` :
  - findAvailableEvaluationsForClass(classeId, etudiantId) → retourne statutEtudiant
  - findQuizzWithQuestionsById(quizzId) → retourne questions

### 🔹 Middlewares
- ✅ `authenticate` : vérifie JWT et ajoute req.user
- ✅ `isAdmin` : vérifie le rôle admin
- ✅ Toutes les routes `/api/student/*` sont protégées par authenticate

### 🔹 Configuration
- ✅ `database.js` : underscored: true, freezeTableName: true, paranoid: true
- ✅ JWT_SECRET et JWT_EXPIRES_IN configurés
- ✅ Variables d'environnement pour DB

## Flux de Données Vérifié

### 1. Login
```
POST /api/login
→ auth.controller.login
→ auth.service.login
→ utilisateur.repository.findByLogin (inclut Etudiant + Classe)
→ jwt.service.generateToken
← Retourne: token + utilisateur complet (avec matricule, classe)
```

### 2. Récupération des quizz
```
GET /api/student/quizzes
→ authenticate middleware (vérifie token)
→ quizz.controller.getAvailableQuizzes
→ quizz.service.getAvailableQuizzesForStudent(userId)
→ etudiant.repository.findById (récupère classe_id)
→ quizz.repository.findAvailableEvaluationsForClass(classeId, etudiantId)
  → Pour chaque évaluation:
    → Cherche SessionToken (etudiantId + evaluationId)
    → Cherche SessionReponse (tokenAnonyme)
    → Détermine statutEtudiant (NOUVEAU/EN_COURS/TERMINE)
← Retourne: évaluations avec statutEtudiant
```

### 3. Détails d'un quizz
```
GET /api/student/quizzes/:id
→ authenticate middleware
→ quizz.controller.getQuizzDetails(id, etudiantId)
→ quizz.service.getQuizzDetails(quizzId, etudiantId)
→ quizz.repository.findQuizzWithQuestionsById
→ Cherche SessionToken + SessionReponse
← Retourne: quizz + questions + reponsesExistantes
```

### 4. Soumission de réponses
```
POST /api/student/quizzes/:id/submit
Body: { reponses: [...], estFinal: true/false }
→ authenticate middleware
→ quizz.controller.submitReponses(id, etudiantId, reponses, estFinal)
→ quizz.service.submitReponses(quizzId, etudiantId, reponses, estFinal)
  → Cherche/Crée SessionToken (etudiantId + evaluationId → tokenAnonyme)
  → Cherche/Crée SessionReponse (tokenAnonyme, statut)
  → Supprime anciennes réponses
  → Insère nouvelles réponses
← Retourne: message + tokenAnonyme + statut
```

## Système d'Anonymat

### Tables séparées
1. **SessionToken** (privée)
   - etudiant_id (UUID)
   - evaluation_id (UUID)
   - token_anonyme (SHA-256)
   - Index unique sur (etudiant_id, evaluation_id)

2. **SessionReponse** (anonyme)
   - token_anonyme (référence indirecte)
   - statut (EN_COURS/TERMINE)
   - date_debut, date_fin
   - evaluation_id

3. **ReponseEtudiant** (anonyme)
   - session_reponse_id
   - question_id
   - contenu

### Garanties
✅ Aucune référence directe étudiant dans SessionReponse
✅ Aucune référence directe étudiant dans ReponseEtudiant
✅ Seul le backend peut mapper token → étudiant via SessionToken
✅ Les admins voient les réponses mais pas l'identité

## Points d'Attention

### À faire après déploiement
1. Appeler `/api/init/reset` pour recréer les tables
2. Appeler `/api/init/seed` pour peupler avec données de test
3. Tester le login avec les credentials fournis
4. Vérifier que `/api/student/quizzes` retourne statutEtudiant

### Variables d'environnement requises
- DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_DIALECT
- JWT_SECRET, JWT_EXPIRES_IN
- EMAIL_* (pour l'envoi d'emails)

## Conclusion

✅ **Tous les fichiers sont cohérents**
✅ **Le flux de données est correct**
✅ **L'anonymat est préservé**
✅ **Les statuts des quizz sont trackés**
