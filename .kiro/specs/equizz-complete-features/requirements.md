# Requirements Document - EQuizz Complete Features

## Introduction

Ce document définit les exigences pour l'implémentation complète des fonctionnalités avancées de l'application EQuizz, incluant la gestion complète des quiz, les analytics, la gestion des UE/Classes, le responsive design, les optimisations de performance et les améliorations UX/UI.

## Glossary

- **System**: L'application web EQuizz (frontend Angular)
- **Quiz**: Un questionnaire d'évaluation contenant plusieurs questions
- **Question**: Un élément d'un quiz avec un type (QCM, fermée, ouverte)
- **UE**: Unité d'Enseignement (cours académique)
- **Classe**: Groupe d'étudiants assignés à des UE
- **Enseignant**: Utilisateur administrateur créant et gérant les quiz
- **Étudiant**: Utilisateur répondant aux quiz
- **Analytics**: Module de statistiques et rapports
- **Toast**: Notification temporaire affichée à l'écran
- **Snackbar**: Message de feedback utilisateur temporaire
- **Lazy Loading**: Chargement différé des modules Angular
- **Responsive**: Adaptation de l'interface aux différentes tailles d'écran

## Requirements

### Requirement 1: Gestion Complète des Quiz

**User Story:** En tant qu'enseignant, je veux créer, éditer, prévisualiser, publier et supprimer des quiz avec leurs questions, afin de gérer efficacement mes évaluations.

#### Acceptance Criteria

1. WHEN l'Enseignant clique sur "Nouveau Quiz", THE System SHALL afficher un formulaire de création avec les champs titre, UE, type, classes, date de fin
2. WHEN l'Enseignant ajoute une question au quiz, THE System SHALL permettre de choisir le type (QCM, fermée, ouverte) et de saisir le contenu
3. WHEN l'Enseignant sauvegarde un quiz, THE System SHALL valider tous les champs obligatoires et afficher un message de confirmation
4. WHEN l'Enseignant clique sur "Éditer" pour un quiz existant, THE System SHALL charger le formulaire pré-rempli avec toutes les questions
5. WHEN l'Enseignant clique sur "Prévisualiser", THE System SHALL afficher le quiz dans une vue étudiant en lecture seule

### Requirement 2: Publication et Suppression de Quiz

**User Story:** En tant qu'enseignant, je veux publier, dépublier et supprimer des quiz, afin de contrôler leur disponibilité pour les étudiants.

#### Acceptance Criteria

1. WHEN l'Enseignant clique sur "Publier" pour un quiz en brouillon, THE System SHALL changer le statut à "active" et afficher une confirmation
2. WHEN l'Enseignant clique sur "Dépublier" pour un quiz actif, THE System SHALL changer le statut à "draft" et afficher une confirmation
3. WHEN l'Enseignant clique sur "Supprimer", THE System SHALL afficher une modale de confirmation avec le titre du quiz
4. WHEN l'Enseignant confirme la suppression, THE System SHALL supprimer le quiz et rafraîchir la liste
5. WHEN l'Enseignant annule la suppression, THE System SHALL fermer la modale sans supprimer le quiz

### Requirement 3: Types de Questions Multiples

**User Story:** En tant qu'enseignant, je veux créer différents types de questions (QCM, fermées, ouvertes), afin de varier mes évaluations.

#### Acceptance Criteria

1. WHEN l'Enseignant sélectionne le type "QCM", THE System SHALL afficher des champs pour 2 à 6 options avec sélection de la bonne réponse
2. WHEN l'Enseignant sélectionne le type "Question fermée", THE System SHALL afficher un champ pour la réponse attendue
3. WHEN l'Enseignant sélectionne le type "Question ouverte", THE System SHALL afficher un champ texte multiligne sans réponse attendue
4. WHEN l'Enseignant ajoute une question, THE System SHALL permettre de définir le nombre de points
5. WHEN l'Enseignant réordonne les questions, THE System SHALL mettre à jour l'ordre d'affichage

### Requirement 4: Analytics et Rapports Avancés

**User Story:** En tant qu'enseignant, je veux visualiser des statistiques détaillées sur les quiz, afin d'analyser les performances des étudiants.

#### Acceptance Criteria

