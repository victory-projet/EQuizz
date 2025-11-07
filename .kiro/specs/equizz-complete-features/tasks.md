# Implementation Plan - EQuizz Complete Features

## Phase 1: Quiz CRUD Complet

- [x] 1. Étendre le modèle Quiz et créer le modèle Question




  - Mettre à jour l'interface Quiz dans `shared/interfaces/quiz.interface.ts`
  - Créer l'interface Question avec les types (multiple, close, open)
  - Créer l'interface QuestionOption pour les options de QCM
  - _Requirements: 1.1, 1.2, 3.1, 3.2, 3.3_








- [ ] 2. Créer le composant Question Editor
  - [ ] 2.1 Créer le composant `question-editor` avec formulaire dynamique
    - Implémenter le formulaire réactif avec FormBuilder
    - Gérer les 3 types de questions (multiple, close, open)


    - Ajouter la validation des champs
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [ ] 2.2 Implémenter la logique pour les questions QCM
    - Ajouter/supprimer des options (min 2, max 6)


    - Sélectionner la bonne réponse
    - Valider qu'au moins 2 options sont présentes
    - _Requirements: 3.1_
  


  - [ ] 2.3 Implémenter la logique pour les questions fermées
    - Champ texte pour la question
    - Champ pour la réponse attendue




    - _Requirements: 3.2_

  
  - [ ] 2.4 Implémenter la logique pour les questions ouvertes
    - Champ texte multiligne pour la question

    - Pas de réponse attendue
    - _Requirements: 3.3_

- [ ] 3. Améliorer le composant Quiz Editor
  - [x] 3.1 Ajouter la gestion de la liste de questions

    - Afficher la liste des questions avec leur type
    - Bouton "Ajouter une question" avec sélection du type
    - Intégrer le composant question-editor pour chaque question
    - _Requirements: 1.2, 1.4_
  

  - [ ] 3.2 Implémenter le drag & drop pour réordonner les questions
    - Utiliser Angular CDK Drag & Drop
    - Mettre à jour l'ordre des questions




    - Afficher un indicateur visuel pendant le drag
    - _Requirements: 3.5_
  
  - [x] 3.3 Ajouter la validation du formulaire complet

    - Valider que le quiz a au moins une question
    - Valider tous les champs obligatoires
    - Afficher les erreurs de validation
    - _Requirements: 1.3_
  
  - [ ] 3.4 Implémenter la sauvegarde du quiz avec questions
    - Appeler le service pour créer/mettre à jour le quiz
    - Sauvegarder toutes les questions associées
    - Afficher un toast de succès/erreur
    - _Requirements: 1.3, 11.1, 11.2_

- [ ] 4. Créer le composant Quiz Preview
  - [ ] 4.1 Créer le composant modal de prévisualisation
    - Afficher le quiz en mode lecture seule
    - Afficher les questions une par une
    - Navigation suivant/précédent
    - _Requirements: 1.5_
  
  - [ ] 4.2 Implémenter l'affichage des différents types de questions
    - QCM: afficher les options comme des radio buttons
    - Fermée: afficher un champ texte désactivé
    - Ouverte: afficher une zone de texte désactivée
    - _Requirements: 1.5_

- [ ] 5. Étendre le Quiz Service
  - [ ] 5.1 Ajouter les méthodes CRUD pour les questions
    - `addQuestion(quizId, question)`
    - `updateQuestion(questionId, updates)`
    - `deleteQuestion(questionId)`
    - `reorderQuestions(quizId, questionIds)`
    - _Requirements: 1.2, 1.4, 3.5_
  
  - [ ] 5.2 Implémenter les méthodes de publication
    - `publishQuiz(id)` - changer le statut à "active"


    - `unpublishQuiz(id)` - changer le statut à "draft"
    - Valider que le quiz a des questions avant publication
    - _Requirements: 2.1, 2.2_

## Phase 2: UX/UI Améliorations

- [x] 6. Créer le Toast Service et Component





  - [ ] 6.1 Créer le service Toast
    - Méthodes success, error, warning, info
    - Gestion de la file d'attente des toasts
    - Configuration de la durée d'affichage


    - _Requirements: 11.1, 11.2_
  
  - [ ] 6.2 Créer le composant Toast
    - Template avec icône et message



    - Styles pour les 4 types
    - Animation d'entrée/sortie
    - Position top-right
    - _Requirements: 11.1, 11.2, 14.1, 14.2_

