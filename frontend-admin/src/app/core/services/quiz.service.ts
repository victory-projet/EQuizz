import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Quiz, Question } from '../models/quiz.interface';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private http = inject(HttpClient);
  private apiUrl = '/api/quizzes';

  getQuizzes(): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(this.apiUrl);
  }

  getQuizById(id: string): Observable<Quiz> {
    return this.http.get<Quiz>(`${this.apiUrl}/${id}`);
  }

  createQuiz(quiz: Partial<Quiz>): Observable<Quiz> {
    return this.http.post<Quiz>(this.apiUrl, quiz);
  }

  updateQuiz(id: string, quiz: Partial<Quiz>): Observable<Quiz> {
    return this.http.put<Quiz>(`${this.apiUrl}/${id}`, quiz);
  }

  deleteQuiz(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  addQuestion(quizId: string, question: Partial<Question>): Observable<Question> {
    return this.http.post<Question>(`${this.apiUrl}/${quizId}/questions`, question);
  }

  updateQuestion(quizId: string, questionId: string, question: Partial<Question>): Observable<Question> {
    return this.http.put<Question>(`${this.apiUrl}/${quizId}/questions/${questionId}`, question);
  }

  deleteQuestion(quizId: string, questionId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${quizId}/questions/${questionId}`);
  }
}
