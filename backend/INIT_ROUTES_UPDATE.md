# Mise à jour de init-routes.js

## Changements effectués

### 1. Séparation Superadmin et Admin

Avant, un seul utilisateur était créé avec un email `@saintjeaningenieur.org` et était considéré comme admin.

Maintenant:
- **Superadministrateur**: Email `@universitesaintjean.org`, accès global
- **Administrateur**: Email `@saintjeaningenieur.org`, lié à une école spécifique

### 2. Données user enrichies dans la réponse

La réponse de l'endpoint `/api/init/seed` retourne maintenant des informations complètes pour chaque type d'utilisateur:

```javascript
credentials: {
  superadmin: {
    email: 'super.admin@universitesaintjean.org',
    password: 'Admin123!',
    id: 'uuid-du-superadmin',
    nom: 'admin',
    prenom: 'super'
  },
  admin: {
    email: 'jean.directeur@saintjeaningenieur.org',
    password: 'Admin123!',
    id: 'uuid-de-admin',
    nom: 'directeur',
    prenom: 'jean',
    ecoleId: 'uuid-de-ecole'
  },
  enseignant: {
    email: 'marie.dupont@saintjeaningenieur.org',
    password: 'Prof123!',
    id: 'uuid-enseignant',
    nom: 'dupont',
    prenom: 'marie'
  },
  etudiant: {
    email: 'gills.sims@saintjeaningenieur.org',
    password: 'Etudiant123!',
    id: 'uuid-etudiant',
    nom: 'sims',
    prenom: 'gills',
    matricule: 'ING4-2024-001',
    classeId: 'uuid-classe'
  }
}
```

## Utilisation dans les tests

### Test complet avec seed et authentification

Le nouveau fichier `test-seed-and-auth.js` montre comment:
1. Réinitialiser la base de données
2. Peupler avec des données de test
3. Récupérer les credentials depuis la réponse
4. Tester l'authentification avec ces credentials
5. Vérifier que les IDs correspondent

```bash
node backend/test-seed-and-auth.js
```

### Test de création directe

Le fichier `test-admin-creation.js` a été mis à jour pour:
1. Créer un superadministrateur avec email `@universitesaintjean.org`
2. Créer un administrateur avec email `@saintjeaningenieur.org`
3. Afficher toutes les données créées avec leurs IDs

```bash
node backend/test-admin-creation.js
```

## Avantages

1. **Tests plus fiables**: Les IDs et données exactes sont disponibles immédiatement
2. **Pas de hardcoding**: Plus besoin de deviner les emails ou IDs
3. **Séparation des rôles**: Distinction claire entre superadmin et admin
4. **Traçabilité**: Chaque utilisateur créé peut être tracé avec son ID
5. **Réutilisabilité**: Les credentials peuvent être utilisés dans n'importe quel test

## Structure des données

```
Utilisateur (table: utilisateurs)
├── Superadministrateur (table: superadministrateurs)
│   └── Accès global, email @universitesaintjean.org
└── Administrateur (table: administrateurs)
    └── Lié à une école, email @saintjeaningenieur.org
```

## Endpoints disponibles

- `POST /api/init/reset` - Réinitialise la base de données
- `POST /api/init/seed` - Peuple la base avec des données de test
- `GET /api/init/test` - Vérifie l'état de la base de données
