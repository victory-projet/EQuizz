import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, timer, merge } from 'rxjs';
import { tap, catchError, switchMap, filter, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  Notification, 
  Activity, 
  NotificationFilter, 
  ActivityFilter, 
  NotificationSummary, 
  ActivitySummary,
  NotificationSettings,
  NotificationType,
  NotificationPriority,
  NotificationCategory
} from '../domain/entities/notification.entity';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  
  // Subjects pour les données en temps réel
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private activitiesSubject = new BehaviorSubject<Activity[]>([]);
  private summarySubject = new BehaviorSubject<NotificationSummary | null>(null);
  
  // Signaux publics
  notifications$ = this.notificationsSubject.asObservable();
  activities$ = this.activitiesSubject.asObservable();
  summary$ = this.summarySubject.asObservable();
  
  // Signaux pour l'état
  isLoading = signal(false);
  error = signal<string | null>(null);
  
  // Configuration
  private readonly API_BASE = `${environment.apiUrl}/notifications`;
  private readonly POLLING_INTERVAL = 30000; // 30 secondes
  private readonly MAX_NOTIFICATIONS = 100;
  private readonly MAX_ACTIVITIES = 50;
  
  constructor() {
    this.startPolling();
  }

  // === GESTION DES NOTIFICATIONS ===

  /**
   * Récupère toutes les notifications avec filtres
   */
  getNotifications(filter?: NotificationFilter): Observable<Notification[]> {
    this.isLoading.set(true);
    this.error.set(null);
    
    const params = this.buildNotificationParams(filter);
    
    return this.http.get<Notification[]>(`${this.API_BASE}`, { params }).pipe(
      map(notifications => notifications.map(notification => ({
        ...notification,
        createdAt: new Date(notification.createdAt),
        updatedAt: new Date(notification.updatedAt),
        expiresAt: notification.expiresAt ? new Date(notification.expiresAt) : undefined
      }))),
      tap(notifications => {
        this.notificationsSubject.next(notifications);
        this.isLoading.set(false);
      }),
      catchError(error => {
        this.error.set('Erreur lors du chargement des notifications');
        this.isLoading.set(false);
        throw error;
      })
    );
  }

  /**
   * Récupère le résumé des notifications
   */
  getNotificationSummary(): Observable<NotificationSummary> {
    return this.http.get<NotificationSummary>(`${this.API_BASE}/summary`).pipe(
      map(summary => this.ensureSummaryStructure(summary)),
      tap(summary => this.summarySubject.next(summary)),
      catchError(error => {
        this.error.set('Erreur lors du chargement du résumé');
        // Retourner un summary par défaut en cas d'erreur
        const defaultSummary = this.createDefaultSummary();
        this.summarySubject.next(defaultSummary);
        return [defaultSummary];
      })
    );
  }

  /**
   * S'assure que la structure du summary est correcte
   */
  private ensureSummaryStructure(summary: any): NotificationSummary {
    return {
      total: summary?.total || 0,
      unread: summary?.unread || 0,
      byType: summary?.byType || {
        info: 0,
        success: 0,
        warning: 0,
        error: 0,
        system: 0
      },
      byPriority: summary?.byPriority || {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0
      },
      byCategory: summary?.byCategory || {
        evaluation: 0,
        user: 0,
        system: 0,
        security: 0,
        performance: 0,
        maintenance: 0
      }
    };
  }

  /**
   * Crée un summary par défaut
   */
  private createDefaultSummary(): NotificationSummary {
    return {
      total: 0,
      unread: 0,
      byType: {
        info: 0,
        success: 0,
        warning: 0,
        error: 0,
        system: 0
      },
      byPriority: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0
      },
      byCategory: {
        evaluation: 0,
        user: 0,
        system: 0,
        security: 0,
        performance: 0,
        maintenance: 0
      }
    };
  }

  /**
   * Marque une notification comme lue
   */
  markAsRead(notificationId: string): Observable<void> {
    return this.http.patch<void>(`${this.API_BASE}/${notificationId}/read`, {}).pipe(
      tap(() => {
        this.updateNotificationStatus(notificationId, { isRead: true });
      })
    );
  }

  /**
   * Marque toutes les notifications comme lues
   */
  markAllAsRead(): Observable<void> {
    return this.http.patch<void>(`${this.API_BASE}/mark-all-read`, {}).pipe(
      tap(() => {
        const notifications = this.notificationsSubject.value.map(n => ({
          ...n,
          isRead: true
        }));
        this.notificationsSubject.next(notifications);
        this.refreshSummary();
      })
    );
  }

  /**
   * Archive une notification
   */
  archiveNotification(notificationId: string): Observable<void> {
    return this.http.patch<void>(`${this.API_BASE}/${notificationId}/archive`, {}).pipe(
      tap(() => {
        this.updateNotificationStatus(notificationId, { isArchived: true });
      })
    );
  }

  /**
   * Supprime une notification
   */
  deleteNotification(notificationId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_BASE}/${notificationId}`).pipe(
      tap(() => {
        const notifications = this.notificationsSubject.value.filter(
          n => n.id !== notificationId
        );
        this.notificationsSubject.next(notifications);
        this.refreshSummary();
      })
    );
  }

  /**
   * Crée une nouvelle notification
   */
  createNotification(notification: Partial<Notification>): Observable<Notification> {
    return this.http.post<Notification>(`${this.API_BASE}`, notification).pipe(
      map(newNotification => ({
        ...newNotification,
        createdAt: new Date(newNotification.createdAt),
        updatedAt: new Date(newNotification.updatedAt),
        expiresAt: newNotification.expiresAt ? new Date(newNotification.expiresAt) : undefined
      })),
      tap(newNotification => {
        const notifications = [newNotification, ...this.notificationsSubject.value];
        this.notificationsSubject.next(notifications.slice(0, this.MAX_NOTIFICATIONS));
        this.refreshSummary();
      })
    );
  }

  // === GESTION DES ACTIVITÉS ===

  /**
   * Récupère les activités récentes
   */
  getActivities(filter?: ActivityFilter): Observable<Activity[]> {
    const params = this.buildActivityParams(filter);
    
    return this.http.get<Activity[]>(`${this.API_BASE}/activities`, { params }).pipe(
      map(activities => activities.map(activity => ({
        ...activity,
        createdAt: new Date(activity.createdAt)
      }))),
      tap(activities => {
        this.activitiesSubject.next(activities);
      }),
      catchError(error => {
        this.error.set('Erreur lors du chargement des activités');
        throw error;
      })
    );
  }

  /**
   * Récupère le résumé des activités
   */
  getActivitySummary(): Observable<ActivitySummary> {
    return this.http.get<ActivitySummary>(`${this.API_BASE}/activities/summary`);
  }

  /**
   * Enregistre une nouvelle activité
   */
  logActivity(activity: Partial<Activity>): Observable<Activity> {
    return this.http.post<Activity>(`${this.API_BASE}/activities`, activity).pipe(
      map(newActivity => ({
        ...newActivity,
        createdAt: new Date(newActivity.createdAt)
      })),
      tap(newActivity => {
        const activities = [newActivity, ...this.activitiesSubject.value];
        this.activitiesSubject.next(activities.slice(0, this.MAX_ACTIVITIES));
      })
    );
  }

  // === PARAMÈTRES DE NOTIFICATION ===

  /**
   * Récupère les paramètres de notification de l'utilisateur
   */
  getNotificationSettings(): Observable<NotificationSettings> {
    return this.http.get<NotificationSettings>(`${this.API_BASE}/settings`);
  }

  /**
   * Met à jour les paramètres de notification
   */
  updateNotificationSettings(settings: Partial<NotificationSettings>): Observable<NotificationSettings> {
    return this.http.patch<NotificationSettings>(`${this.API_BASE}/settings`, settings);
  }

  // === MÉTHODES UTILITAIRES ===

  /**
   * Obtient le nombre de notifications non lues
   */
  getUnreadCount(): Observable<number> {
    return this.notifications$.pipe(
      filter(notifications => notifications.length > 0),
      switchMap(notifications => {
        const unreadCount = notifications.filter(n => !n.isRead && !n.isArchived).length;
        return [unreadCount];
      })
    );
  }

  /**
   * Obtient les notifications par priorité
   */
  getNotificationsByPriority(priority: NotificationPriority): Observable<Notification[]> {
    return this.notifications$.pipe(
      switchMap(notifications => {
        const filtered = notifications.filter(n => n.priority === priority && !n.isArchived);
        return [filtered];
      })
    );
  }

  /**
   * Obtient les notifications critiques non lues
   */
  getCriticalNotifications(): Observable<Notification[]> {
    return this.notifications$.pipe(
      switchMap(notifications => {
        const critical = notifications.filter(n => 
          n.priority === 'critical' && !n.isRead && !n.isArchived
        );
        return [critical];
      })
    );
  }

  /**
   * Filtre les notifications par catégorie
   */
  getNotificationsByCategory(category: NotificationCategory): Observable<Notification[]> {
    return this.notifications$.pipe(
      switchMap(notifications => {
        const filtered = notifications.filter(n => n.category === category && !n.isArchived);
        return [filtered];
      })
    );
  }

  // === MÉTHODES PRIVÉES ===

  private startPolling(): void {
    // Polling pour les nouvelles notifications
    timer(0, this.POLLING_INTERVAL).pipe(
      switchMap(() => merge(
        this.getNotifications({ limit: this.MAX_NOTIFICATIONS }),
        this.getNotificationSummary()
      ))
    ).subscribe();

    // Polling pour les activités (moins fréquent)
    timer(0, this.POLLING_INTERVAL * 2).pipe(
      switchMap(() => this.getActivities({ limit: this.MAX_ACTIVITIES }))
    ).subscribe();
  }

  private updateNotificationStatus(
    notificationId: string, 
    updates: Partial<Notification>
  ): void {
    const notifications = this.notificationsSubject.value.map(n =>
      n.id === notificationId ? { ...n, ...updates } : n
    );
    this.notificationsSubject.next(notifications);
    this.refreshSummary();
  }

  private refreshSummary(): void {
    this.getNotificationSummary().subscribe();
  }

  private buildNotificationParams(filter?: NotificationFilter): any {
    if (!filter) return {};

    const params: any = {};
    
    if (filter.type?.length) params.type = filter.type.join(',');
    if (filter.priority?.length) params.priority = filter.priority.join(',');
    if (filter.category?.length) params.category = filter.category.join(',');
    if (filter.isRead !== undefined) params.isRead = filter.isRead.toString();
    if (filter.isArchived !== undefined) params.isArchived = filter.isArchived.toString();
    if (filter.dateFrom) params.dateFrom = filter.dateFrom.toISOString();
    if (filter.dateTo) params.dateTo = filter.dateTo.toISOString();
    if (filter.search) params.search = filter.search;
    if (filter.limit) params.limit = filter.limit.toString();
    if (filter.offset) params.offset = filter.offset.toString();

    return params;
  }

  private buildActivityParams(filter?: ActivityFilter): any {
    if (!filter) return {};

    const params: any = {};
    
    if (filter.type?.length) params.type = filter.type.join(',');
    if (filter.userId) params.userId = filter.userId;
    if (filter.entityType) params.entityType = filter.entityType;
    if (filter.dateFrom) params.dateFrom = filter.dateFrom.toISOString();
    if (filter.dateTo) params.dateTo = filter.dateTo.toISOString();
    if (filter.search) params.search = filter.search;
    if (filter.limit) params.limit = filter.limit.toString();
    if (filter.offset) params.offset = filter.offset.toString();

    return params;
  }

  // === MÉTHODES D'AIDE POUR L'UI ===

  /**
   * Obtient l'icône pour un type de notification
   */
  getNotificationIcon(type: NotificationType): string {
    const icons: Record<NotificationType, string> = {
      info: 'info',
      success: 'check_circle',
      warning: 'warning',
      error: 'error',
      system: 'settings'
    };
    return icons[type] || 'notifications';
  }

  /**
   * Obtient la classe CSS pour un type de notification
   */
  getNotificationClass(type: NotificationType): string {
    const classes: Record<NotificationType, string> = {
      info: 'notification-info',
      success: 'notification-success',
      warning: 'notification-warning',
      error: 'notification-error',
      system: 'notification-system'
    };
    return classes[type] || 'notification-info';
  }

  /**
   * Obtient la classe CSS pour une priorité
   */
  getPriorityClass(priority: NotificationPriority): string {
    const classes: Record<NotificationPriority, string> = {
      low: 'priority-low',
      medium: 'priority-medium',
      high: 'priority-high',
      critical: 'priority-critical'
    };
    return classes[priority] || 'priority-medium';
  }

  /**
   * Formate le temps relatif
   */
  getTimeAgo(date: Date | string | null | undefined): string {
    // Vérifier si la date existe
    if (!date) {
      return 'Date non disponible';
    }
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Vérifier si la date est valide
    if (isNaN(dateObj.getTime())) {
      return 'Date invalide';
    }
    
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Il y a ${diffInDays}j`;
    
    return dateObj.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short'
    });
  }
}