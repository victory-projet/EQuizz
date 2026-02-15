# Import Excel - Étudiants

## Format du fichier Excel

Le fichier doit contenir 7 colonnes :

| Nom | Prenom | Email | Matricule | IdCarte | Classe | Action |
|-----|--------|-------|-----------|---------|--------|--------|
| Dupont | Jean | jean.dupont@mail.com | 2025001 | CARD001 | L1-INFO | CREATE |
| Martin | Marie | marie.martin@mail.com | 2025002 | | L1-INFO | UPSERT |
| Durand | Paul | paul.durand@mail.com | | | L2-MATH | CREATE |

### Colonnes

- **Nom** (obligatoire) : Nom de famille
- **Prenom** (obligatoire) : Prénom
- **Email** (obligatoire) : Email unique
- **Matricule** (optionnel) : Généré automatiquement si vide
- **IdCarte** (optionnel) : Identifiant de carte étudiant
- **Classe** (optionnel si classeId fourni) : Nom de la classe
- **Action** (optionnel, défaut: UPSERT) : CREATE, UPDATE ou UPSERT

### Actions

- **CREATE** : Crée uniquement (erreur si existe)
- **UPDATE** : Met à jour uniquement (erreur si n'existe pas)
- **UPSERT** : Crée ou met à jour (recommandé)

## API

### Import

```http
POST /api/academic/etudiants/import
Authorization: Bearer {token}
Content-Type: multipart/form-data

Body:
- file: fichier.xlsx
- classeId: (optionnel) ID de classe par défaut
```

### Validation (dry-run)

```http
POST /api/academic/etudiants/validate
Authorization: Bearer {token}
Content-Type: multipart/form-data

Body:
- file: fichier.xlsx
- classeId: (optionnel) ID de classe par défaut
```

## Réponse

```json
{
  "message": "Import terminé: 2 créé(s), 1 mis à jour, 0 erreur(s)",
  "created": [...],
  "updated": [...],
  "errors": [],
  "stats": {
    "totalRows": 3,
    "created": 2,
    "updated": 1,
    "errors": 0,
    "skipped": 0
  }
}
```

## Génération du fichier exemple

```bash
cd backend
node create-exemple-import.js
```

## Tests

```bash
npm test -- etudiant-import.test.js
```
