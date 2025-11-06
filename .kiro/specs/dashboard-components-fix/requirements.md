# Requirements Document

## Introduction

This feature addresses the missing Angular components causing compilation errors in the EQIZZ dashboard application and implements a comprehensive dashboard design based on provided reference examples. The system needs modal components for quiz management operations (preview, edit, publish, delete), a sidebar navigation component, and an improved dashboard layout that presents statistics, charts, alerts, and recent activities in a professional, user-friendly interface.

## Glossary

- **Dashboard Component**: The main view component that displays an overview of the quiz evaluation system
- **Modal Service**: Angular service that manages the opening and closing of dialog components
- **Sidebar Component**: Navigation component that provides access to different sections of the application
- **Quiz Entity**: A quiz object containing questions, participation data, status, and metadata
- **Participation Rate**: The percentage of students who have completed a quiz out of the total enrolled
- **UE (Unité d'Enseignement)**: A course or teaching unit in the academic system

## Requirements

### Requirement 1

**User Story:** As a teacher, I want to preview a quiz before publishing it, so that I can verify the questions and settings are correct

#### Acceptance Criteria

1. WHEN the teacher clicks the preview button on a quiz card, THE Dashboard Component SHALL open the preview modal with the quiz data
2. THE Preview Modal Component SHALL display all quiz questions, answers, and configuration settings in read-only format
3. THE Preview Modal Component SHALL provide a close button that dismisses the modal without making changes
4. THE Preview Modal Component SHALL have a width of 900 pixels and a maximum width of 95% of the viewport width
5. THE Preview Modal Component SHALL have a height of 80% of the viewport height

### Requirement 2

**User Story:** As a teacher, I want to edit quiz details and questions, so that I can update content before or after publishing

#### Acceptance Criteria

1. WHEN the teacher clicks the edit button on a quiz card, THE Dashboard Component SHALL open the edit modal with the quiz data
2. THE Edit Modal Component SHALL display editable form fields for quiz title, UE, type, end date, and classes
3. THE Edit Modal Component SHALL provide save and cancel buttons
4. WHEN the teacher clicks save, THE Edit Modal Component SHALL return the updated quiz data to the calling component
5. THE Edit Modal Component SHALL have a width of 800 pixels and a maximum width of 95% of the viewport width

### Requirement 3

**User Story:** As a teacher, I want to publish a draft quiz, so that students can access and complete the evaluation

#### Acceptance Criteria

1. WHEN the teacher clicks the publish button on a draft quiz, THE Dashboard Component SHALL open the publish confirmation modal
2. THE Publish Modal Component SHALL display quiz details and request confirmation before publishing
3. THE Publish Modal Component SHALL provide confirm and cancel buttons
4. WHEN the teacher confirms, THE Publish Modal Component SHALL return a confirmation signal to update the quiz status
5. THE Publish Modal Component SHALL have a width of 500 pixels

### Requirement 4

**User Story:** As a teacher, I want to delete a quiz, so that I can remove outdated or incorrect evaluations

#### Acceptance Criteria

1. WHEN the teacher clicks the delete button on a quiz card, THE Dashboard Component SHALL open the delete confirmation modal
2. THE Delete Modal Component SHALL display a warning message with the quiz title
3. THE Delete Modal Component SHALL provide confirm and cancel buttons with distinct visual styling
4. WHEN the teacher confirms deletion, THE Delete Modal Component SHALL return a confirmation signal to remove the quiz
5. THE Delete Modal Component SHALL have a width of 450 pixels

### Requirement 5

**User Story:** As a user, I want to navigate between different sections of the application using a sidebar, so that I can access all features efficiently

#### Acceptance Criteria

1. THE Sidebar Component SHALL display the application logo and name at the top
2. THE Sidebar Component SHALL provide navigation links for Dashboard, Evaluation, Cours & UE, Classes, Année académique, Rapport, and Paramètres
3. WHEN a user clicks a navigation link, THE Sidebar Component SHALL highlight the active section with a distinct background color and left border
4. THE Sidebar Component SHALL display icons next to each navigation label for visual clarity
5. THE Sidebar Component SHALL provide a logout option at the bottom of the sidebar

### Requirement 6

**User Story:** As a teacher, I want to see key statistics on the dashboard, so that I can quickly understand the current state of evaluations

#### Acceptance Criteria

1. THE Dashboard Component SHALL display four stat cards showing active students, courses, published quizzes, and ongoing evaluations
2. EACH stat card SHALL display a title, a numeric value, and a percentage change indicator
3. THE Dashboard Component SHALL use a grid layout with four equal columns for the stat cards
4. EACH stat card SHALL have a white background, rounded corners, and subtle shadow for visual separation
5. THE percentage change indicator SHALL use green color for positive changes

### Requirement 7

**User Story:** As a teacher, I want to see a visual representation of evaluation distribution, so that I can understand the breakdown of quiz statuses

#### Acceptance Criteria

1. THE Dashboard Component SHALL display a donut chart showing the distribution of evaluations by status
2. THE donut chart SHALL use distinct colors for each status category (completed, on hold, in progress, pending)
3. THE Dashboard Component SHALL display a legend below the donut chart with color indicators and labels
4. THE chart card SHALL have a title "Répartition des évaluations"
5. THE chart SHALL display percentage values for each segment

### Requirement 8

**User Story:** As a teacher, I want to see participation trends over time, so that I can monitor student engagement

#### Acceptance Criteria

1. THE Dashboard Component SHALL display a line chart showing participation rates over multiple weeks
2. THE line chart SHALL display multiple data series for different evaluation types
3. THE Dashboard Component SHALL provide a year selector dropdown above the chart
4. THE chart SHALL include labeled X-axis (weeks) and Y-axis (percentage values from 0 to 100)
5. THE chart SHALL display a legend identifying each data series

### Requirement 9

**User Story:** As a teacher, I want to see alerts and important notifications, so that I can respond to urgent issues

#### Acceptance Criteria

1. THE Dashboard Component SHALL display an alerts panel with a list of important notifications
2. EACH alert item SHALL display a title, detailed description, and an action button
3. THE alerts panel SHALL show at least three types of alerts: overdue reports, low participation warnings, and deadline reminders
4. THE alerts panel SHALL have a title "Alertes & Suivi"
5. EACH alert item SHALL be separated by a border for visual clarity

### Requirement 10

**User Story:** As a teacher, I want to see recent activities, so that I can stay informed about new quizzes and system events

#### Acceptance Criteria

1. THE Dashboard Component SHALL display a recent activities panel with a list of recent events
2. EACH activity item SHALL display an icon, title, details, and timestamp
3. THE activities panel SHALL provide a "Voir plus" link to view all activities
4. THE activities panel SHALL highlight new quiz publications with a distinct background color
5. THE activities panel SHALL display relative timestamps (e.g., "Il y a 2 heures")
