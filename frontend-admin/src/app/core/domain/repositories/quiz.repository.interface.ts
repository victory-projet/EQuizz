// src/app/core/domain/repositories/quiz.repository.interface.ts
import { Observable } from 'rxjs';
import { Quiz, Question, QuizSubmission } from '../entities/quiz.entity';

/**
 * Repository Interface - Quiz
 */
export abstract class IQuizRepository {
  abstract getAll(): Observable<Quiz[]>;
  abstract getById(id: string): Observable<Quiz>;
  abstract getByClass(classId: string): Observable<Quiz[]>;
  abstract getByStatus(status: string): Observable<Quiz[]>;
  abstract create(quiz: Quiz): Observable<Quiz>;
  abstract update(id: string, quiz: Partial<Quiz>): Observable<Quiz>;
  abstract delete(id: string): Observable<void>;
  abstract publish(id: string): Observable<Quiz>;
  abstract close(id: string): Observable<Quiz>;
  abstract addQuestion(quizId: string, question: Question): Observable<Question>;
  abstract removeQuestion(quizId: string, questionId: string): Observable<void>;
  abstract updateQuestion(quizId: string, questionId: string, question: Partial<Question>): Observable<Question>;
}

/**
 * Repository Interface - Quiz Submission
 */
export abstract class IQuizSubmissionRepository {
  abstract getByQuiz(quizId: string): Observable<QuizSubmission[]>;
  abstract getByStudent(studentId: string): Observable<QuizSubmission[]>;
  abstract getById(id: string): Observable<QuizSubmission>;
  abstract submit(submission: QuizSubmission): Observable<QuizSubmission>;
  abstract getStatistics(quizId: string): Observable<QuizStatistics>;
}

export interface QuizStatistics {
  totalSubmissions: number;
  averageScore: number;
  passRate: number;
  completionRate: number;
}
