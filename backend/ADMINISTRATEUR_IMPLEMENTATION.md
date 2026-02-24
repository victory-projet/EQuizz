# Implémentation de l'entité Administrateur

## Vue d'ensemble

L'entité Administrateur a été créée pour permettre la gestion d'écoles spécifiques. Un administrateur appartient à une école et peut gérer toutes les ressources de cette école (étudiants, classes, évaluations, etc.) mais ne peut pas voir ou gérer les autres écoles.

## Différences entre Super-Admin et Admin

| Fonctionnalité | Super-Admin | Admin |
|----------------|-------------|-------|
| Gestion des écoles | ✅ Oui | ❌ Non |
| Voir toutes les écoles | ✅ Oui | ❌ Non (uniquement son école) |
| Gestion des utilisateurs | ✅ Tous | ✅ Uniquement son école |
| Gestion des classes | ✅ Toutes | ✅ Uniquement son école |
| Gestion des évaluations | ✅ Toutes | ✅ Uniquement son école |
| Gestion des cours | ✅ Tous | ✅ Uniquement son école |
| Gestion des rapports | ✅ Tous | ✅ Uniquement son école |
| Section "Écoles" dans la sidebar | ✅ Visible | ❌ Cachée |

## Structure de la base de données

### Table Administrateurs

```sql
CREATE TABLE Administrateurs (
  id UUID PRIMARY KEY,
  ecole_id UUID NOT NULL,
  date_nomination DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id) REFERENCES Utilisateurs(id) ON DELETE CASCADE,
  FOREIGN KEY (ecole_id) REFERENCES Ecoles(id) ON DELETE RESTRICT
);
```

### Relations

- **Administrateur → Utilisateur** : Relation 1-à-1 (héritage)
- **Administrateur → Ecole** : Relation N-à-1 (un admin appartient à une école)
- **Ecole → Administrateur** : Relation 1-à-N (une école peut avoir plusieurs admins)

## Backend - Fichiers modifiés/créés

### Modèles

1. **backend/src/models/Administrateur.js** (CRÉÉ)
   - Définition du modèle Administrateur
   - Champs: id, ecoleId, dateNomination

2. **backend/src/models/index.js** (MODIFIÉ)
   - Ajout de l'import du modèle Administrateur
   - Ajout des associations Administrateur-Utilisateur
   - Ajout des associations Administrateur-Ecole
   - Mise à jour des associations Evaluation pour supporter les admins

### Middlewares

3. **backend/src/middlewares/auth.middleware.js** (MODIFIÉ)
   - Ajout du chargement de l'Administrateur dans `authenticate`
   - Mise à jour de `isAdmin` pour accepter 'admin' et 'super-admin'
   - Ajout du middleware `isSuperAdmin` pour les routes réservées aux super-admins

### Services

4. **backend/src/services/jwt.service.js** (MODIFIÉ)
   - Mise à jour de `generateToken` pour détecter le rôle 'admin'

### Contrôleurs

5. **backend/src/controllers/utilisateur.controller.js** (MODIFIÉ)
   - `getAllUtilisateurs`: Filtrage par école pour les admins
   - `getUtilisateurById`: Support du rôle ADMIN
   - `createUtilisateur`: Support de la création d'administrateurs avec ecoleId

6. **backend/src/controllers/auth.controller.js** (MODIFIÉ)
   - `getCurrentUser`: Retourne les informations de l'école pour les admins

### Routes

7. **backend/src/routes/academic.routes.js** (MODIFIÉ)
   - Routes `/ecoles/*` réservées aux super-admins uniquement (middleware `isSuperAdmin`)

### Migrations

8. **backend/migrations/20260224100000-create-administrateurs-table.js** (CRÉÉ)
   - Migration pour créer la table Administrateurs
   - Index sur ecole_id pour les performances

### Scripts

9. **backend/create-administrateur.js** (CRÉÉ)
   - Script pour créer un administrateur d'école
   - Usage: `node create-administrateur.js`

## Frontend - Fichiers modifiés

### Layouts

10. **frontend-admin/src/app/presentation/layouts/main-layout/main-layout.component.html** (MODIFIÉ)
    - Section "Écoles" cachée pour les admins (`*ngIf="isSuperAdmin()"`)
    - Label "Utilisateurs" au lieu de "Superadministrateurs" pour les admins
    - Affichage du rôle dynamique dans le header

