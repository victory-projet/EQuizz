# Import Excel - Étudiants

## Format du fichier Excel

Le fichier doit contenir 6 colonnes :

| Nom | Prenom | Email | Matricule | IdCarte | Classe |
|-----|--------|-------|-----------|---------|--------|
| Dupont | Jean | jean.dupont@mail.com | SJING-2024-001 | CARD001 | L1-INFO |
| Martin | Marie | marie.martin@mail.com | SJING-2024-002 | | L1-INFO |
| Durand | Paul | paul.durand@mail.com | | | L2-MATH |

### Colonnes

- **Nom** (obligatoire) : Nom de famille
- **Prenom** (obligatoire) : Prénom
- **Email** (obligatoire) : Email unique
- **Matricule** (optionnel) : Généré automatiquement si vide
- **IdCarte** (optionnel) : Identifiant de carte étudiant
- **Classe** (optionnel si classeId fourni) : Nom de la classe

### Logique Automatique UPSERT

Le système détermine automatiquement s'il faut créer ou mettre à jour un étudiant :

1. **Si matricule fourni ET existe** → Mise à jour de l'étudiant avec ce matricule
2. **Si email existe** → Mise à jour de l'étudiant avec cet email
3. **Sinon** → Création d'un nouvel étudiant

**Exemples :**
- Ligne avec `SJING-2024-001` (matricule existant) → Mise à jour
- Ligne avec `marie@mail.com` (email existant) → Mise à jour  
- Ligne avec nouvelles données → Création

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
