# 📊 ANALYSE COMPLÈTE DES ENDPOINTS BACKEND

## 🎯 Vue d'Ensemble

Ce document liste **TOUS** les endpoints disponibles dans le backend EQuizz.

---

## ✅ ENDPOINTS DISPONIBLES

### 1. Authentification (`/api/auth`)

#### Pour Admin
| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| POST | `/api/auth/login` | ❌ | Connexion (retourne token JWT) |

#### Pour Étudiants (Mobile uniquement)
| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| POST | `/api/auth/claim-account` | ❌ | Activation de compte étudiant |
| POST | `/api/auth/link-card` | ❌ | Lier une carte NFC à un compte |

**Note**: Pas de route `/api/auth/me` ou `/api/auth/logout` visible. À vérifier si nécessaire pour l'admin.

---

### 2. Gestion Académique (`/api/academic`)

**Authentification requise**: ✅ Admin uniquement

#### 2.1 Écoles

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/academic/ecoles` | Créer une école |
| GET | `/api/academic/ecoles` | Liste des écoles |
| GET | `/api/academic/ecoles/:id` | Détail d'une école |
| PUT | `/api/academic/ecoles/:id` | Modifier une école |
| DELETE | `/api/academic/ecoles/:id` | Supprimer une école |

#### 2.2 Années Académiques

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/academic/annees-academiques` | Créer une année |
| GET | `/api/academic/annees-academiques` | Liste des années |
| GET | `/api/academic/annees-academiques/:id` | Détail d'une année |
| PUT | `/api/academic/annees-academiques/:id` | Modifier une année |
| DELETE | `/api/academic/annees-academiques/:id` | Supprimer une année |

#### 2.3 Semestres

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/academic/semestres` | Créer un semestre |
| GET | `/api/academic/annees-academiques/:anneeId/semestres` | Liste des semestres d'une année |
| GET | `/api/academic/semestres/:id` | Détail d'un semestre |
| PUT | `/api/academic/semestres/:id` | Modifier un semestre |
| DELETE | `/api/academic/semestres/:id` | Supprimer un semestre |

#### 2.4 Cours (Matières)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/academic/cours` | Créer un cours |
| GET | `/api/academic/cours` | Liste des cours |
| GET | `/api/academic/cours/:id` | Détail d'un cours |
| PUT | `/api/academic/cours/:id` | Modifier un cours |
| DELETE | `/api/academic/cours/:id` | Supprimer un cours |

#### 2.5 Classes

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| GET | `/api/academic/classes/public` | ❌ | Liste publique (pour activation) |
| POST | `/api/academic/classes` | ✅ Admin | Créer une classe |
| GET | `/api/academic/classes` | ✅ Admin | Liste des classes |
| GET | `/api/academic/classes/:id` | ✅ Admin | Détail d'une classe |
| PUT | `/api/academic/classes/:id` | ✅ Admin | Modifier une classe |
| DELETE | `/api/academic/classes/:id` | ✅ Admin | Supprimer une classe |
| POST | `/api/academic/classes/:classeId/cours/:coursId` | ✅ Admin | Associer un cours à une classe |
| DELETE | `/api/academic/classes/:classeId/cours/:coursId` | ✅ Admin | Dissocier un cours d'une classe |

---

### 3. Évaluations (`/api/evaluations`)

**Authentification requise**: ✅ Admin uniquement

#### 3.1 CRUD Évaluations

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/evaluations` | Créer une évaluation (+ quizz) |
| GET | `/api/evaluations` | Liste des évaluations |
| GET | `/api/evaluations/:id` | Détail d'une évaluation |
| PUT | `/api/evaluations/:id` | Modifier une évaluation |
| DELETE | `/api/evaluations/:id` | Supprimer une évaluation (+ quizz) |
| POST | `/api/evaluations/:id/publish` | Publier une évaluation |

#### 3.2 Gestion des Questions

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/evaluations/quizz/:quizzId/questions` | Ajouter une question |
| PUT | `/api/evaluations/questions/:questionId` | Modifier une question |
| DELETE | `/api/evaluations/questions/:questionId` | Supprimer une question |
| POST | `/api/evaluations/quizz/:quizzId/import` | Import Excel (multipart/form-data) |

---

### 4. Dashboard (`/api/dashboard`)

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| GET | `/api/dashboard/admin` | ✅ Admin | Dashboard administrateur |
| GET | `/api/dashboard/student` | ✅ Étudiant | Dashboard étudiant |
| GET | `/api/dashboard/evaluation/:id` | ✅ Admin | Statistiques d'une évaluation |

---

### 5. Rapports (`/api/reports`)

**Authentification requise**: ✅ Admin uniquement

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/reports/:id` | Rapport d'une évaluation (JSON) |
| GET | `/api/reports/:id/pdf` | Export PDF du rapport |

---

### 6. Étudiants (`/api/student`)

**Authentification requise**: ✅ Étudiant

#### 6.1 Informations Personnelles

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/student/me` | Informations de l'étudiant connecté |

#### 6.2 Quizz

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/student/quizzes` | Liste des quizz disponibles |
| GET | `/api/student/quizzes/:id` | Détail d'un quizz (questions) |
| POST | `/api/student/quizzes/:id/submit` | Soumettre les réponses |

#### 6.3 Notifications

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/student/notifications` | Liste des notifications |
| PUT | `/api/student/notifications/:id/read` | Marquer comme lue |
| PUT | `/api/student/notifications/read-all` | Tout marquer comme lu |

