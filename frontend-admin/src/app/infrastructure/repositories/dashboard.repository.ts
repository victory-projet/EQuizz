import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../http/api.service';
import { map } from 'rxjs/operators';

export interface BackendDashboard {
  overview: {
    totalEtudiants: number;
    totalEnseignants: number;
    totalCours: number;
    totalEvaluations: number;
    evaluationsActives: number;
    evaluationsTerminees: number;
    tauxParticipationMoyen: number;
  };
  evaluationsRecentes: Array<{
    id: string;
    titre: string;
    cours: string;
    statut: string;
    dateDebut: string;
    dateFin: string;
    nombreClasses: number;
  }>;
  statsParCours: Array<{
    id: string;
    code: string;
    nom: string;
    enseignant: string;
    nombreEvaluations: number;
    tauxParticipation: number;
  }>;
}

export interface DashboardData {
  totalQuizzes: number;
  activeQuizzes: number;
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  completedQuizzes: number;
  averageParticipation: number;
  recentEvaluations: Array<{
    id: string;
    title: string;
    course: string;
    status: string;
    startDate: Date;
    endDate: Date;
    classCount: number;
  }>;
  courseStats: Array<{
    id: string;
    code: string;
    name: string;
    teacher: string;
    evaluationCount: number;
    participationRate: number;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardRepository {
  private api = inject(ApiService);
  private readonly baseUrl = '/dashboard';

  getAdminDashboard(): Observable<DashboardData> {
    return this.api.get<BackendDashboard>(`${this.baseUrl}/admin`).pipe(
      map(data => this.mapToDashboardData(data))
    );
  }

  getEvaluationStats(evaluationId: string): Observable<any> {
    return this.api.get(`${this.baseUrl}/evaluation/${evaluationId}`);
  }

  private mapToDashboardData(backend: BackendDashboard): DashboardData {
    return {
      totalQuizzes: backend.overview.totalEvaluations,
      activeQuizzes: backend.overview.evaluationsActives,
      totalStudents: backend.overview.totalEtudiants,
      totalTeachers: backend.overview.totalEnseignants,
      totalCourses: backend.overview.totalCours,
      completedQuizzes: backend.overview.evaluationsTerminees,
      averageParticipation: backend.overview.tauxParticipationMoyen,
      recentEvaluations: backend.evaluationsRecentes.map(e => ({
        id: e.id,
        title: e.titre,
        course: e.cours,
        status: e.statut,
        startDate: new Date(e.dateDebut),
        endDate: new Date(e.dateFin),
        classCount: e.nombreClasses
      })),
      courseStats: backend.statsParCours.map(c => ({
        id: c.id,
        code: c.code,
        name: c.nom,
        teacher: c.enseignant,
        evaluationCount: c.nombreEvaluations,
        participationRate: c.tauxParticipation
      }))
    };
  }
}
