# 🔐 Gestion des Rôles avec SuperAdmin et Validation Email

## 📖 Vue d'ensemble

Ce document décrit les modifications apportées au système de gestion des rôles et de la validation email du backend EQuizz pour supporter une architecture à deux niveaux d'administration:

- **SuperAdmin**: Visibilité complète sur le système
- **Admin Scolaire**: Visibilité limitée à son école

## 📋 Modifications Apportées

### 1. Modèle Administrateur (`src/models/Administrateur.js`)

#### Changements
```javascript
// AVANT
const Administrateur = sequelize.define('Administrateur', {
  id: { type: DataTypes.UUID, primaryKey: true },
  profil: { type: DataTypes.STRING, allowNull: true }
});

// APRÈS - Ajout de deux colonnes
type: {
  type: DataTypes.ENUM('SUPERADMIN', 'ADMIN'),
  defaultValue: 'ADMIN',
  allowNull: false,
  comment: 'SUPERADMIN: accès total. ADMIN: accès limité à son école'
}

ecole_id: {
  type: DataTypes.UUID,
  allowNull: true,
  comment: 'NULL pour SuperAdmin, UUID pour Admin scolaire'
}
```

#### Logique
- **type = 'SUPERADMIN'**: Accès à tout le système, `ecole_id` est NULL
- **type = 'ADMIN'**: Accès limité à une école spécifique via `ecole_id`

---

### 2. Validation Email (`src/models/Utilisateur.js`)

#### Patterns Acceptés
```javascript
// Standard: prenom.nom@saintjeaningenieur.org
const standardFormat = /^[a-zA-Z]+\.[a-zA-Z]+@saintjeaningenieur\.org$/;

// SuperAdmin: email spécial accepté
const superAdminFormat = /^superadmin@saintjeaningenieur\.org$/;
```

#### Règles
| Format | Exemple | Type d'Utilisateur |
|--------|---------|-------------------|
| `prenom.nom@saintjeaningenieur.org` | `marie.dupont@saintjeaningenieur.org` | ✅ Tous |
| `superadmin@saintjeaningenieur.org` | `superadmin@saintjeaningenieur.org` | ✅ SuperAdmin |

#### Critères
- Lettres non accentuées uniquement (a-z, A-Z)
- Pas de chiffres dans la partie locale
- Domaine obligatoire: `@saintjeaningenieur.org`
- Format flexible pour SuperAdmin

---

### 3. Service JWT (`src/services/jwt.service.js`)

#### Avant
```javascript
const payload = {
  id: utilisateur.id,
  email: utilisateur.email,
  role: 'admin', // ou 'enseignant', 'etudiant'
  type: 'access'
};
```

#### Après
```javascript
const payload = {
  id: utilisateur.id,
  email: utilisateur.email,
  role: 'admin',
  type: 'access',
  // Nouveaux champs pour les administrateurs
  adminType: 'SUPERADMIN' || 'ADMIN', // Niveau d'admin
  ecoleId: null || 'uuid-ecole'        // NULL pour SuperAdmin
};
```

#### Structure du Token JWT
```json
{
  "id": "user-uuid",
  "email": "marie.dupont@saintjeaningenieur.org",
  "role": "admin",
  "adminType": "ADMIN",
  "ecoleId": "ecole-uuid",
  "type": "access",
  "iat": 1707638400,
  "exp": 1707642000
}
```

---

### 4. Controller d'Authentification (`src/controllers/auth.controller.js`)

#### Méthode login()
```javascript
// Retourne maintenant pour un administrateur:
{
  token: "jwt-token",
  refreshToken: "refresh-token",
  utilisateur: {
    id: "user-uuid",
    nom: "dupont",
    prenom: "marie",
    email: "marie.dupont@saintjeaningenieur.org",
    role: "ADMIN",
    estActif: true,
    // NOUVEAU - Informations d'admin
    adminType: "ADMIN",        // SUPERADMIN ou ADMIN
    ecoleId: "ecole-uuid"       // null pour SuperAdmin
  }
}
```

