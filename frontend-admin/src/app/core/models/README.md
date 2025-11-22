# Domain Models Documentation

Ce dossier contient toutes les interfaces et types TypeScript qui définissent les modèles de domaine de l'application EQuizz.

## Structure des Modèles

### Entités Principales

#### 1. **Quiz** (`quiz.interface.ts`)
Représente un quiz/évaluation créé par un enseignant.

**Attributs principaux:**
- `id`: Identifiant unique
- `title`: Titre du quiz
- `courseId`: Référence au cours
- `classId`: Référence à la classe
- `teacherId`: Référence à l'enseignant créateur
- `duration`: Durée en minutes
- `totalPoints`: Points totaux
- `status`: État (draft, published, archived, scheduled)

#### 2. **Question** (`quiz.interface.ts`)
Représente une question dans un quiz.

**Types de questions:**
- `multiple_choice`: Choix multiples
- `true_false`: Vrai/Faux
- `short_answer`: Réponse courte
- `essay`: Dissertation

#### 3. **Class** (`class.interface.ts`)
Représente une classe d'étudiants.

**Attributs principaux:**
- `id`: Identifiant unique
- `name`: Nom de la classe
- `code`: Code unique
- `academicYearId`: Référence à l'année académique
- `capacity`: Capacité maximale
- `enrolledStudents`: Nombre d'étudiants inscrits

#### 4. **Course** (`course.interface.ts`)
Représente un cours/matière.

**Attributs principaux:**
- `id`: Identifiant unique
- `name`: Nom du cours
- `code`: Code du cours
- `credits`: Nombre de crédits
- `academicYearId`: Référence à l'année académique

#### 5. **Student** (`student.interface.ts`)
Représente un étudiant.

**Attributs principaux:**
- `id`: Identifiant unique
- `userId`: Référence au compte utilisateur
- `studentNumber`: Numéro d'étudiant
- `firstName`, `lastName`: Nom complet
- `status`: État (active, inactive, graduated, suspended)

#### 6. **Teacher** (`teacher.interface.ts`)
Représente un enseignant.

**Attributs principaux:**
- `id`: Identifiant unique
- `userId`: Référence au compte utilisateur
- `employeeNumber`: Numéro d'employé
- `specialization`: Spécialisation
- `status`: État (active, inactive, on_leave)

#### 7. **Answer** (`answer.interface.ts`)
Représente une réponse d'étudiant à une question.

**Attributs principaux:**
- `id`: Identifiant unique
- `questionId`: Référence à la question
- `studentId`: Référence à l'étudiant
- `quizAttemptId`: Référence à la tentative
- `isCorrect`: Réponse correcte ou non
- `pointsEarned`: Points obtenus

#### 8. **QuizAttempt** (`answer.interface.ts`)
Représente une tentative de quiz par un étudiant.

**Attributs principaux:**
- `id`: Identifiant unique
- `quizId`: Référence au quiz
- `studentId`: Référence à l'étudiant
- `score`: Score obtenu
- `timeSpent`: Temps passé en secondes
- `status`: État (in_progress, completed, abandoned)

### Relations

```
AcademicYear (1) ----< (N) Class
AcademicYear (1) ----< (N) Course
AcademicYear (1) ----< (N) Quiz

Course (1) ----< (N) Quiz
Class (1) ----< (N) Quiz

Teacher (1) ----< (N) Quiz
Teacher (1) ----< (N) Class (via ClassTeacher)

Student (N) ----< (N) Class (via ClassStudent)
Student (1) ----< (N) QuizAttempt
Student (1) ----< (N) Answer

Quiz (1) ----< (N) Question
Quiz (1) ----< (N) QuizAttempt
Quiz (1) ----< (N) QuizResult

Question (1) ----< (N) QuestionOption
Question (1) ----< (N) Answer

QuizAttempt (1) ----< (N) Answer
```

## Énumérations (`enums.ts`)

Contient toutes les énumérations utilisées dans les modèles:
- `QuizStatus`: États d'un quiz
- `QuestionType`: Types de questions
- `UserRole`: Rôles utilisateur
- `StudentStatus`: États d'un étudiant
- `TeacherStatus`: États d'un enseignant
- `QuizAttemptStatus`: États d'une tentative
- `AlertType`: Types d'alertes
- `ActivityType`: Types d'activités

## Utilisation

```typescript
import { Quiz, Question, QuizStatus } from '@core/models';
import { QuestionType } from '@core/models/enums';

const quiz: Quiz = {
  id: '1',
  title: 'Quiz de mathématiques',
  courseId: 'math-101',
  classId: 'class-a',
  teacherId: 'teacher-1',
  status: QuizStatus.PUBLISHED,
  // ... autres attributs
};
```

## Conventions

1. Tous les IDs sont de type `string`
2. Les dates utilisent le type `Date`
3. Les attributs optionnels sont marqués avec `?`
4. Les énumérations utilisent des valeurs en snake_case
5. Les interfaces étendues utilisent `extends`
