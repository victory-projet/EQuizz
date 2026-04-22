# Section Administrateurs - Frontend

## Vue d'ensemble

Une nouvelle section "Administrateurs" a été ajoutée au frontend pour permettre aux super-administrateurs de gérer les administrateurs d'école.

## Fichiers créés

### 1. Composant Admins

**Emplacement**: `src/app/presentation/features/admins/`

- `admins.component.ts`: Logique du composant
- `admins.component.html`: Template HTML
- `admins.component.scss`: Styles (hérite de users.component.scss)

### 2. Service School

**Emplacement**: `src/app/core/services/school.service.ts`

Service pour gérer les opérations CRUD sur les écoles :
- `getAllSchools()`: Récupère toutes les écoles
- `getSchoolById(id)`: Récupère une école par ID
- `createSchool(school)`: Crée une nouvelle école
- `updateSchool(id, school)`: Met à jour une école
- `deleteSchool(id)`: Supprime une école

## Fichiers modifiés

### 1. Layout Principal

**Fichier**: `src/app/presentation/layouts/main-layout/main-layout.component.html`

Ajout d'un lien "Administrateurs" dans la sidebar, visible uniquement pour les super-admins :

```html
<a routerLink="/admins" routerLinkActive="active" class="nav-item" *ngIf="isSuperAdmin()">
  <span class="material-icons">manage_accounts</span>
  <span class="nav-text" *ngIf="!isSidebarCollapsed()">Administrateurs</span>
</a>
```

**Fichier**: `src/app/presentation/layouts/main-layout/main-layout.component.ts`

Ajout des titres et sous-titres pour la page administrateurs :
- Titre: "Administrateurs"
- Sous-titre: "Gestion des administrateurs d'école"

### 2. Routes

**Fichier**: `src/app/app.routes.ts`

Ajout de la route `/admins` :

```typescript
{
  path: 'admins',
  loadComponent: () => import('./presentation/features/admins/admins.component').then(m => m.AdminsComponent)
}
```

## Fonctionnalités

### 1. Liste des Administrateurs

- Affichage de tous les administrateurs d'école
- Colonnes : Nom, Prénom, Email, École, Statut
- Recherche par nom, prénom ou email
- Pagination (10, 25, 50 éléments par page)

### 2. Créer un Administrateur

Formulaire avec les champs :
- Nom (requis)
- Prénom (requis)
- Email (requis)
- École (requis - sélection depuis la liste des écoles)
- Mot de passe (requis - avec bouton "Générer")

### 3. Modifier un Administrateur

- Modification des informations de base
- Changement d'école assignée
- Le mot de passe n'est pas modifiable via ce formulaire

### 4. Actions sur un Administrateur

- **Modifier**: Ouvre le formulaire de modification
- **Réinitialiser le mot de passe**: Permet de définir un nouveau mot de passe
- **Activer/Désactiver**: Change le statut de l'administrateur
- **Supprimer**: Supprime l'administrateur (avec confirmation)

## Permissions

### Visibilité

La section "Administrateurs" est visible uniquement pour les utilisateurs avec le rôle `SUPER-ADMIN`.

### Contrôle d'accès

- La route `/admins` est protégée par les guards `authGuard` et `adminGuard`
- Les super-admins peuvent gérer tous les administrateurs
- Les administrateurs normaux ne voient pas cette section

## Intégration avec le Backend

### Endpoints utilisés

1. **GET /api/utilisateurs**
   - Récupère tous les utilisateurs
   - Filtré côté frontend pour ne garder que les admins (role === 'ADMIN')

2. **POST /api/utilisateurs**
   - Crée un nouvel administrateur
   - Body: `{ nom, prenom, email, motDePasse, role: 'ADMIN', ecoleId }`

3. **PUT /api/utilisateurs/:id**
   - Met à jour un administrateur
   - Body: `{ nom, prenom, email, ecoleId, estActif }`

4. **DELETE /api/utilisateurs/:id**
   - Supprime un administrateur

5. **GET /api/academic/ecoles**
   - Récupère la liste des écoles pour le formulaire

## Styles

Le composant utilise les mêmes styles que le composant `users` via l'import :

```scss
@import '../users/users.component.scss';
```

Cela assure une cohérence visuelle entre les différentes sections de gestion des utilisateurs.

## Utilisation

### Pour accéder à la section

1. Se connecter en tant que super-administrateur
2. Cliquer sur "Administrateurs" dans la sidebar
3. La page affiche la liste des administrateurs d'école

### Pour créer un administrateur

1. Cliquer sur "Nouvel Administrateur"
2. Remplir le formulaire
3. Sélectionner une école
4. Générer ou saisir un mot de passe
5. Cliquer sur "Créer"

### Pour modifier un administrateur

1. Cliquer sur l'icône "Modifier" (crayon)
2. Modifier les informations
3. Cliquer sur "Mettre à jour"

### Pour réinitialiser le mot de passe

1. Cliquer sur l'icône "Réinitialiser" (cadenas)
2. Saisir le nouveau mot de passe
3. Confirmer le mot de passe
4. Cliquer sur "Réinitialiser"

## Messages de confirmation

Toutes les actions critiques (suppression, désactivation) affichent une boîte de dialogue de confirmation avant d'être exécutées.

## Gestion des erreurs

- Les erreurs API sont affichées dans un message d'erreur en haut de la page
- Les messages de succès sont affichés après chaque opération réussie
- Les messages dispar