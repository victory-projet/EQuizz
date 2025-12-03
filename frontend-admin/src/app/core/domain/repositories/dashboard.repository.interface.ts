// Repository Interface - Dashboard
import { Observable } from 'rxjs';
import { AdminDashboard } from '../entities/dashboard.entity';

export abstract class DashboardRepositoryInterface {
  abstract getAdminDashboard(): Observable<AdminDashboard>;
  abstract getEvaluationStats(evaluationId: number): Observable<any>;
}