---

### 7. Notifications (`/api/notifications`)

**Authentification requise**: ✅ Tous

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/notifications` | Liste des notifications |
| PUT | `/api/notifications/:id/read` | Marquer comme lue |
| PUT | `/api/notifications/read-all` | Tout marquer comme lu |

---

## ⚠️ ENDPOINTS MANQUANTS OU À VÉRIFIER

### 1. Authentification
- [ ] `GET /api/auth/me` - Obtenir l'utilisateur connecté
- [ ] `POST /api/auth/logout` - Déconnexion (invalider le token)
- [ ] `POST /api/auth/refresh` - Rafraîchir le token JWT
- [ ] `POST /api/auth/forgot-password` - Mot de passe oublié
- [ ] `POST /api/auth/reset-password` - Réinitialiser le mot de passe

### 2. Gestion des Utilisateurs
- [ ] `GET /api/users` - Liste des utilisateurs (Admin)
- [ ] `GET /api/users/:id` - Détail d'un utilisateur
- [ ] `PUT /api/users/:id` - Modifier un utilisateur
- [ ] `DELETE /api/users/:id` - Supprimer un utilisateur
- [ ] `POST /api/users/:id/activate` - Activer un utilisateur
- [ ] `POST /api/users/:id/deactivate` - Désactiver un utilisateur

### 3. Gestion des Enseignants
- [ ] `GET /api/teachers` - Liste des enseignants
- [ ] `GET /api/teachers/:id` - Détail d'un enseignant
- [ ] `POST /api/teachers` - Créer un enseignant
- [ ] `PUT /api/teachers/:id` - Modifier un enseignant
- [ ] `DELETE /api/teachers/:id` - Supprimer un enseignant

### 4. Gestion des Étudiants (Admin)
- [ ] `GET /api/students` - Liste des étudiants
- [ ] `GET /api/students/:id` - Détail d'un étudiant
- [ ] `POST /api/students` - Créer un étudiant
- [ ] `PUT /api/students/:id` - Modifier un étudiant
- [ ] `DELETE /api/students/:id` - Supprimer un étudiant
- [ ] `GET /api/classes/:id/students` - Étudiants d'une classe

### 5. Statistiques Avancées
- [ ] `GET /api/analytics/overview` - Vue d'ensemble
- [ ] `GET /api/analytics/evaluations` - Statistiques des évaluations
- [ ] `GET /api/analytics/students` - Statistiques des étudiants
- [ ] `GET /api/analytics/classes` - Statistiques des classes

---

## 🔍 VÉRIFICATIONS À FAIRE

### 1. Structure des Réponses
Vérifier si le backend retourne:
```json
{
  "success": true,
  "data": { ... },
  "message": "..."
}
```
Ou directement les données:
```json
{ ... }
```

### 2. Gestion des Erreurs
Vérifier le format des erreurs:
```json
{
  "success": false,
  "error": "Message d'erreur"
}
```

### 3. Pagination
Vérifier si les listes sont paginées:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

### 4. Filtres et Recherche
Vérifier les query params disponibles:
- `?search=...`
- `?status=...`
- `?page=...&limit=...`
- `?sort=...&order=...`

---

## 📝 RECOMMANDATIONS

### Pour le Frontend Admin

#### Endpoints Prioritaires à Implémenter
1. ✅ Authentification (`/api/auth/login`)
2. ✅ Années Académiques (`/api/academic/annees-academiques`)
3. ✅ Classes (`/api/academic/classes`)
4. ✅ Cours (`/api/academic/cours`)
5. ✅ Évaluations (`/api/evaluations`)
6. ✅ Dashboard (`/api/dashboard/admin`)
7. ✅ Rapports (`/api/reports`)

#### Endpoints Non Prioritaires (Fonctionnalités Étudiants)
- `/api/student/*` - Pour l'application mobile
- `/api/dashboard/student` - Pour l'application mobile

#### Endpoints à Demander au Backend
Si ces fonctionnalités sont nécessaires:
1. Gestion des utilisateurs (CRUD complet)
2. Gestion des enseignants (CRUD complet)
3. Gestion des étudiants par l'admin (CRUD complet)
4. Endpoint `/api/auth/me` pour récupérer l'utilisateur connecté
5. Statistiques avancées pour Analytics

---

## 🎯 CONCLUSION

### ✅ Endpoints Suffisants pour MVP Admin
Le backend dispose de **tous les endpoints nécessaires** pour l'interface admin:
- Authentification ✅
- Gestion académique complète ✅
- Gestion des évaluations ✅
- Dashboard ✅
- Rapports ✅

### ⚠️ Endpoints Manquants (Non Bloquants)
- Gestion des utilisateurs (peut être ajoutée plus tard)
- Gestion des enseignants (peut être ajoutée plus tard)
- Gestion des étudiants par admin (peut être ajoutée plus tard)
- `/api/auth/me` (peut être contourné en stockant les infos user au login)

### 🚀 Prêt pour la Liaison
Le frontend peut être connecté au backend **dès maintenant** avec les endpoints existants.

---

**Date de création**: 2025-11-22  
**Statut**: Analyse complète - Prêt pour implémentation
