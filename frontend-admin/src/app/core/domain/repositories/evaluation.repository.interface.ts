// Repository Interface - Evaluation
import { Observable } from 'rxjs';
import { Evaluation, Question, SessionReponse } from '../entities/evaluation.entity';

export abstract class EvaluationRepositoryInterface {
  // Évaluations
  abstract createEvaluation(evaluation: Partial<Evaluation>): Observable<Evaluation>;
  abstract getEvaluations(): Observable<Evaluation[]>;
  abstract getEvaluation(id: string | number): Observable<Evaluation>;
  abstract updateEvaluation(id: string | number, evaluation: Partial<Evaluation>): Observable<Evaluation>;
  abstract deleteEvaluation(id: string | number): Observable<void>;
  abstract publishEvaluation(id: string | number): Observable<Evaluation>;
  abstract closeEvaluation(id: string | number): Observable<Evaluation>;

  // Questions
  abstract addQuestion(quizzId: string | number, question: Partial<Question>): Observable<Question>;
  abstract updateQuestion(questionId: string | number, question: Partial<Question>): Observable<Question>;
  abstract deleteQuestion(questionId: string | number): Observable<void>;
  abstract importQuestions(quizzId: string | number, file: File): Observable<Question[]>;

  // Soumissions
  abstract getSubmissions(evaluationId: string | number): Observable<SessionReponse[]>;
}
