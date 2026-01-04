# Guide du Formulaire de Création de Questions

## Vue d'ensemble

Le formulaire de création de questions permet aux administrateurs de créer facilement des questions pour leurs évaluations. Il prend en charge deux types de questions :

- **Choix multiples** : Questions avec plusieurs options de réponse
- **Réponse ouverte** : Questions à réponse libre

## Composants créés

### 1. QuestionFormComponent
**Fichier** : `frontend-admin/src/app/presentation/features/question-form/`

Formulaire de création/édition d'une question individuelle avec :
- Sélection du type de question
- Saisie de l'énoncé
- Gestion dynamique des options (pour choix multiples)
- Aperçu en temps réel
- Validation des données

### 2. QuestionManagementComponent
**Fichier** : `frontend-admin/src/app/presentation/features/question-management/`

Composant de gestion complète des questions avec :
- Liste des questions existantes
- Boutons d'action (créer, importer, modifier, supprimer)
- Intégration du formulaire de création
- Intégration du composant d'import Excel

### 3. EvaluationDetailComponent (exemple)
**Fichier** : `frontend-admin/src/app/presentation/features/evaluation-detail/`

Exemple d'intégration dans une page d'évaluation avec onglets.

## Fonctionnalités

### Types de questions supportés

#### 1. Choix multiples (`CHOIX_MULTIPLE`)
- Minimum 2 options requises
- Ajout/suppression dynamique d'options
- Validation automatique
- Aperçu avec boutons radio

#### 2. Réponse ouverte (`REPONSE_OUVERTE`)
- Pas d'options requises
- Zone de texte libre
- Aperçu avec textarea

### Validation

- **Énoncé** : Minimum 10 caractères
- **Type** : Obligatoire
- **Options** : Minimum 2 pour choix multiples, chaque option minimum 1 caractère

### Aperçu en temps réel

Le formulaire affiche un aperçu de la question au fur et à mesure de la saisie :
- Énoncé formaté
- Options avec boutons radio (choix multiples)
- Zone de réponse libre (réponse ouverte)

## API Backend

### Routes utilisées

```javascript
// Récupérer les questions d'un quiz
GET /api/quizz/:quizz_id/questions

// Créer une nouvelle question
POST /api/quizz/:quizz_id/questions

// Modifier une question
PUT /api/questions/:id

// Supprimer une question
DELETE /api/questions/:id

// Importer des questions depuis Excel
POST /api/quizz/:quizz_id/questions/import
```

### Structure des données

```typescript
interface Question {
  id: string;
  enonce: string;
  typeQuestion: 'CHOIX_MULTIPLE' | 'REPONSE_OUVERTE';
  options: string[];
  ordre: number;
  quizz_id: string;
}
```

## Utilisation

### 1. Intégration dans une page d'évaluation

```html
<app-question-management
  [quizzId]="evaluation.quizz.id"
  [evaluationId]="evaluation.id">
</app-question-management>
```

### 2. Utilisation du formulaire seul

```html
<app-question-form
  [quizzId]="quizzId"
  (questionCreated)="onQuestionCreated($event)"
  (cancelled)="onFormCancelled()">
</app-question-form>
```

## États d'affichage

### État vide
Quand aucune question n'existe :
- Icône de question
- Message d'encouragement
- Bouton "Créer ma première question"
- Informations sur les types de questions disponibles

### Liste des questions
Affichage des questions existantes :
- Numérotation automatique
- Type de question avec icône
- Énoncé complet
- Options (pour choix multiples)
- Actions (modifier, supprimer)

### Formulaire de création
- Sélection du type
- Saisie de l'énoncé
- Gestion des options (dynamique)
- Aperçu en temps réel
- Boutons d'action

## Responsive Design

Le formulaire s'adapte aux différentes tailles d'écran :
- **Desktop** : Formulaire centré, largeur maximale 800px
- **Tablet** : Adaptation des espacements
- **Mobile** : 
  - Boutons pleine largeur
  - Formulaire empilé
  - Options sur plusieurs lignes

## Accessibilité

- Labels associés aux champs
- Messages d'erreur clairs
- Navigation au clavier
- Contrastes respectés
- Indicateurs visuels pour les champs requis

## Personnalisation

### Thème
Les couleurs peuvent être personnalisées via les variables CSS :
- `--primary-color` : Couleur principale (boutons, liens)
- `--error-color` : Couleur d'erreur
- `--border-color` : Couleur des bordures
- `--background-color` : Couleur de fond

### Icônes
Les icônes utilisent une classe générique (`icon-*`) qui peut être remplacée par n'importe quelle bibliothèque d'icônes.

## Exemple d'interface

L'interface suit le design fourni avec :
- En-tête "Questions créées"
- Bouton "Nouvelle question" en bleu
- État vide avec message d'encouragement
- Formulaire modal/intégré
- Liste des questions avec actions

## Prochaines améliorations possibles

1. **Drag & Drop** pour réorganiser les questions
2. **Duplication** de questions existantes
3. **Templates** de questions prédéfinies
4. **Catégories** de questions
5. **Banque de questions** réutilisables
6. **Prévisualisation** côté étudiant
7. **Import/Export** en lot
8. **Historique** des modifications