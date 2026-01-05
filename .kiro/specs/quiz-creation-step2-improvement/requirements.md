# Requirements Document

## Introduction

Cette spécification définit l'amélioration de l'étape 2 de création d'un quiz dans l'application EQuizz. L'objectif est de fournir deux options distinctes et claires : création manuelle de questions et import Excel, avec une interface dédiée pour la création manuelle qui reste dans le contexte sans références externes.

## Glossary

- **Quiz_System**: Le système de gestion des évaluations EQuizz
- **Creation_Step2**: La deuxième étape du processus de création d'un quiz
- **Manual_Creation_Interface**: L'interface permettant de créer manuellement les questions
- **Excel_Import_Option**: L'option permettant d'importer des questions depuis un fichier Excel
- **Question_Context**: Le contexte spécifique à la création de questions sans références externes

## Requirements

### Requirement 1

**User Story:** En tant qu'enseignant, je veux avoir deux options claires à l'étape 2 de création d'un quiz, afin de choisir entre création manuelle et import Excel.

#### Acceptance Criteria

1. WHEN a user reaches step 2 of quiz creation, THE Quiz_System SHALL display two distinct options: manual creation and Excel import
2. WHEN a user selects manual creation option, THE Quiz_System SHALL navigate to the manual creation interface
3. WHEN a user selects Excel import option, THE Quiz_System SHALL navigate to the Excel import interface
4. THE Quiz_System SHALL provide clear visual distinction between the two options
5. THE Quiz_System SHALL maintain the current step indicator showing step 2

### Requirement 2

**User Story:** En tant qu'enseignant, je veux une interface de création manuelle dédiée, afin de créer mes questions directement sans distractions.

#### Acceptance Criteria

1. WHEN a user accesses the manual creation interface, THE Quiz_System SHALL display a clean interface focused solely on question creation
2. THE Quiz_System SHALL provide input fields for question text, answer options, and correct answer selection
3. THE Quiz_System SHALL allow adding multiple questions sequentially
4. THE Quiz_System SHALL provide question type selection (multiple choice, true/false, etc.)
5. WHEN a user creates a question, THE Quiz_System SHALL validate the question data before saving

### Requirement 3

**User Story:** En tant qu'enseignant, je veux que l'interface de création manuelle reste dans le contexte, afin de ne pas être distrait par des références à d'autres fonctionnalités.

#### Acceptance Criteria

1. THE Manual_Creation_Interface SHALL contain only elements related to question creation
2. THE Manual_Creation_Interface SHALL NOT display references to other system features
3. THE Manual_Creation_Interface SHALL NOT include navigation to unrelated sections
4. WHEN displaying the interface, THE Quiz_System SHALL maintain focus on the current question being created
5. THE Quiz_System SHALL provide contextual help specific to question creation only

### Requirement 4

**User Story:** En tant qu'enseignant, je veux pouvoir gérer mes questions pendant la création manuelle, afin de modifier ou supprimer des questions avant de finaliser.

#### Acceptance Criteria

1. THE Quiz_System SHALL display a list of created questions during manual creation
2. WHEN a user selects an existing question, THE Quiz_System SHALL allow editing the question details
3. THE Quiz_System SHALL provide a delete option for each created question
4. WHEN a user modifies a question, THE Quiz_System SHALL update the question immediately
5. THE Quiz_System SHALL maintain question order and allow reordering if needed

### Requirement 5

**User Story:** En tant qu'enseignant, je veux naviguer facilement dans l'interface de création manuelle, afin de créer efficacement mes questions.

#### Acceptance Criteria

1. THE Quiz_System SHALL provide clear navigation buttons (Previous, Next, Save, Cancel)
2. WHEN a user clicks Previous, THE Quiz_System SHALL return to step 1 of quiz creation
3. WHEN a user clicks Next with valid questions, THE Quiz_System SHALL proceed to step 3
4. WHEN a user clicks Save, THE Quiz_System SHALL save the current progress
5. THE Quiz_System SHALL prevent navigation to next step if no questions are created