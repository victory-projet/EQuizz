// src/app/shared/interfaces/analytics.interface.ts
export interface DashboardStats {
  activeStudents: { value: number; trend: number };
  courses: { value: number; trend: number };
  publishedQuizzes: { value: number; trend: number };
  ongoingEvaluations: { value: number; trend: number };
}

export interface ParticipationData {
  achieved: number;
  target: number;
  finSemester: number;
  finParcours: number;
}

export interface EvaluationDistribution {
  completed: number;
  onHold: number;
  inProgress: number;
  pending: number;
}

export interface Alert {
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  icon: string;
}

export interface Activity {
  type: string;
  title: string;
  time: string;
}
