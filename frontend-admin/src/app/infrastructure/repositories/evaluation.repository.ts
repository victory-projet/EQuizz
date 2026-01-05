// Infrastructure - Evaluation Repository Implementation
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EvaluationRepositoryInterface } from '../../core/domain/repositories/evaluation.repository.interface';
import { Evaluation, Question, SessionReponse } from '../../core/domain/entities/evaluation.entity';
import { ApiService } from '../http/api.service';

@Injectable({
  providedIn: 'root'
})
export class EvaluationRepository implements EvaluationRepositoryInterface {
  constructor(private api: ApiService) {}

  createEvaluation(evaluation: Partial<Evaluation>): Observable<Evaluation> {
    console.log('📡 Repository - Envoi de la requête POST /evaluations:', evaluation);
    return this.api.post<Evaluation>('/evaluations', evaluation);
  }

  getEvaluations(): Observable<Evaluation[]> {
    return this.api.get<any[]>('/evaluations').pipe(
      map((data: any[]) => data.map(item => this.mapEvaluationFromBackend(item)))
    );
  }

  getEvaluation(id: string | number): Observable<Evaluation> {
    return this.api.get<any>(`/evaluations/${id}`).pipe(
      map((data: any) => this.mapEvaluationFromBackend(data))
    );
  }

  private mapEvaluationFromBackend(data: any): Evaluation {
    console.log('📥 Mapping evaluation from backend:', {
      raw: data,
      hasCours: !!data.Cours,
      hasCour: !!data.Cour,
      hasClasses: !!data.Classes,
      classesLength: data.Classes?.length
    });

    const mapped = {
      ...data,
      // Le backend retourne "Cour" (singulier) ou "Cours" (pluriel) selon la relation
      cours: data.Cour || data.Cours || data.cours,
      // Le backend retourne "Classes" (array) - on prend la première
      classe: data.Classes?.[0] || data.Classe || data.classe,
      // Le backend retourne "Quizz" (majuscule)
      quizz: data.Quizz ? {
        ...data.Quizz,
        id: data.Quizz.id,  // S'assurer que l'ID est bien présent
        // Le backend retourne "Questions" (majuscule)
        questions: data.Quizz.Questions?.map((q: any) => ({
          ...q,
          // Mapper typeQuestion vers type pour compatibilité
          type: q.typeQuestion || q.type
        })) || []
      } : undefined,
      // S'assurer que quizzId est bien défini
      quizzId: data.Quizz?.id || data.quizzId
    };

    console.log('✅ Mapped evaluation:', {
      cours: mapped.cours,
      classe: mapped.classe,
      quizzId: mapped.quizzId
    });

    return mapped;
  }

  updateEvaluation(id: string | number, evaluation: Partial<Evaluation>): Observable<Evaluation> {
    return this.api.put<Evaluation>(`/evaluations/${id}`, evaluation);
  }

  deleteEvaluation(id: string | number): Observable<void> {
    return this.api.delete<void>(`/evaluations/${id}`);
  }

  publishEvaluation(id: string | number): Observable<Evaluation> {
    return this.api.post<Evaluation>(`/evaluations/${id}/publish`, {});
  }

  closeEvaluation(id: string | number): Observable<Evaluation> {
    return this.api.post<Evaluation>(`/evaluations/${id}/close`, {});
  }

  addQuestion(quizzId: string | number, question: Partial<Question>): Observable<Question> {
    return this.api.post<Question>(`/evaluations/quizz/${quizzId}/questions`, question);
  }

  updateQuestion(questionId: string | number, question: Partial<Question>): Observable<Question> {
    return this.api.put<Question>(`/evaluations/questions/${questionId}`, question);
  }

  deleteQuestion(questionId: string | number): Observable<void> {
    return this.api.delete<void>(`/evaluations/questions/${questionId}`);
  }

  importQuestions(quizzId: string | number, file: File): Observable<Question[]> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.upload<Question[]>(`/evaluations/quizz/${quizzId}/import`, formData);
  }

  getSubmissions(evaluationId: string | number): Observable<SessionReponse[]> {
    return this.api.get<SessionReponse[]>(`/evaluations/${evaluationId}/submissions`);
  }

  duplicateEvaluation(id: string | number): Observable<Evaluation> {
    return this.api.post<any>(`/evaluations/${id}/duplicate`, {}).pipe(
      map((response: any) => this.mapEvaluationFromBackend(response.evaluation))
    );
  }
}