1. WHEN l'Enseignant accède à la page Analytics, THE System SHALL afficher des graphiques de performance par UE
2. WHEN l'Enseignant consulte les statistiques, THE System SHALL afficher le taux de participation par classe
3. WHEN l'Enseignant consulte les statistiques, THE System SHALL afficher le taux de réussite moyen par classe
4. WHEN l'Enseignant sélectionne un quiz, THE System SHALL afficher les détails de performance question par question
5. WHEN l'Enseignant clique sur "Exporter", THE System SHALL générer un fichier PDF ou Excel avec les résultats

### Requirement 5: Export des Résultats

**User Story:** En tant qu'enseignant, je veux exporter les résultats en PDF ou Excel, afin de les partager ou les archiver.

#### Acceptance Criteria

1. WHEN l'Enseignant clique sur "Exporter en PDF", THE System SHALL générer un document PDF avec les statistiques et graphiques
2. WHEN l'Enseignant clique sur "Exporter en Excel", THE System SHALL générer un fichier XLSX avec les données tabulaires
3. WHEN l'export est généré, THE System SHALL télécharger automatiquement le fichier
4. WHEN l'export échoue, THE System SHALL afficher un message d'erreur explicite
5. WHEN l'export est en cours, THE System SHALL afficher un indicateur de chargement

### Requirement 6: Gestion des Unités d'Enseignement

**User Story:** En tant qu'enseignant, je veux créer, modifier et supprimer des UE, afin d'organiser mes cours.

#### Acceptance Criteria

1. WHEN l'Enseignant accède à la page "Cours & UE", THE System SHALL afficher la liste de toutes les UE
2. WHEN l'Enseignant clique sur "Nouvelle UE", THE System SHALL afficher un formulaire avec nom, code, description, crédits
3. WHEN l'Enseignant sauvegarde une UE, THE System SHALL valider les champs et ajouter l'UE à la liste
4. WHEN l'Enseignant clique sur "Éditer" pour une UE, THE System SHALL afficher le formulaire pré-rempli
5. WHEN l'Enseignant supprime une UE, THE System SHALL vérifier qu'aucun quiz n'y est associé avant de supprimer

### Requirement 7: Gestion des Classes

**User Story:** En tant qu'enseignant, je veux créer, modifier et supprimer des classes, afin d'organiser mes groupes d'étudiants.

#### Acceptance Criteria

1. WHEN l'Enseignant accède à la page "Classes", THE System SHALL afficher la liste de toutes les classes
2. WHEN l'Enseignant clique sur "Nouvelle Classe", THE System SHALL afficher un formulaire avec nom, niveau, année académique
3. WHEN l'Enseignant sauvegarde une classe, THE System SHALL valider les champs et ajouter la classe à la liste
4. WHEN l'Enseignant clique sur "Éditer" pour une classe, THE System SHALL afficher le formulaire pré-rempli
5. WHEN l'Enseignant supprime une classe, THE System SHALL vérifier qu'aucun quiz n'y est associé avant de supprimer

### Requirement 8: Assignation des Étudiants

**User Story:** En tant qu'enseignant, je veux assigner des étudiants à des classes, afin de gérer les inscriptions.

#### Acceptance Criteria

1. WHEN l'Enseignant ouvre une classe, THE System SHALL afficher la liste des étudiants assignés
2. WHEN l'Enseignant clique sur "Ajouter des étudiants", THE System SHALL afficher une liste de sélection multiple
3. WHEN l'Enseignant sélectionne des étudiants, THE System SHALL les ajouter à la classe
4. WHEN l'Enseignant retire un étudiant, THE System SHALL afficher une confirmation avant de retirer
5. WHEN l'Enseignant sauvegarde les modifications, THE System SHALL mettre à jour les assignations

### Requirement 9: Responsive Design Mobile

**User Story:** En tant qu'enseignant utilisant un mobile ou une tablette, je veux accéder à toutes les fonctionnalités, afin de gérer mes quiz en déplacement.

#### Acceptance Criteria

