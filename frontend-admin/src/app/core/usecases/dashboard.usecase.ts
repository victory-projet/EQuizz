// Use Case - Dashboard
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DashboardRepositoryInterface } from '../domain/repositories/dashboard.repository.interface';
import { AdminDashboard } from '../domain/entities/dashboard.entity';

@Injectable({
  providedIn: 'root'
})
export class DashboardUseCase {
  constructor(private dashboardRepository: DashboardRepositoryInterface) {}

  getAdminDashboard(): Observable<AdminDashboard> {
    return this.dashboardRepository.getAdminDashboard();
  }

  getEvaluationStats(evaluationId: number): Observable<any> {
    return this.dashboardRepository.getEvaluationStats(evaluationId);
  }
}
