export interface Quiz {
  id: string;
  title: string;
  description?: string;
  courseId: string;
  classId: string;
  teacherId: string;
  academicYearId: string;
  duration: number; // in minutes
  totalPoints: number;
  passingScore: number;
  startDate?: Date;
  endDate?: Date;
  allowLateSubmission: boolean;
  shuffleQuestions: boolean;
  showResults: boolean;
  maxAttempts: number;
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'published' | 'archived' | 'scheduled';
  questions?: Question[];
}

export interface Question {
  id: string;
  quizId: string;
  text: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  points: number;
  order: number;
  explanation?: string;
  imageUrl?: string;
  required: boolean;
  options?: QuestionOption[];
}

export interface QuestionOption {
  id: string;
  questionId: string;
  text: string;
  isCorrect: boolean;
  order: number;
  explanation?: string;
}

export interface AcademicYear {
  id: string;
  name: string;
  code: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  isCurrent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuizResult {
  id: string;
  quizId: string;
  studentId: string;
  attemptNumber: number;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  startedAt: Date;
  completedAt: Date;
  timeSpent: number; // in seconds
  answers: number; // total answers
  correctAnswers: number;
  incorrectAnswers: number;
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