- [ ] 7. Créer le Confirm Dialog Component
  - [ ] 7.1 Créer le composant de dialogue de confirmation
    - Template avec titre, message, boutons
    - Utiliser MatDialog d'Angular Material
    - Émettre les événements confirmed/cancelled




    - _Requirements: 2.3, 2.4, 2.5_
  
  - [ ] 7.2 Intégrer le dialogue dans les actions de suppression
    - Afficher le dialogue avant suppression de quiz
    - Afficher le dialogue avant suppression de question
    - Afficher le titre de l'élément à supprimer
    - _Requirements: 2.3, 2.4_

- [ ] 8. Implémenter les états de chargement
  - [ ] 8.1 Créer le composant Loading Skeleton
    - Template avec lignes animées
    - Styles pour simuler le contenu
    - Utilisation dans les listes
    - _Requirements: 12.2_
  
  - [ ] 8.2 Ajouter les spinners aux boutons d'action
    - Désactiver le bouton pendant le chargement
    - Afficher un spinner dans le bouton
    - Réactiver après succès/erreur
    - _Requirements: 12.1_
  
  - [ ] 8.3 Ajouter les barres de progression pour les exports
    - Afficher le pourcentage de progression
    - Utiliser MatProgressBar
    - _Requirements: 12.3, 5.5_

- [ ] 9. Ajouter les animations de transition
  - [ ] 9.1 Créer les animations Angular
    - fadeIn/fadeOut pour les transitions de page
    - slideIn/slideOut pour les listes
    - scaleIn pour les modales
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_
  
  - [ ] 9.2 Appliquer les animations aux composants
    - Animer l'ouverture/fermeture des modales
    - Animer l'ajout/suppression d'éléments de liste
    - Animer les transitions de page
    - _Requirements: 14.1, 14.2, 14.3, 14.4_

- [ ] 10. Améliorer la gestion des erreurs
  - [ ] 10.1 Créer un intercepteur HTTP pour les erreurs
    - Intercepter toutes les erreurs HTTP
    - Afficher des messages d'erreur clairs
    - Gérer les erreurs réseau, 404, 500, etc.
    - _Requirements: 13.2, 13.3_
  
  - [ ] 10.2 Ajouter les messages de validation aux formulaires
    - Messages personnalisés par type d'erreur
    - Affichage sous les champs en erreur
    - Style rouge pour les erreurs
    - _Requirements: 13.1, 13.4, 13.5_

## Phase 3: Analytics et Export

- [ ] 11. Créer le module Analytics complet
  - [ ] 11.1 Créer le service Analytics
    - `getPerformanceByUE()`
    - `getParticipationByClass()`
    - `getSuccessRateByClass()`
    - `getQuizDetails(quizId)`
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  
  - [ ] 11.2 Créer le composant Performance Chart
    - Graphique en barres avec Chart.js
    - Afficher la performance par UE
    - Filtrage par période
    - _Requirements: 4.1_
  
  - [ ] 11.3 Créer le composant Participation Stats
    - Graphique circulaire ou en barres
    - Afficher le taux de participation par classe




    - Légende avec pourcentages
    - _Requirements: 4.2_
  


  - [ ] 11.4 Créer le composant Success Rate Chart
    - Graphique en ligne pour l'évolution
    - Afficher le taux de réussite par classe
    - Comparaison entre classes

    - _Requirements: 4.3_

- [ ] 12. Implémenter l'export PDF et Excel
  - [ ] 12.1 Créer le service Export
    - Méthode `exportToPDF(data, filename)`
    - Méthode `exportToExcel(data, filename)`
    - Méthode `downloadFile(blob, filename)`
    - _Requirements: 5.1, 5.2, 5.3_
  



  - [ ] 12.2 Implémenter l'export PDF avec jsPDF
    - Installer jsPDF et jsPDF-AutoTable
    - Générer un PDF avec les statistiques
    - Inclure les graphiques comme images
    - _Requirements: 5.1_


  
  - [ ] 12.3 Implémenter l'export Excel avec xlsx
    - Installer la bibliothèque xlsx
    - Générer un fichier XLSX avec les données
    - Formater les colonnes et les en-têtes
    - _Requirements: 5.2_
  
  - [ ] 12.4 Ajouter les boutons d'export dans Analytics
    - Bouton "Exporter en PDF"
    - Bouton "Exporter en Excel"
    - Afficher la progression de l'export
    - _Requirements: 5.1, 5.2, 5.3, 5.5_

## Phase 4: Gestion UE et Classes

