# Modal d'Import Excel

## Description
Ce modal permet d'importer des questions de quiz depuis un fichier Excel (.xlsx, .xls).

## Fonctionnalités

### 1. Upload de Fichier
- Glisser-déposer ou sélection de fichier
- Support des formats .xlsx et .xls
- Validation automatique du fichier

### 2. Prévisualisation
- Affichage des questions détectées dans un tableau
- Indication du nombre de questions valides/invalides
- Barre de progression de validation
- Mise en évidence des erreurs

### 3. Validation
- Vérification du type de question (multiple/ouverte/fermée)
- Vérification que la question n'est pas vide
- Vérification du nombre d'options pour les QCM (minimum 2)

### 4. Template Excel
- Téléchargement d'un modèle Excel pré-formaté
- Instructions claires sur le format requis

## Format du Fichier Excel

### Structure Requise
| Colonne | Contenu | Obligatoire |
|---------|---------|-------------|
| A | Type de question | Oui |
| B | Texte de la question | Oui |
| C | Option 1 | Pour QCM |
| D | Option 2 | Pour QCM |
| E | Option 3 | Optionnel |
| F | Option 4 | Optionnel |

### Types de Questions Acceptés
- `multiple` : Question à choix multiple (QCM)
- `close` : Question fermée (Vrai/Faux)
- `open` : Question ouverte

### Exemple de Fichier Excel

```
Type      | Question                                    | Option 1  | Option 2  | Option 3 | Option 4
----------|---------------------------------------------|-----------|-----------|----------|----------
multiple  | Quelle est la capitale de la France?        | Paris     | Londres   | Berlin   | Madrid
close     | La Terre est ronde                          | Vrai      | Faux      |          |
open      | Expliquez le concept de polymorphisme       |           |           |          |
```

## Utilisation

### Depuis le Code
```typescript
this.modalService.openImportExcel().subscribe(result => {
  if (result && result.questions) {
    console.log('Questions importées:', result.questions);
    // Traiter les questions importées
  }
});
```

### Format de Retour
```typescript
{
  questions: [
    {
      id: string,
      type: 'multiple' | 'close' | 'open',
      text: string,
      order: number,
      points: number,
      options: [
        { id: string, text: string, order: number }
      ],
      createdAt: Date
    }
  ]
}
```

## Intégration avec xlsx (Production)

Pour la production, installez la bibliothèque xlsx:

```bash
npm install xlsx
npm install --save-dev @types/xlsx
```

Puis mettez à jour `excel-import.service.ts` pour utiliser la vraie logique de parsing:

```typescript
import * as XLSX from 'xlsx';

private async readExcelFile(file: File): Promise<ExcelQuestion[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e: any) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        
        const questions = this.parseExcelData(jsonData);
        resolve(questions);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.readAsArrayBuffer(file);
  });
}
```

## Notes
- Les données sont actuellement simulées pour le développement
- La validation se fait côté client avant l'import
- Les questions invalides sont affichées mais non importées
- Le template Excel peut être téléchargé depuis le modal
