# Fix: Admin Not Appearing in Frontend

## Problem
The admin user existed in the database but didn't appear in the frontend because the API was returning `role: undefined` instead of `role: 'ADMIN'`.

## Root Cause
When aliases were added to Sequelize associations in `backend/src/models/index.js`, all includes of those models throughout the codebase needed to be updated to use the aliases. Missing aliases caused Sequelize to fail loading the associations, resulting in undefined roles.

## Files Fixed

### 1. backend/src/controllers/utilisateur.controller.js
Updated three `Utilisateur.findByPk()` calls to include aliases:
- Line ~213: `utilisateurComplet` query
- Line ~256: `utilisateur` query in updateUtilisateur
- Line ~282: `utilisateurMisAJour` query

### 2. backend/src/repositories/utilisateur.repository.js
Updated `findByLogin()` method:
- Added aliases to all includes (Etudiant, Superadministrateur, Enseignant)
- Added missing Administrateur include with Ecole association
- Added Classe alias in nested include

### 3. backend/src/controllers/auth.controller.js
Updated `refreshToken()` method:
- Added Administrateur include with Ecole association
- Added aliases to all includes

### 4. backend/src/services/evaluation.service.js
Updated admin verification query:
- Added Superadministrateur alias
- Added Administrateur include

### 5. backend/src/controllers/student.controller.js
Updated `getMe()` method:
- Added Etudiant alias
- Added Classe alias in nested include

## Aliases Used
```javascript
{ model: Superadministrateur, as: 'Superadministrateur' }
{ model: Administrateur, as: 'Administrateur', include: [{ model: Ecole, as: 'Ecole' }] }
{ model: Enseignant, as: 'Enseignant' }
{ model: Etudiant, as: 'Etudiant', include: [{ model: Classe, as: 'Classe' }] }
```

## Testing
After fixes, the test script `backend/test-admin-api.js` successfully:
1. Logs in as superadmin
2. Fetches all users
3. Finds the admin with `role: 'ADMIN'`
4. Shows admin's school information

## Result
✅ Admin now appears correctly in the API response with:
- `role: 'ADMIN'`
- `ecole: { id, nom }`
- All user information

✅ Frontend can now display admins in the `/admins` route

## Date
February 24, 2026
