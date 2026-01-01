import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { NotificationService } from '../../../../core/services/notification.service';
import { 
  Notification, 
  Activity, 
  NotificationFilter, 
  ActivityFilter,
  NotificationType,
  NotificationPriority
} from '../../../../core/domain/entities/notification.entity';

@Component({
  selector: 'app-notification-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="notification-panel" [class.compact]="compact">
      <!-- Header -->
      <div class="panel-header">
        <div class="header-left">
          <h3>{{ title }}</h3>
          @if (showUnreadCount && unreadCount() > 0) {
            <span class="unread-badge">{{ unreadCount() }}</span>
          }
        </div>
        <div class="header-actions">
          @if (showFilters) {
            <button class="btn-icon" (click)="toggleFilters()" 
                    [class.active]="showFilterPanel()"
                    title="Filtres">
              <span class="material-icons">filter_list</span>
            </button>
          }
          @if (showMarkAllRead && unreadCount() > 0) {
            <button class="btn-text" (click)="markAllAsRead()">
              <span class="material-icons">done_all</span>
              @if (!compact) {
                <span>Tout marquer comme lu</span>
              }
            </button>
          }
          @if (showRefresh) {
            <button class="btn-icon" (click)="refresh()" 
                    [class.loading]="isLoading()"
                    title="Actualiser">
              <span class="material-icons">refresh</span>
            </button>
          }
          @if (showSettings) {
            <button class="btn-icon" (click)="openSettings()" title="Paramètres">
              <span class="material-icons">settings</span>
            </button>
          }
        </div>
      </div>

      <!-- Filters Panel -->
      @if (showFilterPanel()) {
        <div class="filters-panel">
          <div class="filter-row">
            <div class="filter-group">
              <label>Type</label>
              <select [(ngModel)]="selectedType" (change)="applyFilters()">
                <option value="">Tous les types</option>
                <option value="info">Information</option>
                <option value="success">Succès</option>
                <option value="warning">Avertissement</option>
                <option value="error">Erreur</option>
                <option value="system">Système</option>
              </select>
            </div>

            <div class="filter-group">
              <label>Priorité</label>
              <select [(ngModel)]="selectedPriority" (change)="applyFilters()">
                <option value="">Toutes les priorités</option>
                <option value="low">Faible</option>
                <option value="medium">Moyenne</option>
                <option value="high">Élevée</option>
                <option value="critical">Critique</option>
              </select>
            </div>

            <div class="filter-group">
              <label>Statut</label>
              <select [(ngModel)]="selectedStatus" (change)="applyFilters()">
                <option value="">Tous</option>
                <option value="unread">Non lues</option>
                <option value="read">Lues</option>
              </select>
            </div>

            <div class="filter-group">
              <button class="btn-secondary btn-sm" (click)="clearFilters()">
                <span class="material-icons">clear</span>
                Effacer
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Content -->
      <div class="panel-content" [class.loading]="isLoading()">
        @if (isLoading()) {
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Chargement...</p>
          </div>
        } @else if (error()) {
          <div class="error-state">
            <span class="material-icons">error</span>
            <p>{{ error() }}</p>
            <button class="btn-primary btn-sm" (click)="refresh()">Réessayer</button>
          </div>
        } @else {
          <!-- Tabs -->
          @if (showTabs) {
            <div class="tabs">
              <button class="tab" 
                      [class.active]="activeTab() === 'notifications'"
                      (click)="setActiveTab('notifications')">
                Notifications
                @if (unreadCount() > 0) {
                  <span class="tab-badge">{{ unreadCount() }}</span>
                }
              </button>
              <button class="tab" 
                      [class.active]="activeTab() === 'activities'"
                      (click)="setActiveTab('activities')">
                Activités
              </button>
            </div>
          }

          <!-- Notifications List -->
          @if (activeTab() === 'notifications') {
            <div class="notifications-list">
              @if (displayedNotifications().length > 0) {
                @for (notification of displayedNotifications(); track notification.id) {
                  <div class="notification-item" 
                       [class]="getNotificationClasses(notification)"
                       [class.unread]="!notification.isRead">
                    <div class="notification-icon">
                      <span class="material-icons">{{ getNotificationIcon(notification.type) }}</span>
                    </div>
                    <div class="notification-content" (click)="markAsRead(notification)">
                      <div class="notification-header">
                        <h4>{{ notification.title }}</h4>
                        <div class="notification-meta">
                          <span class="priority-badge" [class]="getPriorityClass(notification.priority)">
                            {{ getPriorityLabel(notification.priority) }}
                          </span>
                          <span class="notification-time">{{ getTimeAgo(notification.createdAt) }}</span>
                        </div>
                      </div>
                      <p class="notification-message">{{ notification.message }}</p>
                      @if (notification.actionUrl && notification.actionLabel) {
                        <a [href]="notification.actionUrl" class="notification-action">
                          {{ notification.actionLabel }}
                          <span class="material-icons">arrow_forward</span>
                        </a>
                      }
                    </div>
                    <div class="notification-actions">
                      @if (!notification.isRead) {
                        <button class="btn-icon btn-sm" 
                                (click)="markAsRead(notification)" 
                                title="Marquer comme lu">
                          <span class="material-icons">check</span>
                        </button>
                      }
                      <button class="btn-icon btn-sm" 
                              (click)="archiveNotification(notification)" 
                              title="Archiver">
                        <span class="material-icons">archive</span>
                      </button>
                      <button class="btn-icon btn-sm btn-danger" 
                              (click)="deleteNotification(notification)" 
                              title="Supprimer">
                        <span class="material-icons">delete</span>
                      </button>
                    </div>
                  </div>
                }
                
                @if (hasMoreNotifications()) {
                  <div class="load-more">
                    <button class="btn-text" (click)="loadMoreNotifications()">
                      <span class="material-icons">expand_more</span>
                      Voir plus de notifications
                    </button>
                  </div>
                }
              } @else {
                <div class="empty-state">
                  <span class="material-icons">notifications_none</span>
                  <h4>Aucune notification</h4>
                  <p>{{ getEmptyMessage('notifications') }}</p>
                </div>
              }
            </div>
          }

          <!-- Activities List -->
          @if (activeTab() === 'activities') {
            <div class="activities-list">
              @if (displayedActivities().length > 0) {
                @for (activity of displayedActivities(); track activity.id) {
                  <div class="activity-item">
                    <div class="activity-icon" [style.background-color]="activity.color">
                      <span class="material-icons">{{ activity.icon }}</span>
                    </div>
                    <div class="activity-content">
                      <div class="activity-header">
                        <h4>{{ activity.title }}</h4>
                        <span class="activity-time">{{ getTimeAgo(activity.createdAt) }}</span>
                      </div>
                      <p class="activity-description">{{ activity.description }}</p>
                      <div class="activity-meta">
                        <span class="activity-user">
                          <span class="material-icons">person</span>
                          {{ activity.userName }}
                        </span>
                        <span class="activity-role">{{ getRoleLabel(activity.userRole) }}</span>
                      </div>
                    </div>
                  </div>
                }
                
                @if (hasMoreActivities()) {
                  <div class="load-more">
                    <button class="btn-text" (click)="loadMoreActivities()">
                      <span class="material-icons">expand_more</span>
                      Voir plus d'activités
                    </button>
                  </div>
                }
              } @else {
                <div class="empty-state">
                  <span class="material-icons">inbox</span>
                  <h4>Aucune activité</h4>
                  <p>{{ getEmptyMessage('activities') }}</p>
                </div>
              }
            </div>
          }
        }
      </div>
    </div>
  `,
  styleUrls: ['./notification-panel.component.scss']
})
export class NotificationPanelComponent implements OnInit, OnDestroy {
  @Input() title = 'Notifications';
  @Input() compact = false;
  @Input() showTabs = true;
  @Input() showFilters = true;
  @Input() showMarkAllRead = true;
  @Input() showRefresh = true;
  @Input() showSettings = true;
  @Input() showUnreadCount = true;
  @Input() maxItems = 20;
  @Input() defaultTab: 'notifications' | 'activities' = 'notifications';

  @Output() notificationClick = new EventEmitter<Notification>();
  @Output() activityClick = new EventEmitter<Activity>();
  @Output() settingsClick = new EventEmitter<void>();

  private notificationService = inject(NotificationService);
  private destroy$ = new Subject<void>();

  // État
  notifications = signal<Notification[]>([]);
  activities = signal<Activity[]>([]);
  unreadCount = signal(0);
  isLoading = signal(false);
  error = signal<string | null>(null);

  // UI State
  activeTab = signal<'notifications' | 'activities'>('notifications');
  showFilterPanel = signal(false);

  // Filtres
  selectedType = '';
  selectedPriority = '';
  selectedStatus = '';

  // Pagination
  notificationOffset = 0;
  activityOffset = 0;
  hasMoreNotifications = signal(false);
  hasMoreActivities = signal(false);

  ngOnInit(): void {
    this.activeTab.set(this.defaultTab);
    this.loadData();
    this.setupSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSubscriptions(): void {
    // Écouter les notifications
    this.notificationService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        this.notifications.set(notifications);
      });

    // Écouter les activités
    this.notificationService.activities$
      .pipe(takeUntil(this.destroy$))
      .subscribe(activities => {
        this.activities.set(activities);
      });

    // Écouter le nombre de non lues
    this.notificationService.getUnreadCount()
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.unreadCount.set(count);
      });

    // Écouter l'état de chargement
    this.notificationService.isLoading()
    
    // Écouter les erreurs  
    this.notificationService.error()
  }

  private loadData(): void {
    this.loadNotifications();
    this.loadActivities();
  }

  private loadNotifications(): void {
    const filter = this.buildNotificationFilter();
    this.notificationService.getNotifications(filter).subscribe();
  }

  private loadActivities(): void {
    const filter = this.buildActivityFilter();
    this.notificationService.getActivities(filter).subscribe();
  }

  private buildNotificationFilter(): NotificationFilter {
    const filter: NotificationFilter = {
      limit: this.maxItems,
      offset: this.notificationOffset
    };

    if (this.selectedType) {
      filter.type = [this.selectedType as NotificationType];
    }

    if (this.selectedPriority) {
      filter.priority = [this.selectedPriority as NotificationPriority];
    }

    if (this.selectedStatus === 'unread') {
      filter.isRead = false;
    } else if (this.selectedStatus === 'read') {
      filter.isRead = true;
    }

    return filter;
  }

  private buildActivityFilter(): ActivityFilter {
    return {
      limit: this.maxItems,
      offset: this.activityOffset
    };
  }

  // === ACTIONS ===

  setActiveTab(tab: 'notifications' | 'activities'): void {
    this.activeTab.set(tab);
  }

  toggleFilters(): void {
    this.showFilterPanel.set(!this.showFilterPanel());
  }

  applyFilters(): void {
    this.notificationOffset = 0;
    this.loadNotifications();
  }

  clearFilters(): void {
    this.selectedType = '';
    this.selectedPriority = '';
    this.selectedStatus = '';
    this.applyFilters();
  }

  refresh(): void {
    this.notificationOffset = 0;
    this.activityOffset = 0;
    this.loadData();
  }

  markAsRead(notification: Notification): void {
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id).subscribe();
    }
    this.notificationClick.emit(notification);
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

  archiveNotification(notification: Notification): void {
    this.notificationService.archiveNotification(notification.id).subscribe();
  }

  deleteNotification(notification: Notification): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette notification ?')) {
      this.notificationService.deleteNotification(notification.id).subscribe();
    }
  }

  loadMoreNotifications(): void {
    this.notificationOffset += this.maxItems;
    this.loadNotifications();
  }

  loadMoreActivities(): void {
    this.activityOffset += this.maxItems;
    this.loadActivities();
  }

  openSettings(): void {
    this.settingsClick.emit();
  }

  // === GETTERS ===

  displayedNotifications(): Notification[] {
    return this.notifications().filter(n => !n.isArchived);
  }

  displayedActivities(): Activity[] {
    return this.activities();
  }

  // === HELPERS ===

  getNotificationIcon(type: NotificationType): string {
    return this.notificationService.getNotificationIcon(type);
  }

  getNotificationClasses(notification: Notification): string {
    const typeClass = this.notificationService.getNotificationClass(notification.type);
    const priorityClass = this.notificationService.getPriorityClass(notification.priority);
    return `${typeClass} ${priorityClass}`;
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

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      'ADMIN': 'Administrateur',
      'ENSEIGNANT': 'Enseignant',
      'ETUDIANT': 'Étudiant'
    };
    return labels[role] || role;
  }

  getTimeAgo(date: Date): string {
    return this.notificationService.getTimeAgo(date);
  }

  getEmptyMessage(type: 'notifications' | 'activities'): string {
    if (type === 'notifications') {
      if (this.selectedStatus === 'unread') {
        return 'Toutes les notifications ont été lues';
      }
      return 'Aucune notification pour le moment';
    } else {
      return 'Aucune activité récente';
    }
  }
}