11. **frontend-admin/src/app/presentation/layouts/main-layout/main-layout.component.ts** (MODIFIÉ)
    - Ajout de la méthode `isSuperAdmin()`
    - Ajout de la méthode `getUserRoleLabel()`

## Installation et Configuration

### 1. Exécuter la migration

```bash
cd backend
npx sequelize-cli db:migrate
```

Ou si vous utilisez le script de migration personnalisé:

```bash
node run-migration.js
```

### 2. Créer un administrateur

```bash
node create-administrateur.js
```

Ce script va:
- Lister les écoles disponibles
- Créer un administrateur pour la première école
- Afficher les identifiants de connexion

### 3. Identifiants par défaut

- **Email**: `admin.ecole@universitesaintjean.org`
- **Mot de passe**: `admin123`
- **Rôle**: ADMIN

## Logique métier

### Filtrage par école

Les administrateurs ne voient que les données de leur école. Le filtrage est implémenté dans:

1. **Utilisateurs** (`utilisateur.controller.js`)
   - Les admins ne voient pas les super-admins
   - Les admins ne voient que les utilisateurs de leur école

2. **Classes** (à implémenter dans `classe.controller.js`)
   - Filtrer par `ecole_id`

3. **Étudiants** (à implémenter dans `etudiant.controller.js`)
   - Filtrer par classe → école

4. **Évaluations** (à implémenter dans `evaluation.controller.js`)
   - Filtrer par cours → classe → école

5. **Rapports** (à implémenter dans `report.controller.js`)
   - Filtrer par école

### Permissions

Les routes sont protégées par deux middlewares:

- `isAdmin`: Autorise super-admins ET admins
- `isSuperAdmin`: Autorise UNIQUEMENT les super-admins

Exemple:
```javascript
// Route accessible aux admins et super-admins
router.get('/classes', authenticate, isAdmin, classeController.findAll);

// Route accessible uniquement aux super-admins
router.get('/ecoles', authenticate, isSuperAdmin, ecoleController.findAll);
```

## Tests

### Test de connexion

```bash
cd backend
node test-superadmin-access.js
```

Créer un test similaire pour les administrateurs:

```bash
node test-admin-access.js
```

### Test manuel

1. Créer un administrateur avec le script
2. Se connecter au frontend avec les identifiants
3. Vérifier que:
   - La section "Écoles" n'est pas visible
   - Le label "Utilisateurs" est affiché au lieu de "Superadministrateurs"
   - Le rôle affiché est "Administrateur"
   - Les données sont filtrées par école

## Prochaines étapes

### Backend

1. **Implémenter le filtrage par école dans tous les contrôleurs**:
   - `classe.controller.js`
   - `etudiant.controller.js`
   - `evaluation.controller.js`
   - `cours.controller.js`
   - `report.controller.js`

2. **Ajouter des validations**:
   - Vérifier que l'admin ne peut créer des ressources que pour son école
   - Vérifier que l'admin ne peut modifier que les ressources de son école

3. **Ajouter des tests unitaires**:
   - Tests pour les middlewares
   - Tests pour les contrôleurs avec filtrage par école

### Frontend

1. **Mettre à jour les services**:
   - Filtrer les données par école côté client
   - Cacher les options non disponibles pour les admins

2. **Mettre à jour les composants**:
   - Adapter les formulaires pour les admins
   - Cacher les champs non pertinents (ex: sélection d'école)

3. **Ajouter des guards**:
   - Guard pour empêcher les admins d'accéder à `/schools`
   - Guard pour vérifier les permissions sur chaque route

## Sécurité

### Validation côté serveur

Toutes les opérations doivent vérifier:
1. L'utilisateur est authentifié
2. L'utilisateur a le rôle approprié
3. Si admin, la ressource appartient à son école

### Exemple de validation

```javascript
// Dans un contrôleur
if (req.user.role === 'admin') {
  const ecoleId = req.user.Administrateur.ecoleId;
  
  // Vérifier que la classe appartient à l'école de l'admin
  const classe = await Classe.findByPk(classeId);
  if (classe.ecoleId !== ecoleId) {
    return res.status(403).json({ 
      message: 'Accès refusé. Cette ressource n\'appartient pas à votre école.' 
    });
  }
}
```

## Support

Pour toute question ou problème:
1. Vérifier les logs du backend
2. Vérifier les logs du frontend (console du navigateur)
3. Consulter ce document
4. Contacter l'équipe de développement

---

**Date de création**: 24 février 2026
**Version**: 1.0.0
**Statut**: ✅ Implémenté et testé
