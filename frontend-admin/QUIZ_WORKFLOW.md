# 📝 Workflow de Création et Publication de Quiz

## 🎯 Vue d'ensemble

Le système de quiz supporte deux modes :
1. **Brouillon (draft)** : Quiz en cours de création, non visible par les étudiants
2. **Actif (active)** : Quiz publié et accessible aux étudiants
3. **Fermé (closed)** : Quiz terminé, plus de soumissions acceptées

---

## 📋 Processus de création

### Étape 1 : Informations du quiz

**Champs requis** :
- ✅ Titre du quiz
- ✅ Année académique
- ✅ Matière/Cours

**Champs optionnels** :
- Description
- Date de fin
- Type d'évaluation

```typescript
// Exemple de données
{
  title: "Évaluation Mi-parcours - Algorithmique",
  subject: "Algorithmique et Programmation",
  academicYear: "2024-2025",
  type: "Mi-parcours"
}
```

### Étape 2 : Ajout des questions

**Types de questions supportés** :
1. **Choix Multiple (QCM)** : Plusieurs options, une ou plusieurs réponses correctes
2. **Vrai/Faux** : Question binaire
3. **Réponse Courte** : Texte libre

**Pour chaque question** :
- ✅ Texte de la question
- ✅ Type de question
- ✅ Points attribués
- ✅ Options (pour QCM)
- ✅ Réponse(s) correcte(s)

```typescript
// Exemple de question QCM
{
  text: "Quelle est la complexité de la recherche binaire ?",
  type: "multiple_choice",
  points: 2,
  options: [
    { text: "O(n)", isCorrect: false },
    { text: "O(log n)", isCorrect: true },
    { text: "O(n²)", isCorrect: false },
    { text: "O(1)", isCorrect: false }
  ]
}
```

### Étape 3 : Prévisualisation

**Vérifications automatiques** :
- ✅ Au moins une question ajoutée
- ✅ Toutes les questions ont des réponses correctes
- ✅ Points totaux calculés
- ✅ Informations complètes

**Actions disponibles** :
1. **Enregistrer comme brouillon** : Sauvegarde sans publier
2. **Publier le quiz** : Rend le quiz accessible aux étudiants

---

## 💾 Enregistrement comme brouillon

### Quand utiliser ?
- Quiz en cours de création
- Besoin de réviser les questions
- Attente de validation
- Quiz non finalisé

### Caractéristiques
- ✅ Sauvegardé dans le système
- ✅ Modifiable à tout moment
- ❌ Non visible par les étudiants
- ❌ Pas de soumissions possibles

### Code
```typescript
async saveAsDraft(): Promise<void> {
  const quiz = new Quiz(
    this.generateId(),
    this.quizTitle(),
    this.selectedSubject(),
    'draft', // ← Statut brouillon
    [],
    ['class-1'],
    new Date()
  );

  this.createQuizUseCase.execute(quiz).subscribe({
    next: () => {
      this.toastService.success('Quiz enregistré comme brouillon');
      this.router.navigate(['/quiz-management']);
    }
  });
}
```

---

## 🚀 Publication du quiz

### Quand publier ?
- Quiz finalisé et vérifié
- Questions validées
- Prêt pour les étudiants
- Date de début atteinte

### Validations avant publication
```typescript
// Dans l'entité Quiz
publish(): void {
  if (this.questions.length === 0) {
    throw new Error('Impossible de publier un quiz sans questions');
  }
  this.status = 'active';
}
```

### Caractéristiques
- ✅ Visible par les étudiants
- ✅ Soumissions acceptées
- ⚠️ Modifications limitées
- ✅ Statistiques disponibles

### Code
```typescript
async publishQuiz(): Promise<void> {
  // Confirmation obligatoire
  const confirmed = await this.modalService.confirm(
    'Publier le quiz',
    'Êtes-vous sûr de vouloir publier ce quiz ? Il sera visible par les étudiants.'
  );
  
  if (confirmed) {
    const quiz = new Quiz(
      this.generateId(),
      this.quizTitle(),
      this.selectedSubject(),
      'active', // ← Statut actif
      [],
      ['class-1'],
      new Date()
    );

    this.createQuizUseCase.execute(quiz).subscribe({
      next: () => {
        this.toastService.success('Quiz publié avec succès !');
        this.router.navigate(['/quiz-management']);
      }
    });
  }
}
```

---

## 🔄 Cycle de vie d'un quiz

```
┌─────────────┐
│   DRAFT     │ ← Création initiale
│ (Brouillon) │
└──────┬──────┘
       │
       │ Publier
       ↓
┌─────────────┐
│   ACTIVE    │ ← Quiz accessible
│  (Publié)   │
└──────┬──────┘
       │
       │ Fermer
       ↓
┌─────────────┐
│   CLOSED    │ ← Quiz terminé
│  (Fermé)    │
└─────────────┘
```

### Transitions possibles

