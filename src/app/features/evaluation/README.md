# Page Évaluations - Gestion des Quiz

## Description
Cette page permet de gérer tous les quiz de l'application avec une interface complète incluant:
- Statistiques globales (Total quiz, Quiz actifs, Taux de participation, Brouillons)
- Recherche par titre, UE ou classe
- Filtres par statut (Tous, En cours, Brouillons, Clôturés)
- Actions CRUD complètes via modals

## Fonctionnalités

### 1. Créer un Quiz
- Modal avec formulaire complet
- Champs: Titre, UE, Type, Date de fin, Classes, Nombre de questions, Statut
- Validation des champs obligatoires
- Possibilité de créer en brouillon ou publier immédiatement

### 2. Modifier un Quiz
- Modal pré-rempli avec les données existantes
- Modification de tous les champs
- Sauvegarde avec validation

### 3. Publier un Quiz
- Modal de confirmation avec récapitulatif
- Affiche les détails du quiz avant publication
- Change le statut de "Brouillon" à "En cours"

### 4. Supprimer un Quiz
- Modal de confirmation avec avertissement
- Affiche le titre et les détails du quiz
- Suppression définitive après confirmation

### 5. Prévisualiser un Quiz
- Modal de prévisualisation (utilise le modal existant)
- Affiche le contenu complet du quiz

## Structure des Fichiers

```
src/app/features/evaluation/
├── evaluation.ts          # Composant principal
├── evaluation.html        # Template
├── evaluation.scss        # Styles
├── evaluation.spec.ts     # Tests
└── README.md             # Documentation
```

## Services Utilisés

### QuizService
- `getQuizzes()`: Récupère tous les quiz
- `createQuiz(quiz)`: Crée un nouveau quiz
- `updateQuiz(id, quiz)`: Met à jour un quiz
- `deleteQuiz(id)`: Supprime un quiz
- `publishQuiz(id)`: Publie un quiz

### ModalService
- `openCreate()`: Ouvre le modal de création
- `openEdit(quiz)`: Ouvre le modal d'édition
- `openPublish(quiz)`: Ouvre le modal de publication
- `openDelete(quiz)`: Ouvre le modal de suppression
- `openPreview(quiz)`: Ouvre le modal de prévisualisation

## Format des Données

```typescript
interface Quiz {
  id: number;
  title: string;
  status: 'En cours' | 'Brouillon' | 'Clôturé';
  ue: string;
  questions: number;
  participation?: {
    current: number;
    total: number;
    rate: number;
  };
  type: string;
  endDate: string;
  classes: string[];
  createdDate: string;
}
```

## Navigation
Route: `/evaluation`

## Notes de Développement
- Les données sont actuellement mockées dans `QuizService`
- Pour la production, décommenter les appels HTTP et connecter au backend
- Les modals utilisent Angular Material Dialog
- Le design est responsive et s'adapte aux mobiles
