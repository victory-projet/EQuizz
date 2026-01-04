import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { EvaluationApiData, Evaluation } from '../domain/entities/evaluation.entity';
import { Question, QuestionFormData, QuestionImportData } from '../domain/entities/question.entity';
import { EvaluationRepositoryInterface } from '../domain/repositories/evaluation.repository.interface';

@Injectable({
  providedIn: 'root'
})
export class EvaluationUseCase {
  
  constructor(private evaluationRepository: EvaluationRepositoryInterface) {}

  createEvaluation(data: EvaluationApiData): Observable<Evaluation> {
    return this.evaluationRepository.create(data);
  }

  updateEvaluation(id: string | number, data: Partial<EvaluationApiData>): Observable<Evaluation> {
    return this.evaluationRepository.update(id, data);
  }

  getEvaluation(id: string | number): Observable<Evaluation> {
    return this.evaluationRepository.findById(id);
  }

  getEvaluations(): Observable<Evaluation[]> {
    return this.evaluationRepository.findAll();
  }

  deleteEvaluation(id: string | number): Observable<void> {
    return this.evaluationRepository.delete(id);
  }

  publishEvaluation(id: string | number): Observable<Evaluation> {
    return this.evaluationRepository.publish(id);
  }

  closeEvaluation(id: string | number): Observable<Evaluation> {
    return this.evaluationRepository.close(id);
  }

  duplicateEvaluation(id: string | number): Observable<Evaluation> {
    return this.evaluationRepository.duplicateEvaluation(id);
  }

<<<<<<< Updated upstream
  // Méthodes pour les questions
  addQuestion(quizzId: string | number, questionData: QuestionFormData): Observable<Question> {
    return this.evaluationRepository.addQuestion(quizzId, questionData);
  }

  updateQuestion(questionId: string | number, questionData: QuestionFormData): Observable<Question> {
    return this.evaluationRepository.updateQuestion(questionId, questionData);
=======
  createQuestion(quizzId: string | number, question: Partial<Question>): Observable<Question> {
    return this.evaluationRepository.addQuestion(quizzId, question);
  }

  getQuestionsByQuizz(quizzId: string | number): Observable<Question[]> {
    return this.evaluationRepository.getQuestionsByQuizz(quizzId);
  }

  updateQuestion(questionId: string | number, question: Partial<Question>): Observable<Question> {
    return this.evaluationRepository.updateQuestion(questionId, question);
>>>>>>> Stashed changes
  }

  deleteQuestion(questionId: string | number): Observable<void> {
    return this.evaluationRepository.deleteQuestion(questionId);
  }

  importQuestions(quizzId: string | number, file: File): Observable<QuestionImportData> {
    return this.evaluationRepository.importQuestions(quizzId, file);
  }

  // Méthodes pour les soumissions et résultats
  getSubmissions(evaluationId: string | number): Observable<any[]> {
    return this.evaluationRepository.getSubmissions(evaluationId);
  }

  getResults(evaluationId: string | number): Observable<any> {
    return this.evaluationRepository.getResults(evaluationId);
  }
<<<<<<< Updated upstream
}
=======

  debugDelete(id: string | number): Observable<any> {
    return this.evaluationRepository.debugDelete(id);
  }
}
>>>>>>> Stashed changes
