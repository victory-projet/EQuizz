import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { AnalyticsData, QuizResult } from '../models/quiz.interface';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private http = inject(HttpClient);
  private apiUrl = '/api/analytics';

  getOverviewData(): Observable<AnalyticsData> {
    // Mock data temporaire en attendant l'API
    const mockData: AnalyticsData = {
      totalQuizzes: 24,
      activeQuizzes: 8,
      totalStudents: 156,
      averageScore: 75.5,
      participationRate: 82.3,
      recentActivities: [
        {
          id: '1',
          type: 'quiz_completed',
          message: 'Quiz "Algorithmique" complété par 45 étudiants',
          timestamp: new Date()
        },
        {
          id: '2',
          type: 'quiz_created',
          message: 'Nouveau quiz "Base de données" créé',
          timestamp: new Date()
        }
      ],
      alerts: [
        {
          id: '1',
          type: 'warning',
          message: 'Le quiz "Programmation Web" se termine dans 2 jours',
          timestamp: new Date()
        }
      ]
    };
    return of(mockData);
    // return this.http.get<AnalyticsData>(`${this.apiUrl}/overview`);
  }

  getQuizResults(quizId: string): Observable<QuizResult[]> {
    return this.http.get<QuizResult[]>(`${this.apiUrl}/quiz/${quizId}/results`);
  }

  getStudentResults(studentId: string): Observable<QuizResult[]> {
    return this.http.get<QuizResult[]>(`${this.apiUrl}/student/${studentId}/results`);
  }

  getAcademicYearStats(academicYearId: string): Observable<AnalyticsData> {
    return this.http.get<AnalyticsData>(`${this.apiUrl}/academic-year/${academicYearId}`);
  }

  getSubjectStats(subjectId: string): Observable<AnalyticsData> {
    return this.http.get<AnalyticsData>(`${this.apiUrl}/subject/${subjectId}`);
  }
}
