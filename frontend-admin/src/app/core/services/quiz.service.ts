import { Injectable, inject } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { Quiz, Question } from '../models/quiz.interface';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private quizzes: Quiz[] = this.initMockData();

  getQuizzes(): Observable<Quiz[]> {
    return of([...this.quizzes]).pipe(delay(300));
  }

  getQuizById(id: string): Observable<Quiz> {
    const quiz = this.quizzes.find(q => q.id === id);
    if (!quiz) {
      return throwError(() => new Error(`Quiz ${id} non trouvé`));
    }
    return of(quiz).pipe(delay(200));
  }

  createQuiz(quizData: Partial<Quiz>): Observable<Quiz> {
    const newQuiz: Quiz = {
      id: `quiz-${Date.now()}`,
      title: quizData.title || '',
      description: quizData.description || '',
      courseId: quizData.courseId || '',
      classId: quizData.classId || '',
      teacherId: quizData.teacherId || '',
      academicYearId: quizData.academicYearId || '',
      duration: quizData.duration || 60,
      totalPoints: quizData.totalPoints || 0,
      passingScore: quizData.passingScore || 50,
      allowLateSubmission: quizData.allowLateSubmission ?? false,
      shuffleQuestions: quizData.shuffleQuestions ?? false,
      showResults: quizData.showResults ?? true,
      maxAttempts: quizData.maxAttempts || 1,
      status: quizData.status || 'draft',
      questions: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.quizzes.unshift(newQuiz);
    return of(newQuiz).pipe(delay(500));
  }

  updateQuiz(id: string, quizData: Partial<Quiz>): Observable<Quiz> {
    const index = this.quizzes.findIndex(q => q.id === id);
    if (index === -1) {
      return throwError(() => new Error(`Quiz ${id} non trouvé`));
    }

    this.quizzes[index] = {
      ...this.quizzes[index],
      ...quizData,
      updatedAt: new Date()
    };

    return of(this.quizzes[index]).pipe(delay(300));
  }

  deleteQuiz(id: string): Observable<void> {
    const index = this.quizzes.findIndex(q => q.id === id);
    if (index === -1) {
      return throwError(() => new Error(`Quiz ${id} non trouvé`));
    }

    this.quizzes.splice(index, 1);
    return of(void 0).pipe(delay(300));
  }

  addQuestion(quizId: string, questionData: Partial<Question>): Observable<Question> {
    const quiz = this.quizzes.find(q => q.id === quizId);
    if (!quiz) {
      return throwError(() => new Error(`Quiz ${quizId} non trouvé`));
    }

    if (!quiz.questions) {
      quiz.questions = [];
    }

    const newQuestion: Question = {
      id: `question-${Date.now()}`,
      quizId: quizId,
      type: questionData.type || 'multiple_choice',
      text: questionData.text || '',
      points: questionData.points || 1,
      required: questionData.required ?? true,
      order: quiz.questions.length + 1,
      options: questionData.options || []
    };

    quiz.questions.push(newQuestion);
    return of(newQuestion).pipe(delay(300));
  }

  updateQuestion(quizId: string, questionId: string, questionData: Partial<Question>): Observable<Question> {
    const quiz = this.quizzes.find(q => q.id === quizId);
    if (!quiz || !quiz.questions) {
      return throwError(() => new Error(`Quiz ${quizId} non trouvé`));
    }

    const questionIndex = quiz.questions.findIndex(q => q.id === questionId);
    if (questionIndex === -1) {
      return throwError(() => new Error(`Question ${questionId} non trouvée`));
    }

    quiz.questions[questionIndex] = {
      ...quiz.questions[questionIndex],
      ...questionData
    };

    return of(quiz.questions[questionIndex]).pipe(delay(300));
  }

  deleteQuestion(quizId: string, questionId: string): Observable<void> {
    const quiz = this.quizzes.find(q => q.id === quizId);
    if (!quiz || !quiz.questions) {
      return throwError(() => new Error(`Quiz ${quizId} non trouvé`));
    }

    const questionIndex = quiz.questions.findIndex(q => q.id === questionId);
    if (questionIndex === -1) {
      return throwError(() => new Error(`Question ${questionId} non trouvée`));
    }

    quiz.questions.splice(questionIndex, 1);
    return of(void 0).pipe(delay(300));
  }

  private initMockData(): Quiz[] {
    return [
      {
        id: 'quiz-1',
        title: 'Quiz de démonstration - Algorithmique',
        description: 'Un quiz de test pour démontrer les fonctionnalités',
        courseId: 'course-1',
        classId: 'class-1',
        teacherId: 'teacher-1',
        academicYearId: '1',
        duration: 60,
        totalPoints: 10,
        passingScore: 50,
        allowLateSubmission: false,
        shuffleQuestions: true,
        showResults: true,
        maxAttempts: 1,
        status: 'published',
        questions: [
          {
            id: 'q1',
            quizId: 'quiz-1',
            type: 'multiple_choice',
            text: 'Quelle est la complexité temporelle de la recherche binaire ?',
            points: 2,
            required: true,
            order: 1,
            options: [
              { id: 'opt1', questionId: 'q1', text: 'O(n)', isCorrect: false, order: 1 },
              { id: 'opt2', questionId: 'q1', text: 'O(log n)', isCorrect: true, order: 2 },
              { id: 'opt3', questionId: 'q1', text: 'O(n²)', isCorrect: false, order: 3 },
              { id: 'opt4', questionId: 'q1', text: 'O(1)', isCorrect: false, order: 4 }
            ]
          }
        ],
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      }
    ];
  }
}
