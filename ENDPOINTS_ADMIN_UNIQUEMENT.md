# 🔐 ENDPOINTS ADMIN UNIQUEMENT

## 🎯 Objectif

Ce document liste **uniquement les endpoints nécessaires** pour l'interface **Admin** du frontend.

Les endpoints pour les étudiants (application mobile) sont **exclus**.

---

## ✅ ENDPOINTS POUR ADMIN

### 1. Authentification (`/api/auth`)

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| POST | `/api/auth/login` | ❌ | Connexion admin/enseignant |

**Note**: 
- ❌ `POST /api/auth/claim-account` - Pour étudiants uniquement (mobile)
- ❌ `POST /api/auth/link-card` - Pour étudiants uniquement (mobile)

---

### 2. Gestion Académique (`/api/academic`)

**Authentification requise**: ✅ Admin uniquement

#### 2.1 Écoles (5 endpoints)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/academic/ecoles` | Créer une école |
| GET | `/api/academic/ecoles` | Liste des écoles |
| GET | `/api/academic/ecoles/:id` | Détail d'une école |
| PUT | `/api/academic/ecoles/:id` | Modifier une école |
| DELETE | `/api/academic/ecoles/:id` | Supprimer une école |

#### 2.2 Années Académiques (5 endpoints)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/academic/annees-academiques` | Créer une année |
| GET | `/api/academic/annees-academiques` | Liste des années |
| GET | `/api/academic/annees-academiques/:id` | Détail d'une année |
| PUT | `/api/academic/annees-academiques/:id` | Modifier une année |
| DELETE | `/api/academic/annees-academiques/:id` | Supprimer une année |

#### 2.3 Semestres (5 endpoints)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/academic/semestres` | Créer un semestre |
| GET | `/api/academic/annees-academiques/:anneeId/semestres` | Liste des semestres d'une année |
| GET | `/api/academic/semestres/:id` | Détail d'un semestre |
| PUT | `/api/academic/semestres/:id` | Modifier un semestre |
| DELETE | `/api/academic/semestres/:id` | Supprimer un semestre |

#### 2.4 Cours (5 endpoints)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/academic/cours` | Créer un cours |
| GET | `/api/academic/cours` | Liste des cours |
| GET | `/api/academic/cours/:id` | Détail d'un cours |
| PUT | `/api/academic/cours/:id` | Modifier un cours |
| DELETE | `/api/academic/cours/:id` | Supprimer un cours |

#### 2.5 Classes (8 endpoints)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/academic/classes` | Créer une classe |
| GET | `/api/academic/classes` | Liste des classes |
| GET | `/api/academic/classes/:id` | Détail d'une classe |
| PUT | `/api/academic/classes/:id` | Modifier une classe |
| DELETE | `/api/academic/classes/:id` | Supprimer une classe |
| POST | `/api/academic/classes/:classeId/cours/:coursId` | Associer un cours à une classe |
| DELETE | `/api/academic/classes/:classeId/cours/:coursId` | Dissocier un cours d'une classe |
| GET | `/api/academic/classes/public` | Liste publique (sans auth) |

**Total Gestion Académique**: 28 endpoints

---

### 3. Évaluations (`/api/evaluations`)

**Authentification requise**: ✅ Admin uniquement

#### 3.1 CRUD Évaluations (6 endpoints)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/evaluations` | Créer une évaluation (+ quizz) |
| GET | `/api/evaluations` | Liste des évaluations |
| GET | `/api/evaluations/:id` | Détail d'une évaluation |
| PUT | `/api/evaluations/:id` | Modifier une évaluation |
| DELETE | `/api/evaluations/:id` | Supprimer une évaluation (+ quizz) |
| POST | `/api/evaluations/:id/publish` | Publier une évaluation |

#### 3.2 Gestion des Questions (4 endpoints)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/evaluations/quizz/:quizzId/questions` | Ajouter une question |
| PUT | `/api/evaluations/questions/:questionId` | Modifier une question |
| DELETE | `/api/evaluations/questions/:questionId` | Supprimer une question |
| POST | `/api/evaluations/quizz/:quizzId/import` | Import Excel (multipart/form-data) |

**Total Évaluations**: 10 endpoints

---

### 4. Dashboard (`/api/dashboard`)

**Authentification requise**: ✅ Admin uniquement

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/dashboard/admin` | Dashboard administrateur |
| GET | `/api/dashboard/evaluation/:id` | Statistiques d'une évaluation |

**Note**: 
- ❌ `GET /api/dashboard/student` - Pour étudiants uniquement (mobile)

**Total Dashboard**: 2 endpoints

---

### 5. Rapports (`/api/reports`)

**Authentification requise**: ✅ Admin uniquement

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/reports/:id` | Rapport d'une évaluation (JSON) |
| GET | `/api/reports/:id/pdf` | Export PDF du rapport |

