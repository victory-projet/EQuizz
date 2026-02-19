# Génération Automatique de Matricules

## Vue d'ensemble

Le système EQuizz génère automatiquement des matricules uniques pour les étudiants lorsque le champ matricule est vide lors de l'import ou de la création manuelle.

## Format des Matricules

### Format Moderne (Recommandé)
```
ECOLE-ANNEE-NUMERO
```

**Exemples :**
- `SJING-2024-001` - Saint Jean Ingénieur, année 2024, étudiant #1
- `SJING-2024-002` - Saint Jean Ingénieur, année 2024, étudiant #2
- `POLYT-2024-001` - Polytechnique, année 2024, étudiant #1

**Structure :**
- **ECOLE** : Code de 2-5 lettres généré à partir du nom de l'école
- **ANNEE** : Année de fin de l'année académique (4 chiffres)
- **NUMERO** : Numéro séquentiel par école et année (3 chiffres avec zéros de tête)

### Formats Legacy (Compatibilité)
Le système accepte aussi les anciens formats pour compatibilité :
- `2025001` - Format numérique 7 chiffres
- `2223i032` - Format avec lettre (4 chiffres + lettre + 3 chiffres)

## Génération du Code École

Le code école est généré automatiquement selon ces règles :

### Cas Spéciaux
- `Saint Jean Ingénieur` → `SJING`
- `Polytechnique` → `POLYT`

### Règles Générales
1. **Un mot** : 5 premières lettres (`Polytechnique` → `POLYT`)
2. **Deux mots** : 2 lettres + 3 lettres (`Institut Technologie` → `INTEC`)
3. **Trois mots** : 2 + 2 + 1 lettres (`École Nationale Supérieure` → `ÉCNAS`)
4. **Plus de trois mots** : Première lettre de chaque mot (`École Nationale Supérieure des Mines` → `ÉNSDM`)

## Fonctionnement

### 1. Création Manuelle d'Étudiant
```javascript
// Si matricule fourni
const etudiant = await etudiantService.create({
  nom: 'Dupont',
  prenom: 'Jean',
  email: 'jean.dupont@mail.com',
  matricule: 'SJING-2024-001', // Utilisé tel quel
  classe_id: classeId
});

// Si matricule vide
const etudiant = await etudiantService.create({
  nom: 'Martin',
  prenom: 'Marie',
  email: 'marie.martin@mail.com',
  // matricule non fourni → génération automatique
  classe_id: classeId
});
// Résultat : matricule = 'SJING-2024-002'
```

### 2. Import Excel
```excel
| Nom    | Prenom | Email              | Matricule     | Classe  |
|--------|--------|--------------------|---------------|---------|
| Dupont | Jean   | jean@mail.com      | SJING-2024-001| L1-INFO |
| Martin | Marie  | marie@mail.com     |               | L1-INFO |
| Durand | Paul   | paul@mail.com      |               | L2-MATH |
```

**Résultat :**
- Jean Dupont : `SJING-2024-001` (fourni)
- Marie Martin : `SJING-2024-002` (généré)
- Paul Durand : `SJING-2024-003` (généré)

## Algorithme de Génération

```javascript
async function genererMatricule(ecoleId, anneeAcademiqueId) {
  // 1. Récupérer l'école et l'année académique
  const ecole = await db.Ecole.findByPk(ecoleId);
  const anneeAcademique = await db.AnneeAcademique.findByPk(anneeAcademiqueId);
  
  // 2. Générer le code école
  const codeEcole = genererCodeEcole(ecole.nom); // Ex: "SJING"
  
  // 3. Extraire l'année
  const annee = extraireAnnee(anneeAcademique.nom); // Ex: "2024"
  
  // 4. Compter les étudiants existants
  const prefixe = `${codeEcole}-${annee}`; // Ex: "SJING-2024"
  const count = await db.Etudiant.count({
    where: { matricule: { [Op.like]: `${prefixe}-%` } }
  });
  
  // 5. Générer le numéro séquentiel
  const numero = String(count + 1).padStart(3, '0'); // Ex: "001"
  
  // 6. Construire le matricule final
  return `${prefixe}-${numero}`; // Ex: "SJING-2024-001"
}
```

## Unicité et Sécurité

### Garanties d'Unicité
- **Par école et année** : Numérotation séquentielle
- **Vérification supplémentaire** : Test d'existence avant création
- **Gestion des conflits** : Réessai automatique si collision

### Validation
```javascript
function validerFormatMatricule(matricule) {
  const formatModerne = /^[A-Z]{2,5}-\d{4}-\d{3}$/;
  const formatLegacy1 = /^\d{7}$/;
  const formatLegacy2 = /^\d{4}[a-z]\d{3}$/;
  
  return formatModerne.test(matricule) || 
         formatLegacy1.test(matricule) || 
         formatLegacy2.test(matricule);
}
```

## Transferts d'École

Lors d'un transfert vers une autre école, un nouveau matricule est généré :

```javascript
// Étudiant initialement à Saint Jean Ingénieur
const etudiant = { matricule: 'SJING-2024-001' };

// Transfert vers Polytechnique
await etudiantService.transferer(etudiant.id, nouvelleClassePolytechId);

// Nouveau matricule : 'POLYT-2024-001'
// L'historique conserve l'ancien matricule
```

## Historique

Chaque changement de matricule est tracé dans `HistoriqueEtudiant` :

```javascript
// Historique après transfert
[
  {
    matricule: 'POLYT-2024-001',
    ecole: 'Polytechnique',
    estPeriodeActuelle: true,
    dateDebut: '2024-09-01',
    dateFin: null
  },
  {
    matricule: 'SJING-2024-001',
    ecole: 'Saint Jean Ingénieur',
    estPeriodeActuelle: false,
    dateDebut: '2023-09-01',
    dateFin: '2024-08-31'
  }
]
```

## API Endpoints

### Création avec génération automatique
```http
POST /api/academic/etudiants
{
  "nom": "Dupont",
  "prenom": "Jean",
  "email": "jean.dupont@mail.com",
  "classe_id": "uuid-classe"
  // matricule omis → génération automatique
}
```

### Import Excel avec génération automatique
```http
POST /api/academic/etudiants/import
Content-Type: multipart/form-data

file: etudiants.xlsx (avec colonnes matricule vides)
classeId: uuid-classe-defaut (optionnel)
```

### Validation de format
```http
POST /api/academic/etudiants/validate
Content-Type: multipart/form-data

file: etudiants.xlsx
```

## Tests

### Tests Unitaires
```bash
npm test -- matriculeGenerator.test.js
```

### Tests d'Intégration
```bash
npm test -- etudiant.transfer.test.js
```

### Test Manuel
```bash
node test-matricule-simple.js
node demo-matricule-generation.js
```

## Avantages du Système

✅ **Automatisation** : Plus besoin de saisir manuellement les matricules  
✅ **Unicité garantie** : Aucun risque de doublons  
✅ **Traçabilité** : Identification claire de l'école et de l'année  
✅ **Compatibilité** : Support des anciens formats  
✅ **Flexibilité** : Possibilité de fournir un matricule personnalisé  
✅ **Historique** : Conservation des matricules lors des transferts  

## Configuration

Le système utilise les tables existantes :
- `Ecole` : Pour générer le code école
- `AnneeAcademique` : Pour extraire l'année
- `Etudiant` : Pour compter les matricules existants
- `HistoriqueEtudiant` : Pour tracer les changements

Aucune configuration supplémentaire n'est requise.