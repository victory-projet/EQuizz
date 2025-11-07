# Modal de Génération de Quiz

## Description
Ce modal offre deux options pour créer un nouveau quiz:
1. **Création Manuelle** : Configuration complète via formulaire
2. **Import Excel** : Import de questions depuis un fichier Excel

## Interface Utilisateur

### Design
- Deux cartes côte à côte présentant les options
- Séparateur visuel "OU" au centre
- Section d'information sur le format Excel
- Lien de téléchargement du template Excel

### Interactions
- Clic sur une carte pour sélectionner l'option
- Clic sur le bouton pour confirmer le choix
- Fermeture du modal après sélection

## Flux de Travail

### Option 1: Création Manuelle
1. Utilisateur clique sur "Créer manuellement"
2. Modal se ferme et retourne `{ type: 'manual' }`
3. Le composant parent ouvre le modal de création (`CreateModalComponent`)
4. L'utilisateur remplit le formulaire
5. Le quiz est créé avec les données du formulaire

### Option 2: Import Excel
1. Utilisateur clique sur "Importer un fichier"
2. Modal se ferme et retourne `{ type: 'import' }`
3. Le composant parent ouvre le modal d'import (`ImportExcelModalComponent`)
4. L'utilisateur sélectionne un fichier Excel
5. Les questions sont prévisualisées et validées
6. Le quiz est créé avec les questions importées

## Utilisation

### Depuis le Composant Évaluation
```typescript
onGenerateQuiz(): void {
  this.modalService.openGenerateQuiz().subscribe(result => {
    if (result) {
      if (result.type === 'manual') {
        // Ouvrir le modal de création manuelle
        this.modalService.openCreate().subscribe(createResult => {
          if (createResult) {
            this.quizService.createQuiz(createResult).subscribe(() => {
              this.loadQuizzes();
            });
          }
        });
      } else if (result.type === 'import') {
        // Ouvrir le modal d'import Excel
        this.modalService.openImportExcel().subscribe(importResult => {
          if (importResult && importResult.questions) {
            // Créer le quiz avec les questions importées
            this.loadQuizzes();
          }
        });
      }
    }
  });
}
```

### Depuis le Service Modal
```typescript
openGenerateQuiz(): Observable<any> {
  return this.dialog.open(GenerateQuizModalComponent, {
    width: '800px',
    maxWidth: '95vw',
    panelClass: 'generate-quiz-modal',
    disableClose: false
  }).afterClosed();
}
```

## Format de Retour

### Création Manuelle
```typescript
{
  type: 'manual'
}
```

### Import Excel
```typescript
{
  type: 'import'
}
```

### Annulation
```typescript
undefined
```

## Personnalisation

### Styles
Le modal utilise un dégradé violet dans l'en-tête:
```scss
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Icônes
- Création manuelle: `edit_note`
- Import Excel: `upload_file`
- Information: `info`
- Téléchargement: `download`

## Responsive
- Sur mobile (< 768px), les cartes s'empilent verticalement
- Le séparateur "OU" pivote de 90°
- Les boutons prennent toute la largeur

## Accessibilité
- Boutons avec icônes et texte descriptif
- Contraste élevé pour la lisibilité
- Navigation au clavier supportée
- Fermeture avec Échap
