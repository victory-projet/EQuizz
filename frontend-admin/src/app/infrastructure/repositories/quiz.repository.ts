// src/app/core/infrastructure/repositories/quiz.repository.ts
import { Injectable, inject } from '@angular/core';
import { Observable, throwError, map } from 'rxjs';
import { Quiz, Question, QuizSubmission } from '../../core/domain/entities/quiz.entity';
import { IQuizRepository, IQuizSubmissionRepository, QuizStatistics } from '../../core/domain/repositories/quiz.repository.interface';
import { ApiService } from '../http/api.service';
import { QuizMapper } from '../mappers/quiz.mapper';
import { BackendEvaluation, BackendQuestion } from '../http/interfaces/backend.interfaces';

@Injectable({
  providedIn: 'root'
})
export class QuizRepository implements IQuizRepository {
  private apiService = inject(ApiService);

  getAll(): Observable<Quiz[]> {
    return this.apiService.get<BackendEvaluation[]>('/evaluations').pipe(
      map(backendEvaluations => backendEvaluations.map(e => QuizMapper.toQuiz(e)))
    );
  }

  getById(id: string): Observable<Quiz> {
    return this.apiService.get<BackendEvaluation>(`/evaluations/${id}`).pipe(
      map(backendEvaluation => QuizMapper.toQuiz(backendEvaluation))
    );
  }

  getByClass(classId: string): Observable<Quiz[]> {
    return this.getAll().pipe(
      map(quizzes => quizzes.filter(q => q.classIds.includes(classId)))
    );
  }

  getByStatus(status: string): Observable<Quiz[]> {
    return this.getAll().pipe(
      map(quizzes => quizzes.filter(q => q.status === status))
    );
  }

  create(quiz: Quiz): Observable<Quiz> {
    const request = QuizMapper.toBackendEvaluationRequest(quiz);
    
    return this.apiService.post<BackendEvaluation>('/evaluations', request).pipe(
      map(backendEvaluation => QuizMapper.toQuiz(backendEvaluation))
    );
  }

  update(id: string, updates: Partial<Quiz>): Observable<Quiz> {
    // Créer un objet temporaire pour la conversion
    const tempQuiz = new Quiz(
      id,
      updates.title || '',
      updates.subject || '',
      updates.status || 'draft',
      updates.questions || [],
      updates.classIds || [],
      updates.createdDate || new Date(),
      updates.endDate,
      updates.type || '',
      updates.description || '',
      updates.semesterId || '',
      updates.academicYearId || ''
    );
    
    const request = QuizMapper.toBackendEvaluationRequest(tempQuiz);
    
    return this.apiService.put<BackendEvaluation>(`/evaluations/${id}`, request).pipe(
      map(backendEvaluation => QuizMapper.toQuiz(backendEvaluation))
    );
  }

  delete(id: string): Observable<void> {
    return this.apiService.delete<void>(`/evaluations/${id}`);
  }

  publish(id: string): Observable<Quiz> {
    return this.apiService.post<BackendEvaluation>(`/evaluations/${id}/publish`, {}).pipe(
      map(backendEvaluation => QuizMapper.toQuiz(backendEvaluation))
    );
  }

  close(id: string): Observable<Quiz> {
    // TODO: Endpoint pour fermer une évaluation non disponible
    // Pour l'instant, on peut utiliser update avec status = 'closed'
    return this.update(id, { status: 'closed' });
  }

  addQuestion(quizId: string, question: Question): Observable<Question> {
    const request = QuizMapper.toBackendQuestionRequest(question);
    
    // Note: Le backend attend quizzId, pas evaluationId
    // Il faut d'abord récupérer l'évaluation pour obtenir le quizzId
    return this.getById(quizId).pipe(
      map(quiz => {
        // Extraire le quizzId depuis l'évaluation
        // Pour l'instant, on utilise l'ID de l'évaluation
        return this.apiService.post<BackendQuestion>(
          `/evaluations/quizz/${quizId}/questions`,
          request
        ).pipe(
          map(backendQuestion => QuizMapper.toQuestion(backendQuestion))
        );
      }),
      // Flatten l'observable imbriqué
      map(obs => obs)
    ) as any;
  }

  removeQuestion(quizId: string, questionId: string): Observable<void> {
    return this.apiService.delete<void>(`/evaluations/questions/${questionId}`);
  }

  updateQuestion(quizId: string, questionId: string, updates: Partial<Question>): Observable<Question> {
    // Créer un objet temporaire pour la conversion
    const tempQuestion = new Question(
      questionId,
      updates.text || '',
      updates.type || 'QCM',
      updates.points || 1,
      updates.options || [],
      updates.correctAnswer,
      updates.explanation
    );
    
    const request = QuizMapper.toBackendQuestionRequest(tempQuestion);
    
    return this.apiService.put<BackendQuestion>(`/evaluations/questions/${questionId}`, request).pipe(
      map(backendQuestion => QuizMapper.toQuestion(backendQuestion))
    );
  }

}

@Injectable({
  providedIn: 'root'
})
export class QuizSubmissionRepository implements IQuizSubmissionRepository {
  private apiService = inject(ApiService);

  getByQuiz(quizId: string): Observable<QuizSubmission[]> {
    // TODO: Endpoint pour récupérer les soumissions d'un quiz
    // Peut-être via GET /api/reports/:id ou un endpoint spécifique
    return throwError(() => new Error('Endpoint pour récupérer les soumissions non disponible'));
  }

  getByStudent(studentId: string): Observable<QuizSubmission[]> {
    // TODO: Endpoint pour récupérer les soumissions d'un étudiant
    // Peut-être via GET /api/students/:id/submissions
    return throwError(() => new Error('Endpoint pour récupérer les soumissions par étudiant non disponible'));
  }

  getById(id: string): Observable<QuizSubmission> {
    // TODO: Endpoint pour récupérer une soumission spécifique
    return throwError(() => new Error('Endpoint pour récupérer une soumission non disponible'));
  }

  submit(submission: QuizSubmission): Observable<QuizSubmission> {
    // Note: Cette fonctionnalité est pour les étudiants (mobile)
    // POST /api/student/quizzes/:id/submit
    return throwError(() => new Error('Fonctionnalité réservée aux étudiants (application mobile)'));
  }

  getStatistics(quizId: string): Observable<QuizStatistics> {
    // Utiliser l'endpoint dashboard pour obtenir les statistiques
    return this.apiService.get<any>(`/dashboard/evaluation/${quizId}`).pipe(
      map(response => {
        const stats: QuizStatistics = {
          totalSubmissions: response.statistiques?.totalParticipants || 0,
          averageScore: response.statistiques?.moyenneGenerale || 0,
          passRate: response.statistiques?.tauxReussite || 0,
          completionRate: response.statistiques?.tauxParticipation || 0
        };
        return stats;
      })
    );
  }
}
