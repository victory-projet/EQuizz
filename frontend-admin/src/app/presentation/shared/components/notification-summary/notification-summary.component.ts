import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { NotificationService } from '../../../../core/services/notification.service';
import { 
  Notification, 
  NotificationSummary,
  NotificationType,
  NotificationPriority
} from '../../../../core/domain/entities/notification.entity';

@Component({
  selector: 'app-notification-summary',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-summary" [class.compact]="compact">
      <!-- Header -->
      <div class="summary-header">
        <div class="header-left">
          <h3>
            <span class="material-icons">notifications</span>
            Notifications
          </h3>
          @if (unreadCount() > 0) {
            <span class="unread-badge" [class.critical]="hasCritical()">
              {{ unreadCount() }}
            </span>
          }
        </div>
        <div class="header-actions">
          <button class="btn-icon" (click)="refresh()" 
                  [class.loading]="isLoading()"
                  title="Actualiser">
            <span class="material-icons">refresh</span>
          </button>
          <button class="btn-text" (click)="viewAllNotifications()">
            <span class="material-icons">open_in_new</span>
            @if (!compact) {
              <span>Voir tout</span>
            }
          </button>
        </div>
      </div>

      <!-- Quick Stats -->
      @if (summary()) {
        <div class="quick-stats">
          <div class="stat-item" [class.clickable]="true" (click)="filterByPriority('critical')">
            <div class="stat-icon critical">
              <span class="material-icons">priority_high</span>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ summary()!.byPriority.critical || 0 }}</span>
              <span class="stat-label">Critiques</span>
            </div>
          </div>

          <div class="stat-item" [class.clickable]="true" (click)="filterByPriority('high')">
            <div class="stat-icon high">
              <span class="material-icons">warning</span>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ summary()!.byPriority.high || 0 }}</span>
              <span class="stat-label">Importantes</span>
            </div>
          </div>

          <div class="stat-item" [class.clickable]="true" (click)="showUnreadOnly()">
            <div class="stat-icon unread">
              <span class="material-icons">mark_email_unread</span>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ summary()!.unread || 0 }}</span>
              <span class="stat-label">Non lues</span>
            </div>
          </div>

          <div class="stat-item" [class.clickable]="true" (click)="viewAllNotifications()">
            <div class="stat-icon total">
              <span class="material-icons">inbox</span>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ summary()!.total || 0 }}</span>
              <span class="stat-label">Total</span>
            </div>
          </div>
        </div>
      }

      <!-- Critical Notifications -->
      @if (criticalNotifications().length > 0) {
        <div class="critical-notifications">
          <div class="section-header">
            <h4>
              <span class="material-icons">priority_high</span>
              Notifications Critiques
            </h4>
          </div>
          
          <div class="notifications-list">
            @for (notification of criticalNotifications(); track notification.id) {
              <div class="notification-item critical" (click)="onNotificationClick(notification)">
                <div class="notification-icon">
                  <span class="material-icons">{{ getNotificationIcon(notification.type) }}</span>
                </div>
                <div class="notification-content">
                  <h5>{{ notification.title }}</h5>
                  <p>{{ notification.message }}</p>
                  <span class="notification-time">{{ getTimeAgo(notification.createdAt) }}</span>
                </div>
                <div class="notification-actions">
                  @if (!notification.isRead) {
                    <button class="btn-icon btn-sm" 
                            (click)="markAsRead(notification); $event.stopPropagation()" 
                            title="Marquer comme lu">
                      <span class="material-icons">check</span>
                    </button>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Recent Notifications -->
      @if (recentNotifications().length > 0) {
        <div class="recent-notifications">
          <div class="section-header">
            <h4>
              <span class="material-icons">schedule</span>
              Récentes
            </h4>
            @if (recentNotifications().length > maxRecent) {
              <button class="btn-text btn-sm" (click)="viewAllNotifications()">
                Voir toutes ({{ totalNotifications() }})
              </button>
            }
          </div>
          
          <div class="notifications-list">
            @for (notification of displayedRecentNotifications(); track notification.id) {
              <div class="notification-item" 
                   [class]="getNotificationClasses(notification)"
                   [class.unread]="!notification.isRead"
                   (click)="onNotificationClick(notification)">
                <div class="notification-icon" [class]="getNotificationTypeClass(notification.type)">
                  <span class="material-icons">{{ getNotificationIcon(notification.type) }}</span>
                </div>
                <div class="notification-content">
                  <h5>{{ notification.title }}</h5>
                  <p>{{ notification.message }}</p>
                  <div class="notification-meta">
                    <span class="priority-badge" [class]="getPriorityClass(notification.priority)">
                      {{ getPriorityLabel(notification.priority) }}
                    </span>
                    <span class="notification-time">{{ getTimeAgo(notification.createdAt) }}</span>
                  </div>
                </div>
                <div class="notification-actions">
                  @if (!notification.isRead) {
                    <button class="btn-icon btn-sm" 
                            (click)="markAsRead(notification); $event.stopPropagation()" 
                            title="Marquer comme lu">
                      <span class="material-icons">check</span>
                    </button>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Empty State -->
      @if (totalNotifications() === 0 && !isLoading()) {
        <div class="empty-state">
          <span class="material-icons">notifications_none</span>
          <h4>Aucune notification</h4>
          <p>Vous êtes à jour !</p>
        </div>
      }

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Chargement des notifications...</p>
        </div>
      }

      <!-- Quick Actions -->
      @if (unreadCount() > 0) {
        <div class="quick-actions">
          <button class="btn-primary btn-sm" (click)="markAllAsRead()">
            <span class="material-icons">done_all</span>
            Tout marquer comme lu
          </button>
        </div>
      }
    </div>
  `,
  styleUrls: ['./notification-summary.component.scss']
})
export class NotificationSummaryComponent implements OnInit, OnDestroy {
  @Input() compact = false;
  @Input() maxRecent = 5;
  @Input() showCriticalOnly = false;
  @Input() autoRefresh = true;

  @Output() notificationClick = new EventEmitter<Notification>();
  @Output() viewAllClick = new EventEmitter<void>();
  @Output() filterClick = new EventEmitter<{ type: string; value: string }>();

  private notificationService = inject(NotificationService);
  private destroy$ = new Subject<void>();

  // État
  summary = signal<NotificationSummary | null>(null);
  criticalNotifications = signal<Notification[]>([]);
  recentNotifications = signal<Notification[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadData();
    this.setupSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSubscriptions(): void {
    // Écouter le résumé des notifications
    this.notificationService.summary$
      .pipe(takeUntil(this.destroy$))
      .subscribe(summary => {
        this.summary.set(summary);
      });

    // Écouter les notifications critiques
    this.notificationService.getCriticalNotifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        this.criticalNotifications.set(notifications);
      });

    // Écouter toutes les notifications pour les récentes
    this.notificationService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        const recent = notifications
          .filter(n => !n.isArchived)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, this.maxRecent * 2); // Prendre plus pour avoir de la marge
        
        this.recentNotifications.set(recent);
      });

    // Écouter l'état de chargement
    this.notificationService.isLoading()
    
    // Écouter les erreurs
    this.notificationService.error()
  }

  private loadData(): void {
    this.isLoading.set(true);
    
    // Charger le résumé
    this.notificationService.getNotificationSummary().subscribe({
      next: () => {
        this.isLoading.set(false);
      },
      error: (error) => {
        this.error.set('Erreur lors du chargement des notifications');
        this.isLoading.set(false);
      }
    });

    // Charger les notifications
    this.notificationService.getNotifications({ limit: 20 }).subscribe();
  }

  // === ACTIONS ===

  refresh(): void {
    this.loadData();
  }

  onNotificationClick(notification: Notification): void {
    this.notificationClick.emit(notification);
  }

  viewAllNotifications(): void {
    this.viewAllClick.emit();
  }

  markAsRead(notification: Notification): void {
    this.notificationService.markAsRead(notification.id).subscribe();
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        console.log('✅ All notifications marked as read');
      },
      error: (error) => {
        console.error('❌ Error marking all notifications as read:', error);
      }
    });
  }

  filterByPriority(priority: NotificationPriority): void {
    this.filterClick.emit({ type: 'priority', value: priority });
  }

  showUnreadOnly(): void {
    this.filterClick.emit({ type: 'status', value: 'unread' });
  }

  // === GETTERS ===

  unreadCount(): number {
    return this.summary()?.unread || 0;
  }

  totalNotifications(): number {
    return this.summary()?.total || 0;
  }

  hasCritical(): boolean {
    return (this.summary()?.byPriority?.critical || 0) > 0;
  }

  displayedRecentNotifications(): Notification[] {
    const recent = this.recentNotifications();
    
    if (this.showCriticalOnly) {
      return recent.filter(n => n.priority === 'critical').slice(0, this.maxRecent);
    }
    
    return recent.slice(0, this.maxRecent);
  }

  // === HELPERS ===

  getNotificationIcon(type: NotificationType): string {
    return this.notificationService.getNotificationIcon(type);
  }

  getNotificationClasses(notification: Notification): string {
    return this.notificationService.getNotificationClass(notification.type);
  }

  getNotificationTypeClass(type: NotificationType): string {
    return `type-${type}`;
  }

  getPriorityClass(priority: NotificationPriority): string {
    return this.notificationService.getPriorityClass(priority);
  }

  getPriorityLabel(priority: NotificationPriority): string {
    const labels: Record<NotificationPriority, string> = {
      low: 'Faible',
      medium: 'Moyenne',
      high: 'Élevée',
      critical: 'Critique'
    };
    return labels[priority];
  }

  getTimeAgo(date: Date): string {
    return this.notificationService.getTimeAgo(date);
  }
}