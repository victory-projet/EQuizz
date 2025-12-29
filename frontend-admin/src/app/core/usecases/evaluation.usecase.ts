// Use Case - Evaluation
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EvaluationRepositoryInterface } from '../domain/repositories/evaluation.repository.interface';
import { Evaluation, Question, SessionReponse } from '../domain/entities/evaluation.entity';

@Injectable({
  providedIn: 'root'
})
export class EvaluationUseCase {
  constructor(private evaluationRepository: EvaluationRepositoryInterface) {}

  createEvaluation(evaluation: Partial<Evaluation>): Observable<Evaluation> {
    return this.evaluationRepository.createEvaluation(evaluation);
  }

  getEvaluations(): Observable<Evaluation[]> {
    return this.evaluationRepository.getEvaluations();
  }

  getEvaluation(id: string | number): Observable<Evaluation> {
    return this.evaluationRepository.getEvaluation(id);
  }

  updateEvaluation(id: string | number, evaluation: Partial<Evaluation>): Observable<Evaluation> {
    return this.evaluationRepository.updateEvaluation(id, evaluation);
  }

  deleteEvaluation(id: string | number): Observable<void> {
    return this.evaluationRepository.deleteEvaluation(id);
  }

  publishEvaluation(id: string | number): Observable<Evaluation> {
    return this.evaluationRepository.publishEvaluation(id);
  }

  closeEvaluation(id: string | number): Observable<Evaluation> {
    return this.evaluationRepository.closeEvaluation(id);
  }

  addQuestion(quizzId: string | number, question: Partial<Question>): Observable<Question> {
    return this.evaluationRepository.addQuestion(quizzId, question);
  }

  updateQuestion(questionId: string | number, question: Partial<Question>): Observable<Question> {
    return this.evaluationRepository.updateQuestion(questionId, question);
  }

  deleteQuestion(questionId: string | number): Observable<void> {
    return this.evaluationRepository.deleteQuestion(questionId);
  }

  importQuestions(quizzId: string | number, file: File): Observable<Question[]> {
    return this.evaluationRepository.importQuestions(quizzId, file);
  }

  getSubmissions(evaluationId: string | number): Observable<SessionReponse[]> {
    return this.evaluationRepository.getSubmissions(evaluationId);
  }

  duplicateEvaluation(id: string | number): Observable<Evaluation> {
    return this.evaluationRepository.duplicateEvaluation(id);
  }
}
