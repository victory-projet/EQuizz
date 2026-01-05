# Guide du Wizard de Création de Quiz

## Vue d'ensemble

Le wizard de création de quiz a été amélioré pour intégrer directement la création de questions à l'étape 2, éliminant le besoin de redirection vers une autre page.

## Étapes du Wizard

### 🔧 Étape 1 : Configuration
- **Titre du quiz** (obligatoire)
- **Description** (optionnelle)
- **Dates de début et fin** (obligatoires)
- **Cours/UE** (obligatoire)
- **Classes concernées** (au moins une obligatoire)

**Fonctionnalités :**
- Sauvegarde automatique toutes les 30 secondes
- Validation en temps réel
- Indicateur de dernière sauvegarde

### ❓ Étape 2 : Questions (NOUVEAU)
- **Interface intégrée** pour créer les questions
- **Types de questions supportés :**
  - QCM (Choix multiples)
  - Réponse ouverte

**Fonctionnalités :**
- Ajout de questions une par une
- Modification des questions existantes
- Suppression avec confirmation
- Aperçu en temps réel des questions
- Validation : au moins une question requise

**Interface :**
- Liste des questions créées avec numérotation
- Formulaire modal pour créer/modifier
- Actions rapides (modifier, supprimer)
- Compteur de questions

### 🚀 Étape 3 : Publication
- **Résumé** du quiz créé
- **Options de finalisation :**
  - Continuer l'édition
  - Aperçu du quiz
  - Publication immédiate

## Nouvelles Fonctionnalités

### 1. Formulaire de Questions Intégré
```typescript
// Le formulaire est maintenant directement dans le wizard
<app-question-form
  [evaluationId]="draftEvaluationId()!"
  [quizzId]="quizzId()!"
  [question]="editingQuestion()"
  [questionNumber]="questions().length + 1"
  (saved)="onQuestionSaved($event)"
  (cancelled)="onQuestionCancelled()"
></app-question-form>
```

### 2. Gestion d'État Améliorée
- `questions` : Signal contenant la liste des questions
- `showQuestionForm` : Contrôle l'affichage du formulaire
- `editingQuestion` : Question en cours d'édition
- `quizzId` : ID du quiz pour les opérations sur les questions

### 3. Interface Utilisateur Moderne
- **Cards pour les questions** avec actions rapides
- **Modal overlay** pour le formulaire
- **État vide** avec call-to-action
- **Validation visuelle** des étapes

## Flux d'Utilisation

### Création d'un Nouveau Quiz

1. **Étape 1 - Configuration**
   ```
   Remplir les informations → Cliquer "Continuer"
   ↓
   Création automatique du brouillon
   ↓
   Passage à l'étape 2
   ```

2. **Étape 2 - Questions**
   ```
   État vide → "Créer ma première question"
   ↓
   Formulaire modal → Saisir question → "Ajouter"
   ↓
   Question ajoutée à la liste → Répéter si nécessaire
   ↓
   "Finaliser" (si au moins 1 question)
   ```

3. **Étape 3 - Publication**
   ```
   Résumé du quiz → Choisir action finale
   ↓
   - "Continuer l'édition" : Retour à l'éditeur complet
   - "Aperçu" : Voir le rendu étudiant
   - "Publier" : Mise en ligne immédiate
   ```

## Types de Questions

### QCM (Choix Multiples)
- **Énoncé** : Question principale
- **Options** : Minimum 2, maximum illimité
- **Interface** : Lettres A, B, C, D...
- **Ajout/Suppression** d'options dynamique

### Réponse Ouverte
- **Énoncé** : Question principale
- **Réponse** : Zone de texte libre pour l'étudiant
- **Pas d'options** : Interface simplifiée

## Validation et Contrôles

### Étape 1
- ✅ Titre non vide
- ✅ Date de début < Date de fin
- ✅ Cours sélectionné
- ✅ Au moins une classe

### Étape 2
- ✅ Au moins une question créée
- ✅ Questions valides (énoncé + options si QCM)

### Étape 3
- ✅ Quiz complet et cohérent

## Sauvegarde Automatique

- **Déclenchement** : Toutes les 30 secondes si données minimales
- **Conditions** : Titre non vide
- **Indicateur** : "Sauvegardé automatiquement à HH:MM:SS"
- **Persistance** : Brouillon conservé entre sessions

## Gestion d'Erreurs

### Erreurs de Validation
- Messages contextuels en rouge
- Blocage de navigation si erreurs
- Auto-disparition après 5 secondes

### Erreurs Réseau
- Retry automatique pour sauvegarde
- Messages d'avertissement
- Préservation des données locales

## Responsive Design

### Mobile/Tablette
- Formulaire modal plein écran
- Navigation adaptée
- Actions tactiles optimisées

### Desktop
- Modal centrée
- Raccourcis clavier
- Interface multi-colonnes

## Améliorations Apportées

1. **UX Simplifiée** : Plus de redirection, tout en un seul endroit
2. **Feedback Visuel** : Compteurs, indicateurs, états
3. **Validation Intelligente** : Blocage si données incomplètes
4. **Sauvegarde Robuste** : Auto-save + indicateurs
5. **Interface Moderne** : Cards, modals, animations

## Prochaines Améliorations Possibles

- [ ] Drag & drop pour réorganiser les questions
- [ ] Import en masse de questions (Excel/CSV)
- [ ] Templates de questions prédéfinies
- [ ] Prévisualisation en temps réel côté étudiant
- [ ] Duplication de questions existantes
- [ ] Banque de questions réutilisables