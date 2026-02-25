# Alignement avec le Backend

## Vue d'ensemble

Ce document décrit les modifications apportées au frontend pour aligner les structures de données avec le backend.

## Modèle Question Backend

### Structure dans la base de données

```javascript
{
  id: UUID,
  enonce: TEXT,              // Texte de la question
  typeQuestion: ENUM,        // 'CHOIX_MULTIPLE' ou 'REPONSE_OUVERTE'
  options: JSON,             // Tableau d'options pour CHOIX_MULTIPLE
  ordre: INTEGER,            // Ordre d'affichage
  quizz_id: UUID            // Référence au quiz
}
```

### Types de questions supportés

Le backend supporte **2 types de questions** :

1. **CHOIX_MULTIPLE** - Question à choix multiples
   - Nécessite un tableau `options` avec les choix possibles
   - Une seule réponse correcte (identifiée par son index)

2. **REPONSE_OUVERTE** - Question à réponse libre
   - Pas d'options prédéfinies
   - L'étudiant saisit une réponse textuelle

## Changements Frontend

### 1. Types de Questions

**Avant** (non aligné) :
- `QCM` - Question à choix multiples
- `VRAI_FAUX` - Question vrai/faux
- `TEXTE_LIBRE` - Question à réponse libre

**Après** (aligné avec backend) :
- `CHOIX_MULTIPLE` - Question à choix multiples
- `REPONSE_OUVERTE` - Question à réponse libre

### 2. Structure des Données

**Avant** :
```typescript
{
  type: 'QCM',
  intitule: 'Question...',
  points: 2,
  options: [
    { texte: 'Option 1', estCorrecte: true },
    { texte: 'Option 2', estCorrecte: false }
  ],
  noteInterne: 'Note...'
}
```

**Après** :
```typescript
{
  typeQuestion: 'CHOIX_MULTIPLE',
  enonce: 'Question...',
  ordre: 1,
  options: ['Option 1', 'Option 2', 'Option 3'],
  reponseCorrecteIndex: 0  // Index de la réponse correcte
}
```

### 3. Champs Modifiés

| Ancien champ | Nouveau champ | Type | Description |
|--------------|---------------|------|-------------|
| `type` | `typeQuestion` | string | Type de question |
| `intitule` | `enonce` | string | Texte de la question |
| `options[].texte` | `options[]` | string[] | Tableau simple de chaînes |
| `options[].estCorrecte` | `reponseCorrecteIndex` | number | Index de la réponse correcte |
| `points` | *(supprimé)* | - | Non géré par le backend |
| `noteInterne` | *(supprimé)* | - | Non géré par le backend |

## Format d'Import

### Excel (Format Backend)

Le backend attend un fichier Excel avec les colonnes suivantes :

| Colonne | Description | Obligatoire | Exemple |
|---------|-------------|-------------|---------|
| A - Enonce | Texte de la question | Oui | "Quelle est la capitale de la France?" |
| B - Type | Type de question | Oui | "CHOIX_MULTIPLE" ou "REPONSE_OUVERTE" |
| C - Options | Options séparées par `;` | Oui pour CHOIX_MULTIPLE | "Paris;Lyon;Marseille;Bordeaux" |

**Exemple de fichier Excel** :

```
Enonce                                    | Type              | Options
Quelle est la capitale de la France?     | CHOIX_MULTIPLE    | Paris;Lyon;Marseille;Bordeaux
Expliquez le théorème de Pythagore       | REPONSE_OUVERTE   |
Qu'est-ce qu'une variable?               | CHOIX_MULTIPLE    | Un conteneur;Une fonction;Une classe
```

### CSV (Format Frontend)

```csv
enonce,typeQuestion,options
"Quelle est la capitale de la France?",CHOIX_MULTIPLE,"Paris;Lyon;Marseille;Bordeaux"
"Expliquez le théorème de Pythagore",REPONSE_OUVERTE,""
```

### JSON (Format Frontend)

