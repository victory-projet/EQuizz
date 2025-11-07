export interface AnalyticsOverview {
  totalQuizzes: number;
  totalStudents: number;
  totalAttempts: number;
  averageScore: number;
  completionRate: number;
  activeUsers: number;
}

export interface QuizAnalytics {
  quizId: string;
  quizTitle: string;
  totalAttempts: number;
  averageScore: number;
  completionRate: number;
  averageTime: number;
  passRate: number;
  questionStats: QuestionStats[];
}

export interface QuestionStats {
  questionId: string;
  questionText: string;
  totalAnswers: number;
  correctAnswers: number;
  incorrectAnswers: number;
  successRate: number;
  averageTime: number;
}

export interface StudentPerformance {
  studentId: string;
  studentName: string;
  totalQuizzes: number;
  completedQuizzes: number;
  averageScore: number;
  totalTime: number;
  strongSubjects: string[];
  weakSubjects: string[];
  recentActivity: ActivityLog[];
}

export interface ActivityLog {
  id: string;
  type: 'quiz_started' | 'quiz_completed' | 'quiz_created' | 'student_joined';
  description: string;
  userId: string;
  userName: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface TimeSeriesData {
  date: Date;
  value: number;
  label?: string;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

export interface SubjectAnalytics {
  subjectId: string;
  subjectName: string;
  totalQuizzes: number;
  averageScore: number;
  participationRate: number;
  topPerformers: StudentSummary[];
  needsAttention: StudentSummary[];
}

export interface StudentSummary {
  id: string;
  name: string;
  score: number;
  quizzesCompleted: number;
}

export interface ComparisonData {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
}
