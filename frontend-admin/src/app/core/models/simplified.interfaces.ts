/**
 * Interfaces Simplifiées - Modèle Métier Frontend
 * 
 * Ces interfaces représentent le modèle métier du frontend.
 * Elles sont converties depuis les interfaces Backend* via les mappers.
 * 
 * Conventions:
 * - Noms en anglais (name, firstName, etc.)
 * - Types TypeScript natifs (Date au lieu de string)
 * - Structure simplifiée et cohérente
 */

// ============================================
// UTILISATEUR
// ============================================

export interface SimpleUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  role: 'ADMIN' | 'ENSEIGNANT' | 'ETUDIANT';
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// ÉTUDIANT
// ============================================

export interface SimpleStudent {
  id: string;
  matricule: string;
  idCarte: string;
  firstName: string;
  lastName: string;
  email: string;
  classId: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// ENSEIGNANT
// ============================================

export interface SimpleTeacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  specialization: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// ADMINISTRATEUR
// ============================================

export interface SimpleAdministrator {
  id: string;
  profileUrl: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// ANNÉE ACADÉMIQUE
// ============================================

export interface SimpleAcademicYear {
  id: string;
  label: string;
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// SEMESTRE
// ============================================

export interface SimpleSemester {
  id: string;
  name: string;
  number: number;  // 1 ou 2
  startDate: Date;
  endDate: Date;
  academicYearId: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// CLASSE
// ============================================

export interface SimpleClass {
  id: string;
  name: string;
  level: string;
  academicYearId: string;
  schoolId: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// COURS
// ============================================

export interface SimpleCourse {
  id: string;
  code: string;
  name: string;
  isArchived: boolean;
  academicYearId: string;
  teacherId: string;
  semesterId: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// ÉCOLE
// ============================================

export interface SimpleSchool {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// ÉVALUATION
// ============================================

export interface SimpleEvaluation {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  publicationDate: Date;
  type: 'MI_PARCOURS' | 'FIN_SEMESTRE';
  status: 'BROUILLON' | 'PUBLIEE' | 'EN_COURS' | 'CLOTUREE';
  courseId: string;
  quizId: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// QUIZ
// ============================================

export interface SimpleQuiz {
  id: string;
  title: string;
  instructions: string;
  evaluationId: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// QUESTION
// ============================================

export interface SimpleQuestion {
  id: string;
  quizId: string;
  statement: string;
  type: 'CHOIX_MULTIPLE' | 'REPONSE_OUVERTE';
  options: any[];
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// SESSION RÉPONSE
// ============================================

export interface SimpleQuizSession {
  id: string;
  anonymousToken: string;
  status: 'EN_COURS' | 'TERMINE';
  startDate: Date;
  endDate: Date;
  evaluationId: string;
  studentId: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// RÉPONSE ÉTUDIANT
// ============================================

export interface SimpleStudentAnswer {
  id: string;
  content: string;
  questionId: string;
  sessionId: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// NOTIFICATION
// ============================================

export interface SimpleNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'NOUVELLE_EVALUATION' | 'RAPPEL_EVALUATION' | 'EVALUATION_BIENTOT_FERMEE';
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// DASHBOARD
// ============================================

export interface SimpleDashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalEvaluations: number;
  ongoingEvaluations: number;
  completedEvaluations: number;
}

export interface SimpleDashboard {
  statistics: SimpleDashboardStats;
  recentEvaluations: SimpleEvaluation[];
  recentActivities: any[];
}

// ============================================
// RAPPORT
// ============================================

export interface SimpleReportStats {
  totalParticipants: number;
  participationRate: number;
  averageScore: number;
  successRate: number;
}

export interface SimpleReport {
  evaluation: SimpleEvaluation;
  statistics: SimpleReportStats;
  answers: any[];
  analyses: any[];
}

