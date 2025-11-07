export interface Quiz {
  id: string;
  title: string;
  description?: string;
  academicYearId: string;
  subjectId: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'published' | 'archived';
  questions: Question[];
}

export interface Question {
  id: string;
  quizId: string;
  text: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  points: number;
  order: number;
  options?: QuestionOption[];
}

export interface QuestionOption {
  id: string;
  questionId: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

export interface AcademicYear {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  academicYearId: string;
}

export interface QuizResult {
  id: string;
  quizId: string;
  studentId: string;
  score: number;
  maxScore: number;
  completedAt: Date;
}

export interface AnalyticsData {
  totalQuizzes: number;
  activeQuizzes?: number;
  totalStudents: number;
  averageScore: number;
  completionRate?: number;
  participationRate?: number;
  recentActivities?: Activity[];
  alerts?: Alert[];
}

export interface Activity {
  id: string;
  type: string;
  message: string;
  timestamp: Date;
}

export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error';
  message: string;
  timestamp: Date;
}
