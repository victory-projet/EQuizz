import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApiService } from '../http/api.service';
import { 
  BackendEvaluation, 
  BackendQuizz, 
  BackendQuestion, 
  BackendSessionReponse,
  BackendEvaluationRequest,
  BackendQuestionRequest
} from '../http/interfaces/backend.interfaces';
import { 
  SimpleEvaluation, 
  SimpleQuiz, 
  SimpleQuestion, 
  SimpleQuizSession 
} from '../../core/models/simplified.interfaces';
import { BackendMapper } from '../mappers/backend.mapper';

@Injectable({
  providedIn: 'root'
})
export class QuizRepository {
  private readonly evaluationsUrl = '/evaluations';
  private readonly quizUrl = '/evaluations/quizz';
  private readonly sessionsUrl = '/student/quizzes';

  constructor(private api: ApiService) {}

  // ============================================
  // ÉVALUATIONS
  // ============================================

  findAll(): Observable<SimpleEvaluation[]> {
    return this.api.get<BackendEvaluation[]>(this.evaluationsUrl)
      .pipe(
        map(response => BackendMapper.toEvaluations(response))
      );
  }

  findById(id: string): Observable<SimpleEvaluation> {
    return this.api.get<BackendEvaluation>(`${this.evaluationsUrl}/${id}`)
      .pipe(
        map(response => BackendMapper.toEvaluation(response))
      );
  }

  findByCourse(courseId: string): Observable<SimpleEvaluation[]> {
    return this.findAll().pipe(
      map(evaluations => evaluations.filter(e => e.courseId === courseId))
    );
  }

  findByTeacher(teacherId: string): Observable<SimpleEvaluation[]> {
    return this.findAll().pipe(
      map(evaluations => evaluations.filter(e => e.courseId === teacherId))
    );
  }

  findByStudent(studentId: string): Observable<SimpleEvaluation[]> {
    return this.api.get<BackendEvaluation[]>('/student/quizzes')
      .pipe(
        map(response => BackendMapper.toEvaluations(response))
      );
  }

  create(data: Partial<SimpleEvaluation>): Observable<SimpleEvaluation> {
    const request: any = {
      titre: data.title!,
      description: data.description || '',
      dateDebut: data.startDate!.toISOString(),
      dateFin: data.endDate?.toISOString() || new Date().toISOString(),
      datePublication: data.publicationDate?.toISOString() || new Date().toISOString(),
      typeEvaluation: data.type!,
      statut: data.status || 'BROUILLON',
      cours_id: data.courseId!,
      classeIds: []
    };

    return this.api.post<BackendEvaluation>(this.evaluationsUrl, request)
      .pipe(
        map(response => BackendMapper.toEvaluation(response))
      );
  }

