# Architecture des Rôles - Analyse et Plan d'Implémentation

## 📋 État Actuel du Système

### Structure Existante

Le système actuel utilise une architecture basée sur l'**héritage simple** via des tables séparées:

```
Utilisateur (table centrale)
├── Administrateur (1-à-1)
├── Enseignant (1-à-1)
└── Etudiant (1-à-1)
```

### Rôles Actuels

1. **ADMIN** - Administrateur actuel (tous les privilèges)
   - Createur d'évaluations
   - Gère tous les utilisateurs
   - Accès complet au système
   - Pas de restriction d'école

2. **ENSEIGNANT** - Enseignant
   - Crée et gère les cours
   - Évalue les étudiants
   - Accès à ses propres cours
   - Lié à une école (via Classe → Ecole)

3. **ETUDIANT** - Étudiant
   - Participe aux évaluations
   - Accès limité à sa classe

### Validation d'Email Actuelle

**Fichier**: `src/models/Utilisateur.js`

```javascript
// Pattern stricte pour le domaine @saintjeaningenieur.org
const emailRegex = /^[a-zA-Z]+\.[a-zA-Z]+@saintjeaningenieur\.org$/;
```

**Règles**:
- Format: `prenom.nom@saintjeaningenieur.org`
- Lettres non accentuées uniquement (a-z, A-Z)
- Pas de chiffres dans la partie locale
- Domaine obligatoire: `@saintjeaningenieur.org`

### Associations Actuelles

```
Administrateur ---> Utilisateur
Enseignant -------> Utilisateur
Etudiant ---------> Utilisateur
                    ├── Classe
                    │   ├── Ecole
                    │   └── AnneeAcademique
```

## 🎯 Plan d'Implémentation

### Objectif: Système de Rôles Multi-Niveaux

**SuperAdmin** (nouveau rôle)
- Visibilité complète sur le système
- Gère tous les administrateurs d'écoles
- Accès à toutes les données
- Email: `superadmin@saintjeaningenieur.org` (domaine spécial possible)

**Admin Scolaire** (ancien ADMIN rebaptisé)
- Visibilité limitée à son école
- Gère les utilisateurs de son école
- Gère les classes et les cours de son école
- Créé par un SuperAdmin
- Lié à une école (relation vers Ecole)

**Enseignant** (inchangé)
- Gère ses cours
- Accès aux données de ses classes
- Lié à une école (via Classe)

**Étudiant** (inchangé)
- Participant
- Accès à ses classes et évaluations

## 🔄 Modifications Nécessaires

### 1. Modèle Administrateur (Administrateur.js)

