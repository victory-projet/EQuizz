import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../infrastructure/http/api.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AnalyticsData, QuizResult } from '../models/quiz.interface';
import { DashboardRepository, DashboardData } from '../../infrastructure/repositories/dashboard.repository';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private api = inject(ApiService);
  private dashboardRepo = inject(DashboardRepository);

  getOverviewData(): Observable<AnalyticsData> {
    return this.dashboardRepo.getAdminDashboard().pipe(
      map(data => this.mapToAnalyticsData(data))
    );
  }

  getQuizResults(quizId: string): Observable<QuizResult[]> {
    return this.api.get<QuizResult[]>(`/api/evaluations/${quizId}/results`);
  }

  getStudentResults(studentId: string): Observable<QuizResult[]> {
    return this.api.get<QuizResult[]>(`/api/student/${studentId}/results`);
  }

  getAcademicYearStats(academicYearId: string): Observable<AnalyticsData> {
    return this.api.get<any>(`/api/academic/annees-academiques/${academicYearId}/stats`).pipe(
      map(data => this.mapToAnalyticsData(data))
    );
  }

  getSubjectStats(subjectId: string): Observable<AnalyticsData> {
    return this.api.get<any>(`/api/academic/cours/${subjectId}/stats`).pipe(
      map(data => this.mapToAnalyticsData(data))
    );
  }

  private mapToAnalyticsData(data: DashboardData | any): AnalyticsData {
    return {
      totalQuizzes: data.totalQuizzes || 0,
      activeQuizzes: data.activeQuizzes || 0,
      totalStudents: data.totalStudents || 0,
      averageScore: 0, // À calculer depuis les résultats
      participationRate: data.averageParticipation || 0,
      recentActivities: data.recentEvaluations?.map((e: any) => ({
        id: e.id,
        type: 'quiz_published',
        message: `Quiz "${e.title}" - ${e.course}`,
        timestamp: e.startDate
      })) || [],
      alerts: [] // À implémenter si nécessaire
    };
  }
}