  update(id: string, data: Partial<SimpleEvaluation>): Observable<SimpleEvaluation> {
    const request: any = {};
    
    if (data.title) request.titre = data.title;
    if (data.description !== undefined) request.description = data.description;
    if (data.startDate) request.dateDebut = data.startDate.toISOString();
    if (data.endDate) request.dateFin = data.endDate.toISOString();
    if (data.publicationDate) request.datePublication = data.publicationDate.toISOString();
    if (data.type) request.typeEvaluation = data.type;
    if (data.status) request.statut = data.status;
    if (data.courseId) request.cours_id = data.courseId;

    return this.api.put<BackendEvaluation>(`${this.evaluationsUrl}/${id}`, request)
      .pipe(
        map(response => BackendMapper.toEvaluation(response))
      );
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`${this.evaluationsUrl}/${id}`);
  }

  publish(id: string): Observable<SimpleEvaluation> {
    return this.api.post<BackendEvaluation>(`${this.evaluationsUrl}/${id}/publish`, {})
      .pipe(
        map(response => BackendMapper.toEvaluation(response))
      );
  }

  close(id: string): Observable<SimpleEvaluation> {
    return this.api.post<BackendEvaluation>(`${this.evaluationsUrl}/${id}/close`, {})
      .pipe(
        map(response => BackendMapper.toEvaluation(response))
      );
  }

  // ============================================
  // QUIZ
  // ============================================

  getQuizByEvaluation(evaluationId: string): Observable<SimpleQuiz> {
    return this.findById(evaluationId).pipe(
      map(evaluation => ({
        id: evaluation.quizId,
        title: evaluation.title,
        instructions: '',
        evaluationId: evaluation.id,
        createdAt: evaluation.createdAt,
        updatedAt: evaluation.updatedAt
      }))
    );
  }

  updateQuiz(evaluationId: string, data: Partial<SimpleQuiz>): Observable<SimpleQuiz> {
    return this.getQuizByEvaluation(evaluationId);
  }

  // ============================================
  // QUESTIONS
  // ============================================

  getQuestions(quizId: string): Observable<SimpleQuestion[]> {
    return this.api.get<BackendQuestion[]>(`/evaluations/quizz/${quizId}/questions`)
      .pipe(
        map(response => BackendMapper.toQuestions(response))
      );
  }

  addQuestion(quizId: string, data: Partial<SimpleQuestion>): Observable<SimpleQuestion> {
    const request: any = {
      enonce: data.statement!,
      typeQuestion: data.type!,
      options: data.options || []
    };

    return this.api.post<BackendQuestion>(`/evaluations/quizz/${quizId}/questions`, request)
      .pipe(
        map(response => BackendMapper.toQuestion(response))
      );
  }

  updateQuestion(questionId: string, data: Partial<SimpleQuestion>): Observable<SimpleQuestion> {
    const request: any = {};
    
    if (data.statement) request.enonce = data.statement;
    if (data.type) request.typeQuestion = data.type;
    if (data.options !== undefined) request.options = data.options;

    return this.api.put<BackendQuestion>(`/evaluations/questions/${questionId}`, request)
      .pipe(
        map(response => BackendMapper.toQuestion(response))
      );
  }

  deleteQuestion(questionId: string): Observable<void> {
    return this.api.delete<void>(`/evaluations/questions/${questionId}`);
  }

  // ============================================
  // SESSIONS DE RÉPONSE
  // ============================================

  getEvaluationSessions(evaluationId: string): Observable<SimpleQuizSession[]> {
    return this.api.get<any[]>(`/evaluations/${evaluationId}/submissions`)
      .pipe(
        map(response => response.map((s: any) => ({
          id: s.id,
          anonymousToken: s.tokenAnonyme || '',
          status: s.estTermine ? 'TERMINE' : 'EN_COURS',
          startDate: new Date(s.dateDebut),
          endDate: new Date(s.dateFin || new Date()),
          evaluationId: evaluationId,
          studentId: s.etudiant?.id || '',
          createdAt: new Date(s.dateDebut),
          updatedAt: new Date(s.dateFin || new Date())
        })))
      );
  }

  getStudentSession(evaluationId: string, studentId: string): Observable<SimpleQuizSession> {
    return this.api.get<any>(`/student/quizzes/${evaluationId}`)
      .pipe(
        map(response => ({
          id: response.id || '',
          anonymousToken: response.tokenAnonyme || '',
          status: response.statutSession || 'EN_COURS',
          startDate: new Date(),
          endDate: new Date(),
          evaluationId: evaluationId,
          studentId: studentId,
          createdAt: new Date(),
          updatedAt: new Date()
        }))
      );
  }

  startSession(evaluationId: string, studentId: string): Observable<SimpleQuizSession> {
    return this.getStudentSession(evaluationId, studentId);
  }

  submitSession(sessionId: string): Observable<SimpleQuizSession> {
    return this.api.post<any>(`/student/quizzes/${sessionId}/submit`, {
      reponses: [],
      estFinal: true
    }).pipe(
      map(response => ({
        id: sessionId,
        anonymousToken: response.tokenAnonyme || '',
        status: 'TERMINE',
        startDate: new Date(),
        endDate: new Date(),
        evaluationId: '',
        studentId: '',
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    );
  }

  saveAnswer(sessionId: string, questionId: string, content: string): Observable<void> {
    return this.api.post<void>(`/student/quizzes/${sessionId}/submit`, {
      reponses: [{ question_id: questionId, contenu: content }],
      estFinal: false
    });
  }
}