**Total Rapports**: 2 endpoints

---

### 6. Notifications (`/api/notifications`)

**Authentification requise**: ✅ Tous (Admin inclus)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/notifications` | Liste des notifications |
| PUT | `/api/notifications/:id/read` | Marquer comme lue |
| PUT | `/api/notifications/read-all` | Tout marquer comme lu |

**Total Notifications**: 3 endpoints

---

## 📊 RÉCAPITULATIF

### Endpoints Admin Uniquement

| Catégorie | Nombre d'Endpoints |
|-----------|-------------------|
| Authentification | 1 |
| Gestion Académique | 28 |
| Évaluations | 10 |
| Dashboard | 2 |
| Rapports | 2 |
| Notifications | 3 |
| **TOTAL** | **46 endpoints** |

---

## ❌ ENDPOINTS EXCLUS (Mobile Étudiant)

### Authentification Étudiant
- `POST /api/auth/claim-account` - Activation de compte
- `POST /api/auth/link-card` - Lier une carte NFC

### Dashboard Étudiant
- `GET /api/dashboard/student` - Dashboard étudiant

### Quizz Étudiant (`/api/student`)
- `GET /api/student/me` - Informations de l'étudiant
- `GET /api/student/quizzes` - Liste des quizz disponibles
- `GET /api/student/quizzes/:id` - Détail d'un quizz
- `POST /api/student/quizzes/:id/submit` - Soumettre les réponses
- `GET /api/student/notifications` - Notifications
- `PUT /api/student/notifications/:id/read` - Marquer comme lue
- `PUT /api/student/notifications/read-all` - Tout marquer comme lu

**Total Exclus**: 10 endpoints (pour mobile uniquement)

---

## 🎯 POUR LE FRONTEND ADMIN

### Endpoints à Implémenter (Priorité)

#### Priorité 1 (Critique)
1. `POST /api/auth/login` - Authentification
2. `GET /api/academic/annees-academiques` - Années académiques
3. `GET /api/academic/classes` - Classes
4. `GET /api/academic/cours` - Cours

#### Priorité 2 (Important)
5. `GET /api/evaluations` - Évaluations
6. `POST /api/evaluations` - Créer évaluation
7. `GET /api/dashboard/admin` - Dashboard
8. `GET /api/reports/:id` - Rapports

#### Priorité 3 (Optionnel)
9. `GET /api/academic/ecoles` - Écoles
10. `GET /api/academic/semestres` - Semestres
11. `GET /api/notifications` - Notifications

---

## ⚠️ ENDPOINTS MANQUANTS (Non Bloquants)

### Pour l'Admin
- `GET /api/auth/me` - Obtenir l'utilisateur connecté
- `POST /api/auth/logout` - Déconnexion
- `POST /api/auth/refresh` - Rafraîchir le token

### Gestion des Utilisateurs (Si nécessaire)
- `GET /api/users` - Liste des utilisateurs
- `POST /api/users` - Créer un utilisateur
- `PUT /api/users/:id` - Modifier un utilisateur
- `DELETE /api/users/:id` - Supprimer un utilisateur

### Gestion des Enseignants (Si nécessaire)
- `GET /api/teachers` - Liste des enseignants
- `POST /api/teachers` - Créer un enseignant
- `PUT /api/teachers/:id` - Modifier un enseignant
- `DELETE /api/teachers/:id` - Supprimer un enseignant

### Gestion des Étudiants par Admin (Si nécessaire)
- `GET /api/students` - Liste des étudiants
- `GET /api/students/:id` - Détail d'un étudiant
- `GET /api/classes/:id/students` - Étudiants d'une classe

---

## ✅ CONCLUSION

### Backend Suffisant pour Admin
Le backend dispose de **46 endpoints** nécessaires pour l'interface admin, couvrant:
- ✅ Authentification
- ✅ Gestion académique complète (écoles, années, semestres, cours, classes)
- ✅ Gestion des évaluations (CRUD + questions + import Excel)
- ✅ Dashboard admin
- ✅ Rapports (JSON + PDF)
- ✅ Notifications

### Endpoints Étudiants Exclus
Les **10 endpoints** pour les étudiants sont exclus car ils concernent l'application mobile.

### Prêt pour la Liaison
Le frontend admin peut être connecté au backend **dès maintenant** avec les 46 endpoints disponibles.

---

**Date de création**: 2025-11-22  
**Statut**: ✅ Liste complète des endpoints admin  
**Total endpoints admin**: 46  
**Total endpoints exclus (mobile)**: 10
