# Correction de l'accès superadministrateur

## Problème identifié

Lorsqu'un superadministrateur se connectait, il recevait l'erreur "Rôle administrateur requis" au lieu d'avoir accès aux données administratives.

## Cause du problème

Le middleware `authenticate` chargeait l'utilisateur depuis la base de données mais ne définissait pas la propriété `role` sur `req.user`. Le middleware `isAdmin` vérifiait ensuite `req.user.role`, qui était `undefined`, ce qui causait le rejet de l'accès.

## Solution appliquée

### 1. Ajout du rôle dans le middleware authenticate

Dans `backend/src/middlewares/auth.middleware.js`, ajout de la logique pour définir le rôle :

```javascript
// Ajouter le rôle à l'utilisateur pour faciliter les vérifications
utilisateur.role = utilisateur.Superadministrateur ? 'super-admin' : 
                   (utilisateur.Enseignant ? 'enseignant' : 'etudiant');
```

### 2. Simplification du middleware isAdmin

Mise à jour pour accepter uniquement le rôle `'super-admin'` (le seul rôle administrateur dans le système) :

```javascript
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'super-admin') {
    next();
  } else {
    next(AppError.forbidden('Accès refusé. Rôle administrateur requis.', 'ADMIN_REQUIRED'));
  }
};
```

### 3. Nettoyage des références au rôle 'admin'

Suppression des références au rôle `'admin'` qui n'existe pas dans le système :

- `backend/src/controllers/notification.controller.js` (4 occurrences)
- `backend/src/controllers/utilisateur.controller.js` (3 occurrences)
- `backend/src/controllers/dashboard.controller.js` (1 occurrence)
- `backend/src/services/email.service.js` (2 occurrences)

## Fichiers modifiés

1. `backend/src/middlewares/auth.middleware.js`
2. `backend/src/controllers/notification.controller.js`
3. `backend/src/controllers/utilisateur.controller.js`
4. `backend/src/controllers/dashboard.controller.js`
5. `backend/src/services/email.service.js`

## Test

Un script de test a été créé : `backend/test-superadmin-access.js`

Pour tester la correction :

```bash
cd backend
node test-superadmin-access.js
```

Ce script vérifie que le superadministrateur peut :
- Se connecter
- Accéder à son profil
- Accéder à la liste des utilisateurs
- Accéder au dashboard admin
- Accéder aux écoles

## Résultat attendu

Le superadministrateur peut maintenant accéder à toutes les routes administratives sans recevoir l'erreur "Rôle administrateur requis".
