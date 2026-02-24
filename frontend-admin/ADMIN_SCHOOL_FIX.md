# Fix: École non affichée pour les administrateurs

## Problème
L'école assignée à l'administrateur ne s'affichait pas dans le frontend, même si elle était correctement stockée dans la base de données et retournée par l'API.

## Cause
Le repository frontend (`user.repository.ts`) ne mappait pas les propriétés `ecole` et `ecoleId` lors de la transformation des données de l'API vers l'entité User.

## Solution

### 1. Ajout des propriétés dans l'entité User
**Fichier**: `frontend-admin/src/app/core/domain/entities/user.entity.ts`

Ajouté les propriétés optionnelles pour les administrateurs:
```typescript
export interface User {
  // ... autres propriétés
  ecoleId?: string;  // Pour les administrateurs
  ecole?: {          // Pour les administrateurs
    id: string;
    nom: string;
  };
}
```

### 2. Mapping dans le repository
**Fichier**: `frontend-admin/src/app/infrastructure/repositories/user.repository.ts`

Ajouté le mapping pour les administrateurs dans la méthode `mapUser()`:
```typescript
if (data.role === 'ADMIN' && data.ecole) {
  return {
    ...baseUser,
    ecoleId: data.ecole.id,
    ecole: {
      id: data.ecole.id,
      nom: data.ecole.nom
    }
  } as any;
}
```

### 3. Logging pour débogage
**Fichier**: `frontend-admin/src/app/presentation/features/admins/admins.component.ts`

Ajouté des console.log dans:
- `loadAdmins()`: Pour voir les données reçues de l'API
- `getSchoolName()`: Pour tracer la résolution du nom d'école

## Vérification

### Backend
L'API retourne correctement:
```json
{
  "role": "ADMIN",
  "ecole": {
    "id": "12fc03d5-dadb-49cf-b8a8-2685cd27ae6d",
    "nom": "Saint Jean Ingenieur"
  }
}
```

### Frontend
Après le fix, le composant admins:
1. Reçoit les données avec `ecole` mappée
2. Affiche le nom de l'école dans la colonne "École"
3. Utilise `getSchoolName()` qui vérifie d'abord `admin.ecole.nom`

## Résultat
✅ L'école "Saint Jean Ingenieur" s'affiche maintenant correctement pour l'administrateur `admin.sji@saintjeaningenieur.org`

## Date
24 février 2026