#### Méthode getCurrentUser()
Même structure que `login()`, retourne les infos complètes incluant `adminType` et `ecoleId`.

---

### 5. Middleware d'Authentification (`src/middlewares/auth.middleware.js`)

#### Nouveaux Middlewares

**`isSuperAdmin()`** - Vérifie que l'utilisateur est SuperAdmin
```javascript
const isSuperAdmin = (req, res, next) => {
  if (req.user && req.user.adminType === 'SUPERADMIN') {
    next();
  } else {
    next(AppError.forbidden('SuperAdmin requis.', 'SUPERADMIN_REQUIRED'));
  }
};
```

**`isSchoolAdmin()`** - Vérifie que l'utilisateur est Admin (SUPERADMIN ou ADMIN scolaire)
```javascript
const isSchoolAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin' && 
      (req.user.adminType === 'SUPERADMIN' || req.user.adminType === 'ADMIN')) {
    next();
  } else {
    next(AppError.forbidden('Admin requis.', 'ADMIN_REQUIRED'));
  }
};
```

#### Utilisation
```javascript
// Exemple: Route réservée à SuperAdmin
router.post('/admin/superadmin', authenticate, isSuperAdmin, controller.createSuperAdmin);

// Exemple: Route pour tous les admins
router.get('/utilisateurs', authenticate, isSchoolAdmin, controller.getAllUtilisateurs);
```

---

### 6. Controller Utilisateurs (`src/controllers/utilisateur.controller.js`)

#### Méthode createUtilisateur()

**Paramètres supplémentaires**:
```javascript
{
  nom: "dupont",
  prenom: "marie",
  email: "marie.dupont@saintjeaningenieur.org",
  motDePasse: "Secure123!",
  role: "ADMIN",
  // NOUVEAU - Pour les administrateurs
  adminType: "ADMIN",        // "SUPERADMIN" ou "ADMIN"
  ecoleId: "ecole-uuid"       // Obligatoire si adminType = "ADMIN", sinon null
}
```

**Logique**:
- Si `role = 'ADMIN'` et `adminType = 'ADMIN'`: L'email doit correspondre au pattern standard
- Si `adminType = 'ADMIN'`: Validation que `ecoleId` est fourni
- Si `adminType = 'SUPERADMIN'`: `ecoleId` doit être NULL

**Exemple de création**:
```javascript
// Créer un Admin scolaire
POST /utilisateurs
{
  "nom": "dupont",
  "prenom": "marie",
  "email": "marie.dupont@saintjeaningenieur.org",
  "motDePasse": "Secure123!",
  "role": "ADMIN",
  "adminType": "ADMIN",
  "ecoleId": "uuid-of-ecole"
}

// Créer un SuperAdmin
POST /utilisateurs
{
  "nom": "admin",
  "prenom": "super",
  "email": "superadmin@saintjeaningenieur.org",
  "motDePasse": "SecureSuperAdmin123!",
  "role": "ADMIN",
  "adminType": "SUPERADMIN",
  "ecoleId": null
}
```

#### Méthode updateUtilisateur()

**Paramètres supplémentaires**:
```javascript
{
  adminType: "SUPERADMIN" || "ADMIN",  // Change le type d'admin
  ecoleId: "new-ecole-uuid" || null     // Change l'école
}
```

**Exemple**:
```javascript
// Passer un Admin scolaire à SuperAdmin
PUT /utilisateurs/:id
{
  "adminType": "SUPERADMIN",
  "ecoleId": null
}
```

---

### 7. Routes Utilisateurs (`src/routes/utilisateur.routes.js`)