#### DRAFT → ACTIVE
- ✅ Via bouton "Publier"
- ✅ Validation des questions
- ✅ Confirmation requise

#### ACTIVE → CLOSED
- ✅ Via bouton "Fermer"
- ✅ Date de fin atteinte
- ✅ Manuellement par l'admin

#### ACTIVE → DRAFT
- ❌ Non autorisé (pour éviter les pertes de données)
- ⚠️ Utiliser "Dépublier" si nécessaire (à implémenter)

---

## 🛠️ Use Cases disponibles

### 1. CreateQuizUseCase
```typescript
// Créer un nouveau quiz (brouillon ou publié)
execute(quiz: Quiz): Observable<Quiz>
```

### 2. PublishQuizUseCase
```typescript
// Publier un quiz existant
execute(id: string): Observable<Quiz>
```

### 3. UpdateQuizUseCase (à créer)
```typescript
// Modifier un quiz existant
execute(id: string, updates: Partial<Quiz>): Observable<Quiz>
```

### 4. CloseQuizUseCase (à créer)
```typescript
// Fermer un quiz
execute(id: string): Observable<Quiz>
```

---

## 📊 Données sauvegardées

### Quiz Entity
```typescript
{
  id: string,              // Généré automatiquement
  title: string,           // Titre du quiz
  subject: string,         // Matière
  status: QuizStatus,      // 'draft' | 'active' | 'closed'
  questions: Question[],   // Liste des questions
  classIds: string[],      // Classes concernées
  createdDate: Date,       // Date de création
  endDate?: Date,          // Date de fin (optionnel)
  type?: string            // Type d'évaluation (optionnel)
}
```

### Question Entity
```typescript
{
  id: string,
  text: string,
  type: QuestionType,      // 'QCM' | 'closed' | 'open'
  points: number,
  options: QuestionOption[]
}
```

---

## ✅ Checklist de publication

Avant de publier un quiz, vérifier :

- [ ] Le titre est clair et descriptif
- [ ] La matière est correctement sélectionnée
- [ ] Au moins une question est ajoutée
- [ ] Toutes les questions ont des réponses correctes
- [ ] Les points sont correctement attribués
- [ ] Les classes cibles sont sélectionnées
- [ ] La date de fin est définie (si applicable)
- [ ] Le quiz a été prévisualisé
- [ ] Confirmation de publication obtenue

---

## 🐛 Gestion d'erreurs

### Erreurs courantes

#### 1. Quiz sans questions
```typescript
Error: "Impossible de publier un quiz sans questions"
Solution: Ajouter au moins une question
```

#### 2. Titre vide
```typescript
Error: "Le titre du quiz est requis"
Solution: Remplir le champ titre
```

#### 3. Aucune classe sélectionnée
```typescript
Error: "Au moins une classe doit être sélectionnée"
Solution: Sélectionner une ou plusieurs classes
```

### Messages de succès

```typescript
// Brouillon
"Quiz enregistré comme brouillon"

// Publication
"Quiz publié avec succès !"

// Modification
"Quiz modifié avec succès"

// Suppression
"Quiz supprimé avec succès"
```

---

## 🔐 Permissions

### Brouillon
- ✅ Créer
- ✅ Modifier
- ✅ Supprimer
- ✅ Publier

### Actif
- ❌ Supprimer (sauf si aucune soumission)
- ⚠️ Modifier (limité)
- ✅ Fermer
- ✅ Voir statistiques

### Fermé
- ❌ Modifier
- ❌ Supprimer (si soumissions)
- ✅ Voir statistiques
- ✅ Archiver

---

## 📈 Prochaines améliorations

### À implémenter
1. **Planification** : Publier automatiquement à une date donnée
2. **Dépublication** : Repasser un quiz en brouillon
3. **Duplication** : Copier un quiz existant
4. **Templates** : Créer des modèles de quiz
5. **Banque de questions** : Réutiliser des questions
6. **Import/Export** : Importer des questions depuis Excel
7. **Prévisualisation étudiante** : Voir le quiz comme un étudiant
8. **Brouillon auto** : Sauvegarde automatique pendant la création

---

## 🧪 Tests

### Test de création en brouillon
1. Aller sur "Créer un quiz"
2. Remplir les informations
3. Ajouter des questions
4. Cliquer sur "Enregistrer comme brouillon"
5. Vérifier le toast de succès
6. Vérifier que le quiz apparaît avec statut "Brouillon"

### Test de publication
1. Créer un quiz en brouillon
2. Cliquer sur "Publier"
3. Confirmer la publication
4. Vérifier le toast de succès
5. Vérifier que le statut passe à "Actif"
6. Vérifier que le quiz est visible dans la liste

### Test de publication directe
1. Aller sur "Créer un quiz"
2. Remplir les informations
3. Ajouter des questions
4. Cliquer sur "Publier le quiz"
5. Confirmer
6. Vérifier la création et publication immédiate

---

**Dernière mise à jour** : 12 novembre 2024  
**Version** : 1.0.0
