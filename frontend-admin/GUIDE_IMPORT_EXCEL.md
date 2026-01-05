# Guide d'implémentation de l'import Excel

## État actuel

Le composant `QuestionImportComponent` a été implémenté avec une interface utilisateur complète mais utilise actuellement des données simulées pour la démonstration.

## Pour une implémentation complète

### 1. Installation de la bibliothèque xlsx

```bash
npm install xlsx
npm install @types/xlsx --save-dev
```

### 2. Remplacement du parsing simulé

Dans `question-import.component.ts`, remplacez la méthode `parseExcelFile` par :

```typescript
private async parseExcelFile(file: File): Promise<Question[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Lire la première feuille
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convertir en JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Parser les données selon votre format
        const questions = this.parseExcelData(jsonData);
        resolve(questions);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
    reader.readAsArrayBuffer(file);
  });
}

private parseExcelData(data: any[][]): Question[] {
  const questions: Question[] = [];
  
  // Ignorer la première ligne (en-têtes)
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue; // Ignorer les lignes vides
    
    const question: Question = {
      id: `temp-${i}`,
      enonce: row[0], // Colonne A: Énoncé
      typeQuestion: row[1] || 'REPONSE_OUVERTE', // Colonne B: Type
      options: row[1] === 'CHOIX_MULTIPLE' 
        ? [row[2], row[3], row[4], row[5]].filter(opt => opt && opt.trim()) 
        : [],
      ordre: i,
      quizzId: this.quizzId
    };
    
    questions.push(question);
  }
  
  return questions;
}
```

### 3. Format Excel attendu

Le template Excel doit avoir les colonnes suivantes :
- **Colonne A** : Énoncé de la question
- **Colonne B** : Type de question (`CHOIX_MULTIPLE` ou `REPONSE_OUVERTE`)
- **Colonnes C-F** : Options pour les questions à choix multiples

### 4. Validation des données

Ajoutez une validation plus robuste :

```typescript
private validateQuestion(question: Question): boolean {
  if (!question.enonce || question.enonce.trim().length < 10) {
    return false;
  }
  
  if (question.typeQuestion === 'CHOIX_MULTIPLE') {
    return question.options && question.options.length >= 2;
  }
  
  return true;
}
```

## Fonctionnalités actuelles

✅ Interface utilisateur complète
✅ Sélection de fichiers Excel
✅ Prévisualisation des questions
✅ Import simulé
✅ Téléchargement de template CSV
✅ Gestion des erreurs
✅ États de chargement
✅ Design responsive

## Fonctionnalités à implémenter

🔄 Parsing réel des fichiers Excel (nécessite la bibliothèque xlsx)
🔄 Validation avancée des données
🔄 Support de formats Excel complexes
🔄 Import de métadonnées supplémentaires

## Utilisation

1. Cliquez sur "Importer depuis Excel" dans la gestion des questions
2. Sélectionnez un fichier Excel (.xlsx ou .xls)
3. Prévisualisez les questions détectées
4. Confirmez l'import

Le composant émet l'événement `imported` avec les questions créées, permettant au composant parent de mettre à jour la liste.