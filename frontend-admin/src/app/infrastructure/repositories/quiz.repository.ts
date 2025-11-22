// src/app/core/infrastructure/repositories/quiz.repository.ts
import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError, map } from 'rxjs';
import { Quiz, Question, QuizSubmission } from '../../core/domain/entities/quiz.entity';
import { IQuizRepository, IQuizSubmissionRepository, QuizStatistics } from '../../core/domain/repositories/quiz.repository.interface';

@Injectable({
  providedIn: 'root'
})
export class QuizRepository implements IQuizRepository {
  private quizzes: Quiz[] = this.initMockData();

  getAll(): Observable<Quiz[]> {
    return of([...this.quizzes]).pipe(delay(300));
  }

  getById(id: string): Observable<Quiz> {
    const quiz = this.quizzes.find(q => q.id === id);
    if (!quiz) {
      return throwError(() => new Error(`Quiz ${id} non trouvé`));
    }
    return of(quiz).pipe(delay(200));
  }

  getByClass(classId: string): Observable<Quiz[]> {
    const filtered = this.quizzes.filter(q => q.classIds.includes(classId));
    return of(filtered).pipe(delay(300));
  }

  getByStatus(status: string): Observable<Quiz[]> {
    const filtered = this.quizzes.filter(q => q.status === status);
    return of(filtered).pipe(delay(300));
  }

  create(quiz: Quiz): Observable<Quiz> {
    this.quizzes.unshift(quiz);
    return of(quiz).pipe(delay(300));
  }

  update(id: string, updates: Partial<Quiz>): Observable<Quiz> {
    const index = this.quizzes.findIndex(q => q.id === id);
    if (index === -1) {
      return throwError(() => new Error(`Quiz ${id} non trouvé`));
    }

    Object.assign(this.quizzes[index], updates);
    return of(this.quizzes[index]).pipe(delay(300));
  }

  delete(id: string): Observable<void> {
    const index = this.quizzes.findIndex(q => q.id === id);
    if (index === -1) {
      return throwError(() => new Error(`Quiz ${id} non trouvé`));
    }

    this.quizzes.splice(index, 1);
    return of(void 0).pipe(delay(300));
  }

  publish(id: string): Observable<Quiz> {
    const index = this.quizzes.findIndex(q => q.id === id);
    if (index === -1) {
      return throwError(() => new Error(`Quiz ${id} non trouvé`));
    }

    try {
      this.quizzes[index].publish();
      return of(this.quizzes[index]).pipe(delay(300));
    } catch (error) {
      return throwError(() => error);
    }
  }

  close(id: string): Observable<Quiz> {
    const index = this.quizzes.findIndex(q => q.id === id);
    if (index === -1) {
      return throwError(() => new Error(`Quiz ${id} non trouvé`));
    }

    this.quizzes[index].close();
    return of(this.quizzes[index]).pipe(delay(300));
  }

  addQuestion(quizId: string, question: Question): Observable<Question> {
    const quiz = this.quizzes.find(q => q.id === quizId);
    if (!quiz) {
      return throwError(() => new Error(`Quiz ${quizId} non trouvé`));
    }

    quiz.addQuestion(question);
    return of(question).pipe(delay(300));
  }

  removeQuestion(quizId: string, questionId: string): Observable<void> {
    const quiz = this.quizzes.find(q => q.id === quizId);
    if (!quiz) {
      return throwError(() => new Error(`Quiz ${quizId} non trouvé`));
    }

    quiz.removeQuestion(questionId);
    return of(void 0).pipe(delay(300));
  }

  updateQuestion(quizId: string, questionId: string, updates: Partial<Question>): Observable<Question> {
    const quiz = this.quizzes.find(q => q.id === quizId);
    if (!quiz) {
      return throwError(() => new Error(`Quiz ${quizId} non trouvé`));
    }

    const questionIndex = quiz.questions.findIndex(q => q.id === questionId);
    if (questionIndex === -1) {
      return throwError(() => new Error(`Question ${questionId} non trouvée`));
    }

    Object.assign(quiz.questions[questionIndex], updates);
    return of(quiz.questions[questionIndex]).pipe(delay(300));
  }

  private initMockData(): Quiz[] {
    // Quiz terminé (date passée en 2024-2025)
    const quiz1 = new Quiz(
      '1',
      'Évaluation Mi-parcours - Algorithmique',
      'Algorithmique et Programmation',
      'active',
      [],
      ['class-1', 'class-2'],
      new Date('2024-09-15'),
      new Date('2024-12-20'), // Date passée → Terminé
      'Mi-parcours',
      'Cette évaluation porte sur les concepts fondamentaux de l\'algorithmique : structures de données, complexité, et algorithmes de tri.',
      'semester-1',
      'year-1'
    );
    
    // Quiz en cours (date future en 2025-2026)
    const quiz2 = new Quiz(
      '2',
      'Évaluation Fin de Semestre - Base de Données',
      'Base de Données',
      'active',
      [],
      ['class-3'],
      new Date('2025-10-05'),
      new Date('2026-01-31'), // Date future → En cours
      'Fin de semestre',
      'Évaluation complète sur les bases de données relationnelles : modélisation, SQL, normalisation et transactions.',
      'semester-2',
      'year-1'
    );
    
    // Quiz brouillon (année en cours 2025-2026)
    const quiz3 = new Quiz(
      '3',
      'Évaluation Mi-parcours - Réseaux',
      'Réseaux Informatiques',
      'draft',
      [],
      ['class-4', 'class-5'],
      new Date('2025-11-10'),
      undefined,
      'Mi-parcours',
      'Quiz sur les protocoles réseau, modèle OSI, et architecture TCP/IP.',
      'semester-1',
      'year-1'
    );
    
    return [quiz1, quiz2, quiz3];
  }
}

@Injectable({
  providedIn: 'root'
})
export class QuizSubmissionRepository implements IQuizSubmissionRepository {
  private submissions: QuizSubmission[] = [];

  getByQuiz(quizId: string): Observable<QuizSubmission[]> {
    const filtered = this.submissions.filter(s => s.quizId === quizId);
    return of(filtered).pipe(delay(300));
  }

  getByStudent(studentId: string): Observable<QuizSubmission[]> {
    const filtered = this.submissions.filter(s => s.studentId === studentId);
    return of(filtered).pipe(delay(300));
  }

  getById(id: string): Observable<QuizSubmission> {
    const submission = this.submissions.find(s => s.id === id);
    if (!submission) {
      return throwError(() => new Error(`Soumission ${id} non trouvée`));
    }
    return of(submission).pipe(delay(200));
  }

  submit(submission: QuizSubmission): Observable<QuizSubmission> {
    this.submissions.push(submission);
    return of(submission).pipe(delay(300));
  }

  getStatistics(quizId: string): Observable<QuizStatistics> {
    const quizSubmissions = this.submissions.filter(s => s.quizId === quizId);
    
    const stats: QuizStatistics = {
      totalSubmissions: quizSubmissions.length,
      averageScore: quizSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / quizSubmissions.length || 0,
      passRate: (quizSubmissions.filter(s => (s.score || 0) >= 50).length / quizSubmissions.length) * 100 || 0,
      completionRate: 75 // Mock value
    };

    return of(stats).pipe(delay(300));
  }
}