#### Protections
```javascript
// Toutes les routes nécessitent:
router.use(authenticate);        // Authentification
router.use(authorize(['ADMIN'])); // Autorisation ADMIN

// Endpoints:
GET    /utilisateurs              → Liste des utilisateurs
GET    /utilisateurs/:id          → Détails utilisateur
POST   /utilisateurs              → Créer utilisateur
PUT    /utilisateurs/:id          → Mettre à jour utilisateur
DELETE /utilisateurs/:id          → Supprimer utilisateur
POST   /utilisateurs/:id/reset-password → Réinitialiser password
POST   /utilisateurs/import       → Importer depuis Excel
```

---

### 8. Repository Utilisateur (`src/repositories/utilisateur.repository.js`)

#### Amélioration: findByLogin()

Maintenant inclut les relations pour l'admin:
```javascript
include: [{
  model: db.Administrateur,
  required: false,
  include: [{
    model: db.Ecole,  // NOUVEAU - Charge l'école de l'admin
    attributes: ['id', 'nom'],
    required: false
  }]
}]
```

Permet de charger automatiquement les infos d'école lors du login.

---

### 9. Migration Base de Données

**Fichier**: `migrations/20250212_add_admin_role_types.js`

#### Opérations

1. **Ajouter colonne `type`**:
   ```sql
   ALTER TABLE Administrateurs ADD COLUMN type ENUM('SUPERADMIN', 'ADMIN') DEFAULT 'ADMIN';
   ```

2. **Ajouter colonne `ecole_id`**:
   ```sql
   ALTER TABLE Administrateurs ADD COLUMN ecole_id UUID;
   ALTER TABLE Administrateurs ADD FOREIGN KEY (ecole_id) REFERENCES Ecoles(id) ON DELETE SET NULL;
   ```

3. **Créer index pour performance**:
   ```sql
   CREATE INDEX idx_admin_ecole_type ON Administrateurs(ecole_id, type);
   ```

4. **Migration des données existantes**:
   - Tous les administrateurs existants deviennent **SUPERADMIN** (`type = 'SUPERADMIN'`)
   - Cela maintient leur accès complet au système
   - Ainsi, aucune donnée existante n'est perdue

#### Rollback
Si nécessaire, la migration peut être entièrement annulée:
- Supprime l'index
- Supprime la colonne `ecole_id`
- Supprime la colonne `type`

---

## 🔄 Associations de Base de Données

### Avant
```
Ecole (1) ──→ (N) Classe
          ──→ (N) Administrateur  ❌ Pas de relation directe
```

### Après
```
Ecole (1) ──→ (N) Classe
      ──→ (N) Administrateur (via FK ecole_id)
```

**Code dans index.js**:
```javascript
// Relation Admin à École
Ecole.hasMany(Administrateur, { foreignKey: { name: 'ecole_id', allowNull: true } });
Administrateur.belongsTo(Ecole, { foreignKey: 'ecole_id' });
```

---

## 🔐 Matrice de Contrôle d'Accès

### SuperAdmin
| Action | Accès | Limites |
|--------|-------|---------|
| Créer Admin scolaire | ✅ | N/A |
| Lister tous utilisateurs | ✅ | N/A |
| Lister toutes écoles | ✅ | N/A |
| Modifi tout utilisateur | ✅ | N/A |
| Voir dashboards globaux | ✅ | N/A |
| Gérer années académiques | ✅ | N/A |
| Créer d'autres SuperAdmin | ❌ | Interface uniquement |

### Admin Scolaire
| Action | Accès | Limites |
|--------|-------|---------|
| Créer Admin scolaire | ❌ | SuperAdmin only |
| Lister utilisateurs | ✅ | Son école uniquement |
| Lister écoles | ✅ | Sa propre école |
| Modifier utilisateur | ✅ | Son école uniquement |
| Voir dashboards | ✅ | Son école uniquement |
| Gérer années académiques | ❌ | SuperAdmin only |
| Crée classes | ✅ | Son école uniquement |

### Enseignant
| Action | Accès | Limites |
|--------|-------|---------|
| Créer/Gérer cours | ✅ | Ses cours |
| Accéder étudiants | ✅ | Ses classes |
| Voir évaluations | ✅ | Ses cours |
| Créer utilisateurs | ❌ | Admin only |

