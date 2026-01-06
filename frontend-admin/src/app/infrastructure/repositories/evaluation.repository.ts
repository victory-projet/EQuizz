// Infrastructure - Evaluation Repository Implementation
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EvaluationRepositoryInterface } from '../../core/domain/repositories/evaluation.repository.interface';
import { Evaluation, EvaluationApiData } from '../../core/domain/entities/evaluation.entity';
import { Question, QuestionFormData, QuestionImportData } from '../../core/domain/entities/question.entity';
import { ApiService } from '../http/api.service';

@Injectable({
  providedIn: 'root'
})
export class EvaluationRepository implements EvaluationRepositoryInterface {
  constructor(private api: ApiService) {}

  create(evaluation: EvaluationApiData): Observable<Evaluation> {
    console.log('📡 Repository - Envoi de la requête POST /evaluations:', evaluation);
    return this.api.post<any>('/evaluations', evaluation).pipe(
      map((response: any) => this.mapEvaluationFromBackend(response.evaluation || response))
    );
  }

  findAll(): Observable<Evaluation[]> {
    return this.api.get<any>('/evaluations').pipe(
      map((response: any) => {
        // Le backend renvoie { evaluations: [...], pagination: {...} }
        const evaluations = response.evaluations || response.data?.evaluations || response;
        
        // S'assurer que nous avons un tableau
        if (!Array.isArray(evaluations)) {
          console.error('❌ Repository - La réponse n\'est pas un tableau:', response);
          return [];
        }
        
        return evaluations.map(item => this.mapEvaluationFromBackend(item));
      })
    );
  }

  findById(id: string | number): Observable<Evaluation> {
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
      classesLength: data.Classes?.length,
      hasQuizz: !!data.Quizz,
      quizzId: data.Quizz?.id
    });

    const mapped = {
      ...data,
      // Le backend retourne "Cour" (singulier) ou "Cours" (pluriel) selon la relation
      // Gérer le cas où Cours peut être null
      cours: data.Cour || data.Cours || data.cours || null,
      // Le backend retourne "Classes" (array) - on prend la première
      classe: data.Classes?.[0] || data.Classe || data.classe || null,
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
      } : null,
      // S'assurer que quizzId est bien défini
      quizzId: data.Quizz?.id || data.quizzId || null
    };

    console.log('✅ Mapped evaluation:', {
      cours: mapped.cours,
      classe: mapped.classe,
      quizzId: mapped.quizzId,
      hasQuizz: !!mapped.quizz,
      quizzFromData: mapped.quizz?.id
    });

    return mapped;
  }

  update(id: string | number, evaluation: Partial<EvaluationApiData>): Observable<Evaluation> {
    return this.api.put<any>(`/evaluations/${id}`, evaluation).pipe(
      map((response: any) => this.mapEvaluationFromBackend(response.evaluation || response))
    );
  }

  delete(id: string | number): Observable<void> {
    return this.api.delete<void>(`/evaluations/${id}`);
  }

  publish(id: string | number): Observable<Evaluation> {
    return this.api.post<any>(`/evaluations/${id}/publish`, {}).pipe(
      map((response: any) => this.mapEvaluationFromBackend(response.evaluation || response))
    );
  }

  close(id: string | number): Observable<Evaluation> {
    return this.api.post<any>(`/evaluations/${id}/close`, {}).pipe(
      map((response: any) => this.mapEvaluationFromBackend(response.evaluation || response))
    );
  }

  addQuestion(quizzId: string | number, question: Partial<Question>): Observable<Question> {
    return this.api.post<Question>(`/evaluations/quizz/${quizzId}/questions`, question);
  }

  getQuestionsByQuizz(quizzId: string | number): Observable<Question[]> {
    return this.api.get<Question[]>(`/evaluations/quizz/${quizzId}/questions`);
  }

  updateQuestion(questionId: string | number, question: Partial<Question>): Observable<Question> {
    return this.api.put<Question>(`/questions/${questionId}`, question);
  }

  deleteQuestion(questionId: string | number): Observable<void> {
    return this.api.delete<void>(`/questions/${questionId}`);
  }

  importQuestions(quizzId: string | number, file: File): Observable<QuestionImportData> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.upload<QuestionImportData>(`/evaluations/quizz/${quizzId}/import`, formData);
  }

  getSubmissions(evaluationId: string | number): Observable<any[]> {
    return this.api.get<any[]>(`/evaluations/${evaluationId}/submissions`);
  }

  getResults(evaluationId: string | number): Observable<any> {
    return this.api.get<any>(`/evaluations/${evaluationId}/results`);
  }

  duplicateEvaluation(id: string | number): Observable<Evaluation> {
    return this.api.post<any>(`/evaluations/${id}/duplicate`, {}).pipe(
      map((response: any) => this.mapEvaluationFromBackend(response.evaluation))
    );
  }

  debugDelete(id: string | number): Observable<any> {
    return this.api.get<any>(`/evaluations/${id}/debug-delete`);
  }
}
