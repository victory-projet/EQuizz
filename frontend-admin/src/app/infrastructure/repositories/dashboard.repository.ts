// Infrastructure - Dashboard Repository Implementation
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DashboardRepositoryInterface } from '../../core/domain/repositories/dashboard.repository.interface';
import { AdminDashboard } from '../../core/domain/entities/dashboard.entity';
import { ApiService } from '../http/api.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardRepository implements DashboardRepositoryInterface {
  constructor(private api: ApiService) {}

  getAdminDashboard(): Observable<AdminDashboard> {
    return this.api.get<AdminDashboard>('/dashboard/admin');
  }

  getEvaluationStats(evaluationId: number): Observable<any> {
    return this.api.get<any>(`/dashboard/evaluation/${evaluationId}`);
  }
}