- [ ] 13. Créer le module UE Management
  - [ ] 13.1 Créer le service UE
    - CRUD complet pour les UE
    - Validation avant suppression (vérifier les quiz associés)
    - _Requirements: 6.1, 6.3, 6.5_
  
  - [ ] 13.2 Créer le composant UE List
    - Afficher la liste des UE
    - Barre de recherche
    - Boutons d'action (Éditer, Supprimer)
    - _Requirements: 6.1_
  
  - [ ] 13.3 Créer le composant UE Form
    - Formulaire avec nom, code, description, crédits
    - Validation des champs
    - Mode création et édition
    - _Requirements: 6.2, 6.3, 6.4_

- [ ] 14. Créer le module Class Management
  - [ ] 14.1 Créer le service Class
    - CRUD complet pour les classes
    - Méthodes pour l'assignation des étudiants
    - Validation avant suppression
    - _Requirements: 7.1, 7.3, 7.5, 8.2, 8.3, 8.4_
  
  - [ ] 14.2 Créer le composant Class List
    - Afficher la liste des classes
    - Barre de recherche
    - Boutons d'action
    - _Requirements: 7.1_
  
  - [ ] 14.3 Créer le composant Class Form
    - Formulaire avec nom, niveau, année académique
    - Validation des champs
    - Mode création et édition
    - _Requirements: 7.2, 7.3, 7.4_
  
  - [ ] 14.4 Créer le composant Student Assignment
    - Liste des étudiants assignés
    - Sélection multiple pour ajouter des étudiants
    - Bouton pour retirer un étudiant
    - Confirmation avant retrait
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

## Phase 5: Performance Optimizations

- [ ] 15. Implémenter le Lazy Loading
  - [ ] 15.1 Configurer les routes avec loadComponent
    - Convertir toutes les routes en lazy loading
    - Tester le chargement différé
    - _Requirements: 10.1_
  
  - [ ] 15.2 Optimiser les imports des modules
    - Éviter les imports inutiles
    - Utiliser les imports standalone
    - _Requirements: 10.1_

- [ ] 16. Ajouter la pagination
  - [ ] 16.1 Créer le composant Pagination
    - Navigation page par page
    - Affichage du total d'items
    - Sélection du nombre d'items par page
    - _Requirements: 10.2_
  
  - [ ] 16.2 Intégrer la pagination dans les listes
    - Quiz list
    - UE list
    - Class list
    - _Requirements: 10.2_

- [ ] 17. Implémenter le cache
  - [ ] 17.1 Créer le service Cache
    - Méthodes set, get, has, delete, clear
    - Gestion du TTL (Time To Live)
    - Vérification de l'expiration
    - _Requirements: 10.3_
  
  - [ ] 17.2 Intégrer le cache dans les services
    - Cacher les résultats des appels API
    - Invalider le cache lors des CRUD
    - _Requirements: 10.3_

- [ ] 18. Optimiser les images
  - [ ] 18.1 Créer la directive Lazy Load Image
    - Utiliser IntersectionObserver
    - Charger l'image uniquement quand visible
    - _Requirements: 10.4_
  
  - [ ] 18.2 Ajouter le debounce sur la recherche
    - Utiliser debounceTime(300ms)
    - Éviter les appels API inutiles
    - _Requirements: 10.5_

## Phase 6: Responsive Design

- [ ] 19. Créer le menu mobile
  - [ ] 19.1 Créer le composant Mobile Menu
    - Menu burger visible < 768px
    - Sidebar en overlay avec backdrop
    - Animation slide-in/slide-out
    - _Requirements: 9.1, 9.2_
  
  - [ ] 19.2 Adapter la sidebar pour mobile
    - Masquer la sidebar desktop sur mobile
    - Afficher le menu burger
    - Fermer au clic sur backdrop ou item
    - _Requirements: 9.1, 9.2_

- [ ] 20. Adapter les composants pour mobile et tablette
  - [ ] 20.1 Adapter les grilles de statistiques
    - Desktop: 4 colonnes
    - Tablet: 2 colonnes
    - Mobile: 1 colonne
    - _Requirements: 9.4_
  
  - [ ] 20.2 Adapter les tableaux en cartes sur mobile
    - Transformer les tableaux en cartes empilées
    - Afficher les informations essentielles
    - _Requirements: 9.3_
  
  - [ ] 20.3 Adapter les formulaires pour mobile
    - Champs en pleine largeur
    - Espacement optimisé pour le tactile
    - Clavier adapté (email, number, etc.)
    - _Requirements: 9.5_
  
  - [ ] 20.4 Tester sur différentes tailles d'écran
    - Mobile (< 768px)
    - Tablet (768px - 1024px)
    - Desktop (> 1024px)
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
