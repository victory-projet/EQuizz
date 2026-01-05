// Repository Interface - Evaluation
import { Observable } from 'rxjs';
import { Evaluation, EvaluationApiData } from '../entities/evaluation.entity';
import { Question, QuestionFormData, QuestionImportData } from '../entities/question.entity';

export abstract class EvaluationRepositoryInterface {
  // Évaluations
  abstract create(evaluation: EvaluationApiData): Observable<Evaluation>;
  abstract findAll(): Observable<Evaluation[]>;
  abstract findById(id: string | number): Observable<Evaluation>;
  abstract update(id: string | number, evaluation: Partial<EvaluationApiData>): Observable<Evaluation>;
  abstract delete(id: string | number): Observable<void>;
  abstract publish(id: string | number): Observable<Evaluation>;
  abstract close(id: string | number): Observable<Evaluation>;

  // Questions
  abstract addQuestion(quizzId: string | number, question: Partial<Question>): Observable<Question>;
  abstract getQuestionsByQuizz(quizzId: string | number): Observable<Question[]>;
  abstract updateQuestion(questionId: string | number, question: Partial<Question>): Observable<Question>;
  abstract deleteQuestion(questionId: string | number): Observable<void>;
  abstract importQuestions(quizzId: string | number, file: File): Observable<QuestionImportData>;

  // Soumissions et résultats
  abstract getSubmissions(evaluationId: string | number): Observable<any[]>;
  abstract getResults(evaluationId: string | number): Observable<any>;

  // Duplication
  abstract duplicateEvaluation(id: string | number): Observable<Evaluation>;

  // Debug
  abstract debugDelete(id: string | number): Observable<any>;
}
