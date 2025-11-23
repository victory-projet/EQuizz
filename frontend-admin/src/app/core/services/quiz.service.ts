import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, tap, shareReplay } from 'rxjs/operators';

import { QuizRepository } from '../../infrastructure/repositories/quiz.repository';
import { 
  SimpleEvaluation, 
  SimpleQuiz, 
  SimpleQuestion, 
  SimpleQuizSession 
} from '../models/simplified.interfaces';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private evaluationsSubject = new BehaviorSubject<SimpleEvaluation[]>([]);
  public evaluations$ = this.evaluationsSubject.asObservable();

  constructor(private quizRepository: QuizRepository) {}

  // ============================================
  // ÉVALUATIONS
  // ============================================

  getEvaluations(): Observable<SimpleEvaluation[]> {
    return this.quizRepository.findAll().pipe(
      tap(evaluations => this.evaluationsSubject.next(evaluations)),
      shareReplay(1)
    );
  }

  getEvaluationById(id: string): Observable<SimpleEvaluation> {
    return this.quizRepository.findById(id);
  }

  getEvaluationsByCourse(courseId: string): Observable<SimpleEvaluation[]> {
    return this.quizRepository.findByCourse(courseId);
  }

  getEvaluationsByTeacher(teacherId: string): Observable<SimpleEvaluation[]> {
    return this.quizRepository.findByTeacher(teacherId);
  }

  getEvaluationsByStudent(studentId: string): Observable<SimpleEvaluation[]> {
    return this.quizRepository.findByStudent(studentId);
  }

  createEvaluation(data: Partial<SimpleEvaluation>): Observable<SimpleEvaluation> {
    return this.quizRepository.create(data).pipe(
      tap(() => this.refreshEvaluations())
    );
  }

  updateEvaluation(id: string, data: Partial<SimpleEvaluation>): Observable<SimpleEvaluation> {
    return this.quizRepository.update(id, data).pipe(
      tap(() => this.refreshEvaluations())
    );
  }

  deleteEvaluation(id: string): Observable<void> {
    return this.quizRepository.delete(id).pipe(
      tap(() => this.refreshEvaluations())
    );
  }

  publishEvaluation(id: string): Observable<SimpleEvaluation> {
    return this.quizRepository.publish(id).pipe(
      tap(() => this.refreshEvaluations())
    );
  }

  closeEvaluation(id: string): Observable<SimpleEvaluation> {
    return this.quizRepository.close(id).pipe(
      tap(() => this.refreshEvaluations())
    );
  }

  // ============================================
  // QUIZ
  // ============================================

  getQuizByEvaluation(evaluationId: string): Observable<SimpleQuiz> {
    return this.quizRepository.getQuizByEvaluation(evaluationId);
  }

  updateQuiz(evaluationId: string, data: Partial<SimpleQuiz>): Observable<SimpleQuiz> {
    return this.quizRepository.updateQuiz(evaluationId, data);
  }

  // ============================================
  // QUESTIONS
  // ============================================

  getQuestions(quizId: string): Observable<SimpleQuestion[]> {
    return this.quizRepository.getQuestions(quizId);
  }

  addQuestion(quizId: string, data: Partial<SimpleQuestion>): Observable<SimpleQuestion> {
    return this.quizRepository.addQuestion(quizId, data);
  }

  updateQuestion(questionId: string, data: Partial<SimpleQuestion>): Observable<SimpleQuestion> {
    return this.quizRepository.updateQuestion(questionId, data);
  }

  deleteQuestion(questionId: string): Observable<void> {
    return this.quizRepository.deleteQuestion(questionId);
  }

  // ============================================
  // SESSIONS
  // ============================================

  getEvaluationSessions(evaluationId: string): Observable<SimpleQuizSession[]> {
    return this.quizRepository.getEvaluationSessions(evaluationId);
  }

  getStudentSession(evaluationId: string, studentId: string): Observable<SimpleQuizSession> {
    return this.quizRepository.getStudentSession(evaluationId, studentId);
  }

  startSession(evaluationId: string, studentId: string): Observable<SimpleQuizSession> {
    return this.quizRepository.startSession(evaluationId, studentId);
  }

  submitSession(sessionId: string): Observable<SimpleQuizSession> {
    return this.quizRepository.submitSession(sessionId);
  }

  saveAnswer(sessionId: string, questionId: string, content: string): Observable<void> {
    return this.quizRepository.saveAnswer(sessionId, questionId, content);
  }

  // ============================================
  // DONNÉES COMBINÉES
  // ============================================

  getEvaluationWithQuiz(evaluationId: string): Observable<{
    evaluation: SimpleEvaluation;
    quiz: SimpleQuiz;
    questions: SimpleQuestion[];
  }> {
    return combineLatest([
      this.getEvaluationById(evaluationId),
      this.getQuizByEvaluation(evaluationId)
    ]).pipe(
      map(([evaluation, quiz]) => ({
        evaluation,
        quiz,
        questions: []
      }))
    );
  }

  getEvaluationWithSessions(evaluationId: string): Observable<{
    evaluation: SimpleEvaluation;
    sessions: SimpleQuizSession[];
  }> {
    return combineLatest([
      this.getEvaluationById(evaluationId),
      this.getEvaluationSessions(evaluationId)
    ]).pipe(
      map(([evaluation, sessions]) => ({
        evaluation,
        sessions
      }))
    );
  }

  // ============================================
  // STATISTIQUES
  // ============================================

  getEvaluationStats(evaluationId: string): Observable<{
    totalSessions: number;
    completedSessions: number;
    inProgressSessions: number;
    participationRate: number;
  }> {
    return this.getEvaluationSessions(evaluationId).pipe(
      map(sessions => {
        const totalSessions = sessions.length;
        const completedSessions = sessions.filter(s => s.status === 'TERMINE').length;
        const inProgressSessions = sessions.filter(s => s.status === 'EN_COURS').length;
        
        return {
          totalSessions,
          completedSessions,
          inProgressSessions,
          participationRate: totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0
        };
      })
    );
  }

  // ============================================
  // FILTRES ET RECHERCHE
  // ============================================

  filterEvaluationsByStatus(status: SimpleEvaluation['status']): Observable<SimpleEvaluation[]> {
    return this.evaluations$.pipe(
      map(evaluations => evaluations.filter(e => e.status === status))
    );
  }

  filterEvaluationsByType(type: SimpleEvaluation['type']): Observable<SimpleEvaluation[]> {
    return this.evaluations$.pipe(
      map(evaluations => evaluations.filter(e => e.type === type))
    );
  }

  searchEvaluations(query: string): Observable<SimpleEvaluation[]> {
    return this.evaluations$.pipe(
      map(evaluations => 
        evaluations.filter(e => 
          e.title.toLowerCase().includes(query.toLowerCase()) ||
          e.description.toLowerCase().includes(query.toLowerCase())
        )
      )
    );
  }

  // ============================================
  // MÉTHODES PRIVÉES
  // ============================================

  private refreshEvaluations(): void {
    this.getEvaluations().subscribe();
  }
}
