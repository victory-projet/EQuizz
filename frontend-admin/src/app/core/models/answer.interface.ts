// src/app/core/models/answer.interface.ts

export interface Answer {
  id: string;
  questionId: string;
  studentId: string;
  quizAttemptId: string;
  answerText?: string;
  selectedOptionId?: string;
  isCorrect: boolean;
  pointsEarned: number;
  answeredAt: Date;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  startedAt: Date;
  completedAt?: Date;
  submittedAt?: Date;
  score: number;
  maxScore: number;
  timeSpent: number; // in seconds
  status: 'in_progress' | 'completed' | 'abandoned';
  answers: Answer[];
}

export interface AnswerSubmission {
  questionId: string;
  answerText?: string;
  selectedOptionId?: string;
}
