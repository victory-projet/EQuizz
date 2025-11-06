// core/services/quiz.service.ts
import { Injectable } from '@angular/core';
import { Quiz, Question } from '../../shared/interfaces/quiz.interface';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private quizzes: Quiz[] = [
    {
      id: '1',
      title: 'Évaluation Mi-parcours - Algorithmique',
      status: 'active',
      ue: 'Algorithmique et Programmation',
      questionsCount: 15,
      participation: { current: 124, total: 150, rate: 83 },
      classes: ['L1 Info A', 'L1 Info B'],
      createdAt: new Date('2025-09-15'),
      endDate: new Date('2025-09-30'),
      type: 'mi-parcours'
    },
    {
      id: '2',
      title: 'Évaluation Fin de Semestre - Base de Données',
      status: 'active',
      ue: 'Base de Données',
      questionsCount: 20,
      participation: { current: 45, total: 80, rate: 56 },
      classes: ['L2 Info'],
      createdAt: new Date('2025-10-10'),
      endDate: new Date('2025-10-25'),
      type: 'fin-semestre'
    },
    {
      id: '3',
      title: 'Évaluation Mi-parcours - Réseaux',
      status: 'draft',
      ue: 'Réseaux Informatiques',
      questionsCount: 18,
      participation: { current: 0, total: 120, rate: 0 },
      classes: ['L3 Info A', 'L3 Info B'],
      createdAt: new Date('2025-10-12'),
      endDate: new Date('2025-10-25'),
      type: 'mi-parcours'
    }
  ];

  private questions: Question[] = [
    {
      id: '1',
      type: 'multiple',
      text: 'Quelle est la complexité de l\'algorithme de tri rapide?',
      options: ['O(n log n)', 'O(n²)', 'O(log n)', 'O(1)'],
      correctAnswer: 0,
      points: 2
    }
  ];

  getQuizzes(): Quiz[] {
    return this.quizzes;
  }

  getQuizById(id: string): Quiz | undefined {
    return this.quizzes.find(quiz => quiz.id === id);
  }

  getQuizzesByStatus(status: Quiz['status']): Quiz[] {
    return this.quizzes.filter(quiz => quiz.status === status);
  }

  createQuiz(quiz: Omit<Quiz, 'id'>): void {
    const newQuiz: Quiz = {
      ...quiz,
      id: Math.random().toString(36).substr(2, 9)
    };
    this.quizzes.push(newQuiz);
  }

  updateQuiz(id: string, updates: Partial<Quiz>): void {
    const index = this.quizzes.findIndex(quiz => quiz.id === id);
    if (index !== -1) {
      this.quizzes[index] = { ...this.quizzes[index], ...updates };
    }
  }
}
