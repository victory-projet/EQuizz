import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, timer, combineLatest } from 'rxjs';
import { tap, catchError, switchMap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AdminDashboard, DashboardStats } from '../domain/entities/dashboard.entity';
import { NotificationService } from './notification.service';
import { 
  Notification, 
  Activity, 
  NotificationSummary,
  ActivitySummary,
  NotificationType,
  NotificationPriority
} from '../domain/entities/notification.entity';

export interface DashboardAlert {
  id: string;
  type: 'system' | 'security' | 'performance' | 'maintenance';
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  icon: string;
  color: string;
  timestamp: Date;
  isActive: boolean;
  actionRequired: boolean;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: any;
}

export interface DashboardMetrics {
  systemHealth: {
    status: 'healthy' | 'warning' | 'critical';
    uptime: number;
    responseTime: number;
    errorRate: number;
  };
  userActivity: {
    activeUsers: number;
    totalSessions: number;
    averageSessionDuration: number;
    newUsersToday: number;
  };
  evaluationMetrics: {
    totalEvaluations: number;
    activeEvaluations: number;
    completionRate: number;
    averageScore: number;
  };
  performanceMetrics: {
    pageLoadTime: number;
    apiResponseTime: number;
    cacheHitRate: number;
    errorCount: number;
  };
}

