# Admin avec droits complets du Superadmin

## Objectif
Donner à l'administrateur (role: 'admin') les mêmes droits que le superadministrateur (role: 'super-admin') pour accéder à toutes les données et fonctionnalités, sauf la gestion des écoles.

## Modifications effectuées

### 1. Middleware auth.middleware.js
✅ Déjà configuré correctement:
- `isAdmin`: Accepte 'super-admin' ET 'admin'
- `isSuperAdmin`: Accepte uniquement 'super-admin' (pour les routes écoles)

### 2. Routes
✅ Toutes les routes utilisent déjà `isAdmin` ou `authorize(['SUPER-ADMIN', 'ADMIN'])`:
- `academic.routes.js`: Utilise `isAdmin` globalement (sauf routes écoles)
- `evaluation.routes.js`: Utilise `isAdmin`
- `report.routes.js`: Utilise `isAdmin`
- `utilisateur.routes.js`: Utilise `authorize(['SUPER-ADMIN', 'ADMIN'])`
- `dashboard.routes.js`: Utilise `isAdmin`

### 3. Controllers mis à jour

#### utilisateur.controller.js
**Avant**: Les admins voyaient uniquement les utilisateurs de leur école
**Après**: Les admins voient TOUS les utilisateurs (comme les super-admins)

```javascript
// Supprimé le filtrage par école pour les admins
// Tous les admins ont maintenant accès à tous les utilisateurs
exports.getAllUtilisateurs = async (req, res) => {
  const utilisateurs = await Utilisateur.findAll({
    include: [Superadministrateur, Administrateur, Enseignant, Etudiant]
  });
  // ...
}
```

#### notification.controller.js
**Avant**: Seuls les super-admins avaient accès aux notifications système
**Après**: Les admins ont aussi accès aux notifications système

Mis à jour 4 méthodes:
- `getMyNotifications`: `if (req.user.role === 'super-admin' || req.user.role === 'admin')`
- `markAsRead`: `if (req.user.role === 'super-admin' || req.user.role === 'admin')`
- `markAllAsRead`: `if (req.user.role === 'super-admin' || req.user.role === 'admin')`
- `getNotificationSummary`: `if (req.user.role === 'super-admin' || req.user.role === 'admin')`

#### auth.controller.js
✅ Déjà mis à jour pour détecter le rôle 'ADMIN' lors du login

### 4. Différences restantes entre Admin et Super-Admin

La SEULE différence est la gestion des écoles:

| Fonctionnalité | Super-Admin | Admin |
|----------------|-------------|-------|
| Gestion des écoles | ✅ | ❌ |
| Gestion des utilisateurs | ✅ | ✅ |
| Gestion des évaluations | ✅ | ✅ |
| Gestion des cours | ✅ | ✅ |
| Gestion des classes | ✅ | ✅ |
| Gestion des étudiants | ✅ | ✅ |
| Gestion des enseignants | ✅ | ✅ |
| Rapports | ✅ | ✅ |
| Dashboard | ✅ | ✅ |
| Notifications | ✅ | ✅ |

### 5. Frontend
La section "Écoles" dans la sidebar est cachée pour les admins:
```html
<a routerLink="/schools" *ngIf="isSuperAdmin()">
  <span>Écoles</span>
</a>
```

## Résultat
✅ L'administrateur peut maintenant:
- Se connecter avec `admin.sji@saintjeaningenieur.org` / `admin123`
- Accéder à toutes les données (utilisateurs, évaluations, cours, etc.)
- Gérer toutes les fonctionnalités sauf les écoles
- Voir le dashboard complet
- Recevoir les notifications système

## Date
24 février 2026