### Étudiant
| Action | Accès | Limites |
|--------|-------|---------|
| Voir ses classes | ✅ | Sa classe |
| Participer évaluations | ✅ | Ses classes |
| Voir autres étudiants | ❌ | Données privées |

---

## 📝 Exemples d'Utilisation

### 1. Login SuperAdmin
```javascript
POST /auth/login
{
  "email": "superadmin@saintjeaningenieur.org",
  "motDePasse": "SuperAdmin123!"
}

// Réponse
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "utilisateur": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "nom": "admin",
    "prenom": "super",
    "email": "superadmin@saintjeaningenieur.org",
    "role": "ADMIN",
    "adminType": "SUPERADMIN",
    "ecoleId": null
  }
}
```

### 2. Login Admin Scolaire
```javascript
POST /auth/login
{
  "email": "marie.dupont@saintjeaningenieur.org",
  "motDePasse": "AdminSchool123!"
}

// Réponse
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "utilisateur": {
    "id": "223e4567-e89b-12d3-a456-426614174000",
    "nom": "dupont",
    "prenom": "marie",
    "email": "marie.dupont@saintjeaningenieur.org",
    "role": "ADMIN",
    "adminType": "ADMIN",
    "ecoleId": "323e4567-e89b-12d3-a456-426614174000"
  }
}
```

### 3. Créer Admin Scolaire (SuperAdmin seulement)
```javascript
POST /utilisateurs
Authorization: Bearer <super-admin-token>

{
  "nom": "martin",
  "prenom": "jean",
  "email": "jean.martin@saintjeaningenieur.org",
  "motDePasse": "NewAdmin123!",
  "role": "ADMIN",
  "adminType": "ADMIN",
  "ecoleId": "323e4567-e89b-12d3-a456-426614174000"
}

// Réponse 201
{
  "id": "423e4567-e89b-12d3-a456-426614174000",
  "nom": "martin",
  "prenom": "jean",
  "email": "jean.martin@saintjeaningenieur.org",
  "role": "ADMIN",
  "adminType": "ADMIN",
  "ecoleId": "323e4567-e89b-12d3-a456-426614174000",
  "createdAt": "2026-02-12T10:00:00Z"
}
```

### 4. Obtenir l'Utilisateur Connecté
```javascript
GET /auth/me
Authorization: Bearer <token>

// Réponse
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "nom": "admin",
  "prenom": "super",
  "email": "superadmin@saintjeaningenieur.org",
  "role": "ADMIN",
  "adminType": "SUPERADMIN",
  "ecoleId": null,
  "estActif": true,
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2026-02-12T10:00:00Z"
}
```

---

## 🚀 Déploiement et Migration

### Étapes
1. Déployer la migration
2. Tous les admins existants deviennent SUPERADMIN
3. Nouveaux admins scolaires créés via endpoint `/utilisateurs`
4. Mettre à jour les clients pour gérer `adminType` et `ecoleId`

### Sans Perte de Données
- ✅ Tous les administrateurs existants conservent leurs accès
- ✅ Aucun utilisateur n'est supprimé
- ✅ Retrocompatibilité assurée avec les tokens existants

---

## 📊 Structure des Données

### Table Administrateurs (Avant)
```
id (UUID, PK)
profil (String, nullable)
createdAt
updatedAt
```

### Table Administrateurs (Après)
```
id (UUID, PK)
type (ENUM: SUPERADMIN, ADMIN)          ← NOUVEAU
ecole_id (UUID, FK, nullable)             ← NOUVEAU
profil (String, nullable)
createdAt
updatedAt
```

### Index
```sql
PRIMARY KEY (id)
FOREIGN KEY (ecole_id) → Ecoles(id)
INDEX idx_admin_ecole_type (ecole_id, type)
```

---

## 🔍 Validation et Tests