1. WHEN l'Enseignant accède au System sur mobile (< 768px), THE System SHALL afficher un menu burger pour la navigation
2. WHEN l'Enseignant ouvre le menu burger, THE System SHALL afficher la sidebar en overlay
3. WHEN l'Enseignant consulte un tableau sur mobile, THE System SHALL adapter l'affichage en cartes empilées
4. WHEN l'Enseignant utilise une tablette (768px - 1024px), THE System SHALL adapter la grille de statistiques en 2 colonnes
5. WHEN l'Enseignant remplit un formulaire sur mobile, THE System SHALL adapter les champs pour une saisie tactile optimale

### Requirement 10: Optimisation des Performances

**User Story:** En tant qu'utilisateur, je veux une application rapide et fluide, afin d'avoir une expérience agréable.

#### Acceptance Criteria

1. WHEN l'Enseignant navigue entre les pages, THE System SHALL charger les modules de manière différée (lazy loading)
2. WHEN l'Enseignant consulte une liste de plus de 20 quiz, THE System SHALL paginer les résultats par 20 éléments
3. WHEN l'Enseignant charge des données déjà consultées, THE System SHALL utiliser le cache pour réduire les appels réseau
4. WHEN l'Enseignant charge des images, THE System SHALL optimiser leur taille et format
5. WHEN l'Enseignant effectue une recherche, THE System SHALL debouncer les appels API (300ms minimum)

### Requirement 11: Feedback Visuel et UX

**User Story:** En tant qu'utilisateur, je veux des retours visuels clairs sur mes actions, afin de comprendre l'état du système.

#### Acceptance Criteria

1. WHEN l'Enseignant effectue une action réussie, THE System SHALL afficher un toast de succès pendant 3 secondes
2. WHEN l'Enseignant effectue une action échouée, THE System SHALL afficher un snackbar d'erreur avec le message explicite
3. WHEN l'Enseignant attend un chargement, THE System SHALL afficher un spinner ou une barre de progression
4. WHEN l'Enseignant navigue entre les pages, THE System SHALL animer les transitions avec fade-in/fade-out
5. WHEN l'Enseignant survole un bouton, THE System SHALL afficher un effet hover avec changement de couleur

### Requirement 12: États de Chargement

**User Story:** En tant qu'utilisateur, je veux savoir quand le système traite mes demandes, afin de ne pas répéter mes actions.

#### Acceptance Criteria

1. WHEN l'Enseignant soumet un formulaire, THE System SHALL désactiver le bouton de soumission et afficher un spinner
2. WHEN l'Enseignant charge une liste, THE System SHALL afficher un skeleton loader pendant le chargement
3. WHEN l'Enseignant exporte des données, THE System SHALL afficher une barre de progression avec pourcentage
4. WHEN l'Enseignant attend une réponse API, THE System SHALL afficher un indicateur de chargement global
5. WHEN le chargement dépasse 5 secondes, THE System SHALL afficher un message "Cela prend plus de temps que prévu"

### Requirement 13: Messages d'Erreur Clairs

**User Story:** En tant qu'utilisateur, je veux comprendre les erreurs qui se produisent, afin de les corriger facilement.

#### Acceptance Criteria

1. WHEN une erreur de validation se produit, THE System SHALL afficher le message sous le champ concerné en rouge
2. WHEN une erreur réseau se produit, THE System SHALL afficher "Erreur de connexion. Vérifiez votre connexion internet."
3. WHEN une erreur serveur se produit, THE System SHALL afficher "Une erreur est survenue. Veuillez réessayer."
4. WHEN un champ obligatoire est vide, THE System SHALL afficher "Ce champ est requis"
5. WHEN un format est invalide, THE System SHALL afficher "Format invalide. Exemple: [format attendu]"

### Requirement 14: Animations de Transition

**User Story:** En tant qu'utilisateur, je veux des transitions fluides, afin d'avoir une expérience visuelle agréable.

#### Acceptance Criteria

1. WHEN l'Enseignant ouvre une modale, THE System SHALL animer l'apparition avec fade-in et scale
2. WHEN l'Enseignant ferme une modale, THE System SHALL animer la disparition avec fade-out
3. WHEN l'Enseignant ajoute un élément à une liste, THE System SHALL animer l'insertion avec slide-in
4. WHEN l'Enseignant supprime un élément, THE System SHALL animer la suppression avec slide-out
5. WHEN l'Enseignant change de page, THE System SHALL animer la transition avec fade entre les vues
