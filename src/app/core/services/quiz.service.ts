import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Quiz } from '../../shared/interfaces/dashboard.interface';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private apiUrl = '/api/quizzes';

  // Données mockées pour le développement
  private mockQuizzes: Quiz[] = [
    {
      id: 1,
      title: 'Évaluation Mi-parcours - Algorithmique',
      status: 'En cours',
      ue: 'Algorithmique et Programmation',
      questions: 15,
      participation: {
        current: 124,
        total: 150,
        rate: 83
      },
      type: 'Mi-parcours',
      endDate: '30 Sept 2025',
      classes: ['L1 Info A', 'L1 Info B'],
      createdDate: '15 Sept 2025'
    },
    {
      id: 2,
      title: 'Évaluation Fin de Semestre - Base de Données',
      status: 'En cours',
      ue: 'Base de Données',
      questions: 20,
      participation: {
        current: 45,
        total: 80,
        rate: 56
      },
      type: 'Fin de semestre',
      endDate: '25 Oct 2025',
      classes: ['L2 Info'],
      createdDate: '10 Oct 2025'
    },
    {
      id: 3,
      title: 'Évaluation Mi-parcours - Réseaux',
      status: 'Brouillon',
      ue: 'Réseaux Informatiques',
      questions: 18,
      type: 'Mi-parcours',
      endDate: '25 Oct 2025',
      classes: ['L3 Info A', 'L3 Info B'],
      createdDate: '12 Oct 2025'
    }
  ];

  constructor(private http: HttpClient) {}

  getQuizzes(): Observable<Quiz[]> {
    // En production, utilisez:
    // return this.http.get<Quiz[]>(this.apiUrl);
    
    // Pour le développement:
    return of(this.mockQuizzes);
  }

  getQuizById(id: number): Observable<Quiz> {
    // En production:
    // return this.http.get<Quiz>(`${this.apiUrl}/${id}`);
    
    const quiz = this.mockQuizzes.find(q => q.id === id);
    return of(quiz!);
  }

  createQuiz(quiz: Partial<Quiz>): Observable<Quiz> {
    // En production:
    // return this.http.post<Quiz>(this.apiUrl, quiz);
    
    const newQuiz: Quiz = {
      id: Date.now(),
      title: quiz.title || '',
      status: quiz.status || 'Brouillon',
      ue: quiz.ue || '',
      questions: quiz.questions || 0,
      type: quiz.type || '',
      endDate: quiz.endDate || '',
      classes: quiz.classes || [],
      createdDate: quiz.createdDate || new Date().toLocaleDateString('fr-FR')
    };
    this.mockQuizzes.push(newQuiz);
    return of(newQuiz);
  }

  updateQuiz(id: number, quiz: Partial<Quiz>): Observable<Quiz> {
    // En production:
    // return this.http.put<Quiz>(`${this.apiUrl}/${id}`, quiz);
    
    const index = this.mockQuizzes.findIndex(q => q.id === id);
    if (index !== -1) {
      this.mockQuizzes[index] = { ...this.mockQuizzes[index], ...quiz };
      return of(this.mockQuizzes[index]);
    }
    return of({} as Quiz);
  }

  deleteQuiz(id: number): Observable<void> {
    // En production:
    // return this.http.delete<void>(`${this.apiUrl}/${id}`);
    
    const index = this.mockQuizzes.findIndex(q => q.id === id);
    if (index !== -1) {
      this.mockQuizzes.splice(index, 1);
    }
    return of(void 0);
  }

  publishQuiz(id: number): Observable<Quiz> {
    // En production:
    // return this.http.patch<Quiz>(`${this.apiUrl}/${id}/publish`, {});
    
    return this.updateQuiz(id, { status: 'En cours' });
  }
}
