# Guide du Form-Wizard Complet pour la Création d'Évaluations

## Vue d'ensemble

Le form-wizard a été restauré et amélioré pour offrir une expérience de création d'évaluation complète en 3 étapes intégrées dans un seul composant.

## Structure du Wizard

### Étape 1 : Informations de Base
**Objectif** : Configurer les paramètres fondamentaux de l'évaluation

**Champs requis :**
- Titre de l'évaluation
- Date de début et fin
- Cours/Unité d'enseignement
- Classes (sélection multiple)

**Champs optionnels :**
- Description

**Fonctionnalités :**
- ✅ Validation en temps réel
- ✅ Sauvegarde automatique en brouillon
- ✅ Indicateur de dernière sauvegarde
- ✅ Sélection multiple de classes avec interface intuitive

### Étape 2 : Gestion des Questions
**Objectif** : Ajouter et gérer les questions du quiz

**Méthodes de création :**
1. **Création manuelle** : Formulaire intégré pour créer des questions une par une
2. **Import Excel** : Interface d'import depuis un fichier Excel

**Types de questions supportés :**
- Questions à choix multiples (avec options A, B, C, etc.)
- Questions à réponse ouverte

**Fonctionnalités :**
- ✅ Aperçu en temps réel des questions créées
- ✅ Suppression de questions avec confirmation
- ✅ Compteur de questions
- ✅ Validation des options pour les choix multiples
- ✅ Interface vide avec call-to-action si aucune question

### Étape 3 : Révision et Publication
**Objectif** : Réviser l'évaluation complète et la publier

**Sections de révision :**
1. **Informations générales** : Résumé de tous les paramètres
2. **Questions** : Liste complète avec métadonnées
3. **Statut de publication** : Vérification des prérequis

**Actions disponibles :**
- Sauvegarder en brouillon
- Publier l'évaluation (si tous les critères sont remplis)

## Navigation

### Indicateurs de Progression
- Barre de progression visuelle avec 3 étapes
- États : Actif, Complété, En attente
- Navigation bidirectionnelle (Précédent/Suivant)

### Validation des Étapes
- **Étape 1 → 2** : Validation complète des informations de base
- **Étape 2 → 3** : Aucune validation (peut passer sans questions)
- **Publication** : Nécessite au moins une question

## Fonctionnalités Avancées

### Sauvegarde Automatique
- Sauvegarde toutes les 30 secondes si des données minimales sont présentes
- Sauvegarde après 3 secondes d'inactivité sur les champs
- Indicateur visuel de la dernière sauvegarde

### Gestion d'État
- Préservation des données entre les étapes
- Gestion des erreurs avec messages contextuels
- Messages de succès temporaires (3 secondes)

### Interface Responsive
- Adaptation mobile complète
- Grilles flexibles pour la sélection de classes
- Actions regroupées sur mobile

## Architecture Technique

### Composants Intégrés
```typescript
// Composants importés dans le wizard
- QuestionFormComponent : Création manuelle de questions
- QuestionImportComponent : Import depuis Excel
```

### Gestion d'État avec Signals
```typescript
// États principaux
currentStep = signal(1);           // Étape actuelle (1-3)
questions = signal<Question[]>([]);// Liste des questions
canPublish = signal(false);        // Possibilité de publier
showCreateForm = signal(false);    // Affichage du formulaire de création
```

### Flux de Données
1. **Étape 1** : Création/mise à jour du brouillon d'évaluation
2. **Étape 2** : Récupération du quizzId et gestion des questions
3. **Étape 3** : Validation finale et publication

## Améliorations Visuelles

### Design System
- Cartes avec ombres et bordures arrondies
- Couleurs cohérentes avec le thème de l'application
- Icônes Material Design
- Animations de transition

### États Visuels
- **Questions** : Badges de type, compteur d'options, aperçu formaté
- **Validation** : Messages d'erreur contextuels, indicateurs de succès
- **Navigation** : Boutons désactivés selon le contexte

### Responsive Design
- Grilles adaptatives
- Actions empilées sur mobile
- Textes et espacements optimisés

## Utilisation

### Démarrage
1. Naviguer vers `/evaluations/create`
2. Remplir les informations de base (Étape 1)
3. Cliquer sur "Suivant" pour créer le brouillon

### Ajout de Questions
1. Choisir entre création manuelle ou import Excel
2. Créer/importer les questions nécessaires
3. Vérifier l'aperçu et supprimer si nécessaire

### Publication
1. Réviser toutes les informations
2. Vérifier que le statut permet la publication
3. Choisir entre "Sauvegarder en brouillon" ou "Publier"

## Avantages du Nouveau Système

### Pour les Utilisateurs
- ✅ Processus guidé étape par étape
- ✅ Sauvegarde automatique (pas de perte de données)
- ✅ Validation en temps réel
- ✅ Aperçu complet avant publication
- ✅ Flexibilité dans la création de questions

### Pour les Développeurs
- ✅ Code centralisé dans un seul composant
- ✅ Gestion d'état simplifiée avec signals
- ✅ Réutilisation des composants existants
- ✅ Architecture modulaire et extensible

### Pour la Maintenance
- ✅ Moins de navigation entre composants
- ✅ Flux de données prévisible
- ✅ Gestion d'erreur centralisée
- ✅ Tests plus faciles à écrire

## Migration depuis l'Ancien Système

### Changements Principaux
- Suppression de la modal de sélection de méthode
- Intégration directe des composants de questions
- Navigation séquentielle obligatoire
- Validation renforcée à chaque étape

### Compatibilité
- Les APIs backend restent inchangées
- Les composants de questions sont réutilisés
- Les entités de données sont identiques

## Prochaines Améliorations Possibles

### Fonctionnalités
- [ ] Prévisualisation de l'évaluation côté étudiant
- [ ] Templates d'évaluations prédéfinies
- [ ] Duplication d'évaluations existantes
- [ ] Planification automatique de publication

### UX/UI
- [ ] Animations de transition entre étapes
- [ ] Drag & drop pour réorganiser les questions
- [ ] Aperçu en temps réel du rendu final
- [ ] Raccourcis clavier pour la navigation

Ce nouveau form-wizard offre une expérience utilisateur cohérente et complète pour la création d'évaluations, tout en maintenant la flexibilité et la robustesse du système.