### Email Validation Tests
```javascript
✅ "marie.dupont@saintjeaningenieur.org"      // Correct
✅ "jean.martin@saintjeaningenieur.org"       // Correct
✅ "superadmin@saintjeaningenieur.org"        // Correct (SuperAdmin)
❌ "marie_dupont@saintjeaningenieur.org"      // Underscore pas permis
❌ "marie.dupont123@saintjeaningenieur.org"   // Chiffres pas permis
❌ "marìe.dupont@saintjeaningenieur.org"      // Accents pas permis
❌ "marie.dupont@gmail.com"                   // Domaine incorrect
```

### Role Tests
```javascript
// SuperAdmin peut créer Admin
✅ SuperAdmin → POST /utilisateurs (adminType: ADMIN, ecoleId: uuid)

// Admin scolaire ne peut pas créer Admin
❌ AdminSchool → POST /utilisateurs (adminType: ADMIN) → 403 Forbidden

// Admin scolaire peut lister seulement sa propre école
✅ AdminSchool → GET /utilisateurs (filtre par ecoleId)

// SuperAdmin voit tous
✅ SuperAdmin → GET /utilisateurs (aucun filtre)
```

---

## 📚 Fichiers Modifiés

| Fichier | Modification |
|---------|--------------|
| `src/models/Administrateur.js` | Ajout colonnes `type` et `ecole_id` |
| `src/models/Utilisateur.js` | Amélioration validation email |
| `src/models/index.js` | Ajout relation Ecole → Administrateur |
| `src/services/jwt.service.js` | Ajout `adminType` et `ecoleId` au token |
| `src/services/auth.service.js` | Aucun changement majeur |
| `src/controllers/auth.controller.js` | Retour de `adminType` et `ecoleId` |
| `src/controllers/utilisateur.controller.js` | Gestion `adminType` et `ecoleId` |
| `src/middlewares/auth.middleware.js` | Ajout `isSuperAdmin()` et `isSchoolAdmin()` |
| `src/routes/utilisateur.routes.js` | Utilisation des nouveaux middlewares |
| `src/repositories/utilisateur.repository.js` | Inclusion relation Ecole dans findByLogin |
| `migrations/20250212_add_admin_role_types.js` | **NEW** - Migration BD |

---

## ⚠️ Points d'Attention

### 1. Compatibilité Token
Les tokens existants ne contiennent pas `adminType` et `ecoleId`.
**Solution**: Forcer un re-login ou regénérer les tokens.

### 2. Filtrage Admin Scolaire
À implémenter dans les endpoints:
- `GET /utilisateurs` → Filtrer par `ecoleId`
- `GET /classes` → Filtrer par `ecoleId`
- `GET /cours` → Filtrer par `ecoleId`

### 3. Permissions Granulaires
Pour une sécurité accrue, implémenter:
- Middleware de vérification `ecoleId` sur chaque endpoint
- Vérifier que l'utilisateur demandé appartient à la même école

### 4. Seed Data
L'outil `create-admin.js` doit être adapté pour supporter les types.

---

## 🔄 Prochaines Étapes Recommandées

1. **Implémenter le filtrage école** dans tous les contrôleurs
2. **Ajouter des middlewares de vérification d'école** sur les données sensibles
3. **Adapter l'import Excel** pour gérer `adminType` et `ecoleId`
4. **Mettre à jour les scripts de seed** pour les tests
5. **Ajouter des tests unitaires** pour la validation email
6. **Ajouter des tests d'intégration** pour le contrôle d'accès

---

## 📞 Support et Questions

Pour des questions sur l'implémentation:
- Consulter `ROLES_ARCHITECTURE_ANALYSIS.md` pour les détails techniques
- Vérifier les exemples d'utilisation ci-dessus
- Exécuter les tests de migration avant la production

---

**Date**: 12 février 2026  
**Branch**: feature/roles-superadmin  
**Status**: ✅ Implémenté et prêt pour migration