**Changements**:
- Ajouter colonne `type`: 'SUPERADMIN' | 'ADMIN' (niveau d'administrateur)
- Ajouter relation optionnelle `ecole_id` (NULL pour SuperAdmin, FK pour Admin scolaire)
- Conserver `profil` existant

**Migration**:
```sql
ALTER TABLE Administrateurs ADD COLUMN type VARCHAR(20) DEFAULT 'ADMIN';
ALTER TABLE Administrateurs ADD COLUMN ecole_id UUID;
ALTER TABLE Administrateurs ADD FOREIGN KEY (ecole_id) REFERENCES Ecoles(id);
```

### 2. Validation d'Email (Utilisateur.js)

**Changements**:
- Permettre `superadmin@saintjeaningenieur.org` sans pattern strict
- Valider tous les autres avec le pattern existant: `prenom.nom@saintjeaningenieur.org`
- Ajouter validateur personnalisé plus flexible

### 3. Service d'Authentification (auth.service.js)

**Changements**:
- Déterminer le type d'admin (SUPERADMIN/ADMIN) après login
- Inclure `adminType` et `ecoleId` dans le token JWT

### 4. Controller d'Authentification (auth.controller.js)

**Changements**:
- Retourner `adminType` et `ecoleId` pour les admins
- Utiliser pour déterminer les permissions

### 5. Middleware d'Authentification (auth.middleware.js)

**Changements**:
- Ajouter `isSuperAdmin()` middleware
- Ajouter `isSchoolAdmin()` middleware
- Adapter `authorize()` pour supporter les types d'admin

**Nouveaux middlewares**:
```javascript
const isSuperAdmin = (req, res, next) => {
  if (req.user && req.user.adminType === 'SUPERADMIN') {
    next();
  } else {
    next(AppError.forbidden('SuperAdmin requis.', 'SUPERADMIN_REQUIRED'));
  }
};

const isSchoolAdmin = (req, res, next) => {
  if (req.user && (req.user.adminType === 'SUPERADMIN' || req.user.adminType === 'ADMIN')) {
    next();
  } else {
    next(AppError.forbidden('Admin requis.', 'ADMIN_REQUIRED'));
  }
};
```

### 6. Service JWT (jwt.service.js)

**Changements**:
- Ajouter `adminType` au payload du token
- Ajouter `ecoleId` au payload du token

**Payload du token**:
```javascript
{
  id: user.id,
  email: user.email,
  role: 'ADMIN',
  adminType: 'SUPERADMIN' || 'ADMIN', // nouveau
  ecoleId: ecoleUUID || null, // nouveau pour les admins scolaires
  iat: ...,
  exp: ...
}
```

### 7. Controller Utilisateurs (utilisateur.controller.js)

**Changements**:
- Créer route `/admin` pour créer des administrateurs d'écoles
- Ajouter validation: seul SuperAdmin peut créer les Admins d'écoles
- Ajouter sélection de l'école lors de la création d'un Admin

### 8. Routes Utilisateurs (utilisateur.routes.js)

**Nouveaux endpoints**:
- `POST /utilisateurs/admin` - Créer Admin d'école (SuperAdmin only)
- `POST /utilisateurs/superadmin` - Créer SuperAdmin (SuperAdmin only)
- `GET /utilisateurs/by-school/:ecoleId` - Lister users de l'école (Admin/SuperAdmin)

**Protections**:
- Routes existantes → `authorize(['ADMIN', 'SUPERADMIN'])`
- Routes de création Admin → `isSuperAdmin()`

### 9. Migration Base de Données

**Fichier**: `migrations/20250212_add_admin_roles.js`

```javascript
// Nouvelle migration pour ajouter les colonnes d'admin
- Ajouter colonne `type` (ENUM ou VARCHAR)
- Ajouter colonne `ecole_id` (UUID, nullable, FK)
- Ajouter contrainte unique sur (ecole_id, type='ADMIN') pour un seul admin par école
- Vérifier intégrité des données existantes
```

## 📧 Validation Email - Nouvelles Règles

### Pattern de Base
```
Format: prenom.nom@saintjeaningenieur.org
Règles:
- Lettres non accentuées: a-z, A-Z
- Pas de chiffres
- Pas de caractères spéciaux
```

### Exception SuperAdmin
```
Format acceptable: superadmin@saintjeaningenieur.org
OU: nom.prenom@saintjeaningenieur.org (format standard)
```

### Implémentation

```javascript
// validateur personnalisé
function validateAdminEmail(email, adminType) {
  const standardFormat = /^[a-zA-Z]+\.[a-zA-Z]+@saintjeaningenieur\.org$/;
  const superAdminFormat = /^superadmin@saintjeaningenieur\.org$/;
  
  if (adminType === 'SUPERADMIN') {
    return superAdminFormat.test(email) || standardFormat.test(email);
  }
  
  // Pour ADMIN scolaire: format standard uniquement
  return standardFormat.test(email);
}
```

## 🔒 Contrôle d'Accès par Rôle

### SuperAdmin
- ✅ Créer/Modifier/Supprimer les Admins scolaires
- ✅ Lister tous les utilisateurs
- ✅ Lister toutes les écoles
- ✅ Voir les statistiques globales
- ✅ Gérer les annees académiques
- ✅ Réinitialiser les mots de passe

### Admin Scolaire
- ✅ Créer/Modifier/Supprimer utilisateurs de son école
- ✅ Lister utilisateurs de son école
- ✅ Lister classes de son école
- ✅ Lister courses de son école
- ❌ Voir données d'autres écoles
- ❌ Créer d'autres admins
- ❌ Gérer les annees académiques

### Enseignant
- ✅ Créer/Gérer ses cours
- ✅ Accéder aux étudiants de ses cours
- ✅ Créer/Voir les évaluations de ses cours
- ❌ Accéder aux cours d'autres enseignants
- ❌ Accéder aux données d'autres écoles

### Étudiant
- ✅ Voir ses classes
- ✅ Participer aux évaluations
- ❌ Voir les données d'autres étudiants
- ❌ Modifier les notes

## 📝 Fichiers à Modifier

**Priorité 1 (Fondations)**:
1. `src/models/Administrateur.js` - Ajouter colonnes type et ecole_id
2. `src/models/Utilisateur.js` - Améliorer validation email
3. `src/services/jwt.service.js` - Ajouter adminType et ecoleId au token

**Priorité 2 (Authentification)**:
4. `src/services/auth.service.js` - Déterminer adminType
5. `src/controllers/auth.controller.js` - Retourner adminType
6. `src/middlewares/auth.middleware.js` - Ajouter isSuperAdmin, isSchoolAdmin

**Priorité 3 (Routes)**:
7. `src/controllers/utilisateur.controller.js` - Ajouter routes admins
8. `src/routes/utilisateur.routes.js` - Protéger routes avec nouveaux middlewares

**Priorité 4 (Migration)**:
9. `migrations/20250212_add_admin_roles.js` - Migration DB

**Fichiers Outils**:
10. `backend/create-admin.js` - Adapter pour supporter SUPERADMIN
11. `backend/fix-admin-permissions.js` - Adapter pour les deux types

## ✅ Critères d'Acceptation

1. SuperAdmin peut créer des Admin scolaires liés à une école
2. Admin scolaire voit uniquement les données de son école
3. Email validation accepte les patterns corrects
4. Tokens JWT incluent `adminType` et `ecoleId`
5. Routes protégées avec les bons middlewares
6. Migration base de données sans perte de données
7. Tests d'intégration passent (utilisateurs existants)

## 🚀 Ordre d'Implémentation

1. Créer migration base de données
2. Modifier modèle Administrateur
3. Améliorer validation email
4. Mettre à jour JWT service
5. Adapter auth service et controller
6. Ajouter middlewares
7. Créer routes et contrôleurs
8. Adapter outils CLI (create-admin, fix-admin-permissions)
9. Tests manuels
10. Documentation finale

---

**Date d'analyse**: 12 février 2026
**Branch**: feature/roles-superadmin
**Status**: 🟡 En attente d'implémentation