```json
[
  {
    "enonce": "Quelle est la capitale de la France?",
    "typeQuestion": "CHOIX_MULTIPLE",
    "options": ["Paris", "Lyon", "Marseille", "Bordeaux"]
  },
  {
    "enonce": "Expliquez le théorème de Pythagore",
    "typeQuestion": "REPONSE_OUVERTE",
    "options": []
  }
]
```

## Interface Utilisateur

### Badges de Type

Les badges affichent maintenant les labels corrects :

- **Choix multiple** (bleu) - `CHOIX_MULTIPLE`
- **Réponse ouverte** (vert) - `REPONSE_OUVERTE`

### Onglets de Filtrage

Les onglets de filtrage ont été mis à jour :
- "Toutes" - Affiche toutes les questions
- "Choix multiple" - Filtre `CHOIX_MULTIPLE`
- "Réponse ouverte" - Filtre `REPONSE_OUVERTE`

### Modal d'Ajout/Modification

**Sélecteur de type** :
- Option 1 : "Choix multiple"
- Option 2 : "Réponse ouverte"

**Champs** :
- Énoncé de la question (textarea)
- Options (uniquement pour CHOIX_MULTIPLE)
  - Liste d'inputs texte simples
  - Radio button pour marquer la réponse correcte
- Ordre d'affichage (number)

**Champs supprimés** :
- Points (non géré par le backend)
- Note interne (non géré par le backend)

## Affichage des Questions

### Carte de Question

**En-tête** :
- Badge de type (Choix multiple / Réponse ouverte)
- Énoncé de la question
- Actions (Éditer, Dupliquer, Supprimer)

**Détails (expandé)** :

Pour **CHOIX_MULTIPLE** :
- Liste des options
- Indicateur visuel (✓) pour la réponse correcte

Pour **REPONSE_OUVERTE** :
- Message informatif : "Les étudiants pourront saisir une réponse libre"
- Icône `edit_note`

## Validation

### Règles de Validation

**Pour toutes les questions** :
- L'énoncé ne peut pas être vide
- L'ordre doit être >= 1

**Pour CHOIX_MULTIPLE** :
- Minimum 2 options
- Toutes les options doivent avoir du texte
- Une réponse correcte doit être sélectionnée (reponseCorrecteIndex >= 0)

**Pour REPONSE_OUVERTE** :
- Pas de validation supplémentaire

## API Backend

### Endpoint d'Import

```
POST /api/evaluations/quizz/:quizzId/import
Content-Type: multipart/form-data
```

**Paramètres** :
- `file` : Fichier Excel (.xlsx, .xls)

**Réponse** :
```json
{
  "message": "X questions ont été importées avec succès.",
  "questions": [...]
}
```

### Endpoint de Création

```
POST /api/evaluations/quizz/:quizzId/questions
Content-Type: application/json
```

**Body** :
```json
{
  "enonce": "Question...",
  "typeQuestion": "CHOIX_MULTIPLE",
  "options": ["Option 1", "Option 2"],
  "ordre": 1
}
```

## Migration des Données Existantes

Si vous avez des données existantes avec l'ancien format, voici comment les migrer :

```typescript
// Ancien format
const oldQuestion = {
  type: 'QCM',
  intitule: 'Question...',
  points: 2,
  options: [
    { texte: 'Option 1', estCorrecte: true },
    { texte: 'Option 2', estCorrecte: false }
  ]
};

// Nouveau format
const newQuestion = {
  typeQuestion: 'CHOIX_MULTIPLE',
  enonce: oldQuestion.intitule,
  ordre: 1,
  options: oldQuestion.options.map(opt => opt.texte),
  reponseCorrecteIndex: oldQuestion.options.findIndex(opt => opt.estCorrecte)
};
```

## Prochaines Étapes

1. Implémenter l'import réel de fichiers Excel via l'API
2. Gérer la réponse correcte côté backend (actuellement non stockée)
3. Ajouter la gestion des points si nécessaire
4. Implémenter l'export de questions vers Excel