export interface RecentActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  user: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  };
  timestamp: Date;
  icon: string;
  color: string;
  category: 'user' | 'evaluation' | 'system' | 'security';
  metadata?: any;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private notificationService = inject(NotificationService);

  // Subjects pour les données en temps réel
  private dashboardDataSubject = new BehaviorSubject<AdminDashboard | null>(null);
  private alertsSubject = new BehaviorSubject<DashboardAlert[]>([]);
  private metricsSubject = new BehaviorSubject<DashboardMetrics | null>(null);
  private recentActivitiesSubject = new BehaviorSubject<RecentActivity[]>([]);

  // Observables publics
  dashboardData$ = this.dashboardDataSubject.asObservable();
  alerts$ = this.alertsSubject.asObservable();
  metrics$ = this.metricsSubject.asObservable();
  recentActivities$ = this.recentActivitiesSubject.asObservable();

  // Signaux pour l'état
  isLoading = signal(false);
  error = signal<string | null>(null);
  lastUpdate = signal<Date | null>(null);

  // Configuration
  private readonly API_BASE = `${environment.apiUrl}/dashboard`;
  private readonly REFRESH_INTERVAL = 30000; // 30 secondes
  private readonly METRICS_INTERVAL = 60000; // 1 minute

  constructor() {
    this.startAutoRefresh();
  }

  // === DONNÉES PRINCIPALES DU DASHBOARD ===

  /**
   * Récupère toutes les données du dashboard
   */
  getDashboardData(): Observable<AdminDashboard> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.get<AdminDashboard>(`${this.API_BASE}/admin`).pipe(
      tap(data => {
        this.dashboardDataSubject.next(data);
        this.isLoading.set(false);
        this.lastUpdate.set(new Date());
      }),
      catchError(error => {
        this.error.set('Erreur lors du chargement du dashboard');
        this.isLoading.set(false);
        throw error;
      })
    );
  }

  /**
   * Récupère les statistiques de base
   */
  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.API_BASE}/stats`);
  }

  // === GESTION DES ALERTES ===

  /**
   * Récupère les alertes actives du dashboard
   */
  getAlerts(): Observable<DashboardAlert[]> {
    return this.http.get<DashboardAlert[]>(`${this.API_BASE}/alerts`).pipe(
      map(alerts => alerts.map(alert => ({
        ...alert,
        timestamp: new Date(alert.timestamp)
      }))),
      tap(alerts => {
        this.alertsSubject.next(alerts);
      }),
      catchError(error => {
        console.error('Erreur lors du chargement des alertes:', error);
        return [];
      })
    );
  }

  /**
   * Crée une nouvelle alerte
   */
  createAlert(alert: Partial<DashboardAlert>): Observable<DashboardAlert> {
    return this.http.post<DashboardAlert>(`${this.API_BASE}/alerts`, alert).pipe(
      tap(newAlert => {
        const currentAlerts = this.alertsSubject.value;
        this.alertsSubject.next([newAlert, ...currentAlerts]);
      })
    );
  }

  /**
   * Marque une alerte comme résolue
   */
  resolveAlert(alertId: string): Observable<void> {
    return this.http.patch<void>(`${this.API_BASE}/alerts/${alertId}/resolve`, {}).pipe(
      tap(() => {
        const alerts = this.alertsSubject.value.map(alert =>
          alert.id === alertId ? { ...alert, isActive: false } : alert
        );
        this.alertsSubject.next(alerts);
      })
    );
  }

  /**
   * Supprime une alerte
   */
  deleteAlert(alertId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_BASE}/alerts/${alertId}`).pipe(
      tap(() => {
        const alerts = this.alertsSubject.value.filter(alert => alert.id !== alertId);
        this.alertsSubject.next(alerts);
      })
    );
  }

  // === MÉTRIQUES ET PERFORMANCE ===

  /**
   * Récupère les métriques système
   */
  getMetrics(): Observable<DashboardMetrics> {
    return this.http.get<DashboardMetrics>(`${this.API_BASE}/metrics`).pipe(
      tap(metrics => {
        this.metricsSubject.next(metrics);
        this.checkSystemHealth(metrics);
      }),
      catchError(error => {
        console.error('Erreur lors du chargement des métriques:', error);
        throw error;
      })
    );
  }

  /**
   * Récupère les métriques de performance
   */
  getPerformanceMetrics(timeRange: '1h' | '24h' | '7d' | '30d' = '24h'): Observable<any> {
    return this.http.get(`${this.API_BASE}/metrics/performance`, {
      params: { timeRange }
    });
  }

  // === ACTIVITÉS RÉCENTES ===

  /**
   * Récupère les activités récentes pour le dashboard
   */
  getRecentActivities(limit: number = 10): Observable<RecentActivity[]> {
    return this.http.get<RecentActivity[]>(`${this.API_BASE}/activities/recent`, {
      params: { limit: limit.toString() }
    }).pipe(
      map(activities => activities.map(activity => ({
        ...activity,
        timestamp: new Date(activity.timestamp)
      }))),
      tap(activities => {
        this.recentActivitiesSubject.next(activities);
      }),
      catchError(error => {
        console.error('Erreur lors du chargement des activités:', error);
        return [];
      })
    );
  }

  /**
   * Enregistre une nouvelle activité
   */
  logActivity(activity: Partial<RecentActivity>): Observable<RecentActivity> {
    return this.http.post<RecentActivity>(`${this.API_BASE}/activities`, activity).pipe(
      map(newActivity => ({
        ...newActivity,
        timestamp: new Date(newActivity.timestamp)
      })),
      tap(newActivity => {
        const currentActivities = this.recentActivitiesSubject.value;
        this.recentActivitiesSubject.next([newActivity, ...currentActivities.slice(0, 9)]);
      })
    );
  }

  // === NOTIFICATIONS INTÉGRÉES ===

  /**
   * Récupère les notifications critiques pour le dashboard
   */
  getCriticalNotifications(): Observable<Notification[]> {
    return this.notificationService.getCriticalNotifications();
  }

  /**
   * Récupère le résumé des notifications
   */
  getNotificationSummary(): Observable<NotificationSummary> {
    return this.notificationService.getNotificationSummary();
  }

  /**
   * Récupère le résumé des activités
   */
  getActivitySummary(): Observable<ActivitySummary> {
    return this.notificationService.getActivitySummary();
  }

  // === DONNÉES COMBINÉES POUR LE DASHBOARD ===

  /**
   * Récupère toutes les données nécessaires pour le dashboard
   */
  getDashboardOverview(): Observable<{
    dashboard: AdminDashboard;
    alerts: DashboardAlert[];
    metrics: DashboardMetrics;
    recentActivities: RecentActivity[];
    notifications: NotificationSummary;
    criticalNotifications: Notification[];
  }> {
    return combineLatest([
      this.getDashboardData(),
      this.getAlerts(),
      this.getMetrics(),
      this.getRecentActivities(),
      this.getNotificationSummary(),
      this.getCriticalNotifications()
    ]).pipe(
      map(([dashboard, alerts, metrics, recentActivities, notifications, criticalNotifications]) => ({
        dashboard,
        alerts,
        metrics,
        recentActivities,
        notifications,
        criticalNotifications
      }))
    );
  }

  // === MÉTHODES PRIVÉES ===

  private startAutoRefresh(): void {
    // Actualisation des données principales
    timer(0, this.REFRESH_INTERVAL).pipe(
      switchMap(() => this.getDashboardData())
    ).subscribe();

    // Actualisation des alertes
    timer(0, this.REFRESH_INTERVAL).pipe(
      switchMap(() => this.getAlerts())
    ).subscribe();

    // Actualisation des activités récentes
    timer(0, this.REFRESH_INTERVAL).pipe(
      switchMap(() => this.getRecentActivities())
    ).subscribe();

    // Actualisation des métriques (moins fréquent)
    timer(0, this.METRICS_INTERVAL).pipe(
      switchMap(() => this.getMetrics())
    ).subscribe();
  }

  private checkSystemHealth(metrics: DashboardMetrics): void {
    const { systemHealth } = metrics;
    
    // Créer des alertes automatiques basées sur les métriques
    if (systemHealth.status === 'critical') {
      this.createSystemAlert({
        type: 'system',
        severity: 'critical',
        title: 'Système en état critique',
        message: `Temps de réponse: ${systemHealth.responseTime}ms, Taux d'erreur: ${systemHealth.errorRate}%`,
        actionRequired: true
      });
    } else if (systemHealth.status === 'warning') {
      this.createSystemAlert({
        type: 'performance',
        severity: 'warning',
        title: 'Performance dégradée',
        message: `Le système fonctionne mais avec des performances réduites`,
        actionRequired: false
      });
    }

    // Vérifier le taux d'erreur
    if (systemHealth.errorRate > 5) {
      this.createSystemAlert({
        type: 'system',
        severity: 'error',
        title: 'Taux d\'erreur élevé',
        message: `Le taux d'erreur actuel est de ${systemHealth.errorRate}%`,
        actionRequired: true
      });
    }
  }

  private createSystemAlert(alertData: Partial<DashboardAlert>): void {
    const alert: Partial<DashboardAlert> = {
      ...alertData,
      id: this.generateId(),
      timestamp: new Date(),
      isActive: true,
      icon: this.getAlertIcon(alertData.type || 'system'),
      color: this.getAlertColor(alertData.severity || 'info')
    };

    // Vérifier si une alerte similaire existe déjà
    const existingAlert = this.alertsSubject.value.find(a => 
      a.type === alert.type && a.title === alert.title && a.isActive
    );

    if (!existingAlert) {
      this.createAlert(alert).subscribe();
    }
  }

  // === MÉTHODES UTILITAIRES ===

  /**
   * Génère un ID unique
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Obtient l'icône pour un type d'alerte
   */
  getAlertIcon(type: string): string {
    const icons: Record<string, string> = {
      system: 'settings',
      security: 'security',
      performance: 'speed',
      maintenance: 'build'
    };
    return icons[type] || 'info';
  }

  /**
   * Obtient la couleur pour une sévérité d'alerte
   */
  getAlertColor(severity: string): string {
    const colors: Record<string, string> = {
      info: '#2196F3',
      warning: '#FF9800',
      error: '#F44336',
      critical: '#9C27B0'
    };
    return colors[severity] || '#2196F3';
  }

  /**
   * Obtient l'icône pour un type d'activité
   */
  getActivityIcon(type: string): string {
    const icons: Record<string, string> = {
      user_created: 'person_add',
      user_updated: 'person',
      user_deleted: 'person_remove',
      evaluation_created: 'quiz',
      evaluation_published: 'publish',
      evaluation_updated: 'edit',
      evaluation_deleted: 'delete',
      class_created: 'class',
      class_updated: 'edit',
      system_backup: 'backup',
      system_maintenance: 'build',
      security_alert: 'security'
    };
    return icons[type] || 'info';
  }

  /**
   * Obtient la couleur pour une catégorie d'activité
   */
  getActivityColor(category: string): string {
    const colors: Record<string, string> = {
      user: '#4CAF50',
      evaluation: '#2196F3',
      system: '#FF9800',
      security: '#F44336'
    };
    return colors[category] || '#9E9E9E';
  }

  /**
   * Formate le temps relatif
   */
  getTimeAgo(date: Date | string | null | undefined): string {
    return this.notificationService.getTimeAgo(date);
  }

  /**
   * Actualise manuellement toutes les données
   */
  refreshAll(): void {
    this.getDashboardData().subscribe();
    this.getAlerts().subscribe();
    this.getMetrics().subscribe();
    this.getRecentActivities().subscribe();
  }

  /**
   * Obtient le statut global du système
   */
  getSystemStatus(): Observable<'healthy' | 'warning' | 'critical'> {
    return this.metrics$.pipe(
      map(metrics => metrics?.systemHealth.status || 'healthy')
    );
  }

  /**
   * Obtient le nombre d'alertes actives
   */
  getActiveAlertsCount(): Observable<number> {
    return this.alerts$.pipe(
      map(alerts => alerts.filter(alert => alert.isActive).length)
    );
  }

  /**
   * Obtient les alertes par sévérité
   */
  getAlertsBySeverity(severity: string): Observable<DashboardAlert[]> {
    return this.alerts$.pipe(
      map(alerts => alerts.filter(alert => alert.severity === severity && alert.isActive))
    );
  }
}