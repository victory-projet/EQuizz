import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { DashboardService, RecentActivity } from '../../../../core/services/dashboard.service';

@Component({
  selector: 'app-recent-activities',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="recent-activities" [class.compact]="compact">
      <!-- Header -->
      <div class="activities-header">
        <div class="header-left">
          <h3>
            <span class="material-icons">history</span>
            Activités Récentes
          </h3>
          @if (activities().length > 0) {
            <span class="activities-count">{{ activities().length }}</span>
          }
        </div>
        <div class="header-actions">
          <button class="btn-icon" (click)="refresh()" 
                  [class.loading]="isLoading()"
                  title="Actualiser">
            <span class="material-icons">refresh</span>
          </button>
          @if (showViewAll) {
            <button class="btn-text" (click)="viewAllActivities()">
              <span class="material-icons">open_in_new</span>
              @if (!compact) {
                <span>Voir tout</span>
              }
            </button>
          }
        </div>
      </div>

      <!-- Activities List -->
      <div class="activities-content">
        @if (isLoading()) {
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Chargement des activités...</p>
          </div>
        } @else if (error()) {
          <div class="error-state">
            <span class="material-icons">error</span>
            <p>{{ error() }}</p>
            <button class="btn-primary btn-sm" (click)="refresh()">Réessayer</button>
          </div>
        } @else if (displayedActivities().length > 0) {
          <div class="activities-list">
            @for (activity of displayedActivities(); track activity.id) {
              <div class="activity-item" 
                   [class]="getActivityClasses(activity)"
                   (click)="onActivityClick(activity)">
                <div class="activity-icon" [style.background-color]="activity.color">
                  <span class="material-icons">{{ activity.icon }}</span>
                </div>
                
                <div class="activity-content">
                  <div class="activity-header">
                    <h4>{{ activity.title }}</h4>
                    <span class="activity-time">{{ getTimeAgo(activity.timestamp) }}</span>
                  </div>
                  
                  <p class="activity-description">{{ activity.description }}</p>
                  
                  <div class="activity-meta">
                    <div class="activity-user">
                      @if (activity.user.avatar) {
                        <img [src]="activity.user.avatar" [alt]="activity.user.name" class="user-avatar">
                      } @else {
                        <div class="user-avatar-placeholder">
                          <span class="material-icons">person</span>
                        </div>
                      }
                      <div class="user-info">
                        <span class="user-name">{{ activity.user.name }}</span>
                        <span class="user-role">{{ getRoleLabel(activity.user.role) }}</span>
                      </div>
                    </div>
                    
                    <div class="activity-category">
                      <span class="category-badge" [class]="getCategoryClass(activity.category)">
                        {{ getCategoryLabel(activity.category) }}
                      </span>
                    </div>
                  </div>
                </div>

                @if (showActions) {
                  <div class="activity-actions">
                    <button class="btn-icon btn-sm" 
                            (click)="viewActivityDetails(activity); $event.stopPropagation()" 
                            title="Voir les détails">
                      <span class="material-icons">info</span>
                    </button>
                  </div>
                }
              </div>
            }
            
            @if (hasMoreActivities()) {
              <div class="show-more">
                <button class="btn-text" (click)="loadMoreActivities()">
                  <span class="material-icons">expand_more</span>
                  Voir plus d'activités
                </button>
              </div>
            }
          </div>
        } @else {
          <div class="empty-state">
            <span class="material-icons">inbox</span>
            <h4>Aucune activité récente</h4>
            <p>Les activités apparaîtront ici dès qu'elles se produiront</p>
          </div>
        }
      </div>

      <!-- Filter Bar -->
      @if (showFilters && activities().length > 0) {
        <div class="activities-filters">
          <div class="filter-tabs">
            <button class="filter-tab" 
                    [class.active]="selectedCategory() === 'all'"
                    (click)="filterByCategory('all')">
              Toutes
            </button>
            <button class="filter-tab" 
                    [class.active]="selectedCategory() === 'user'"
                    (click)="filterByCategory('user')">
              Utilisateurs
            </button>
            <button class="filter-tab" 
                    [class.active]="selectedCategory() === 'evaluation'"
                    (click)="filterByCategory('evaluation')">
              Évaluations
            </button>
            <button class="filter-tab" 
                    [class.active]="selectedCategory() === 'system'"
                    (click)="filterByCategory('system')">
              Système
            </button>
          </div>
        </div>
      }

      <!-- Summary Stats -->
      @if (showSummary && activities().length > 0) {
        <div class="activities-summary">
          <div class="summary-stats">
            <div class="stat-item">
              <span class="stat-value">{{ getTodayCount() }}</span>
              <span class="stat-label">Aujourd'hui</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ getThisWeekCount() }}</span>
              <span class="stat-label">Cette semaine</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ getUniqueUsersCount() }}</span>
              <span class="stat-label">Utilisateurs actifs</span>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styleUrls: ['./recent-activities.component.scss']
})
export class RecentActivitiesComponent implements OnInit, OnDestroy {
  @Input() compact = false;
  @Input() maxDisplayed = 10;
  @Input() showFilters = true;
  @Input() showSummary = true;
  @Input() showActions = true;
  @Input() showViewAll = true;
  @Input() autoRefresh = true;

  @Output() activityClick = new EventEmitter<RecentActivity>();
  @Output() viewAllClick = new EventEmitter<void>();
  @Output() activityDetailsClick = new EventEmitter<RecentActivity>();

  private dashboardService = inject(DashboardService);
  private destroy$ = new Subject<void>();

  // État
  activities = signal<RecentActivity[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  selectedCategory = signal<string>('all');
  showAll = signal(false);

  ngOnInit(): void {
    this.loadActivities();
    this.setupSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSubscriptions(): void {
    // Écouter les activités
    this.dashboardService.recentActivities$
      .pipe(takeUntil(this.destroy$))
      .subscribe(activities => {
        this.activities.set(activities);
      });

    // Écouter l'état de chargement
    this.dashboardService.isLoading()
    
    // Écouter les erreurs
    this.dashboardService.error()
  }

  private loadActivities(): void {
    this.isLoading.set(true);
    this.dashboardService.getRecentActivities(this.maxDisplayed * 2).subscribe({
      next: () => {
        this.isLoading.set(false);
      },
      error: (error) => {
        this.error.set('Erreur lors du chargement des activités');
        this.isLoading.set(false);
      }
    });
  }

  // === ACTIONS ===

  refresh(): void {
    this.loadActivities();
  }

  onActivityClick(activity: RecentActivity): void {
    this.activityClick.emit(activity);
  }

  viewAllActivities(): void {
    this.viewAllClick.emit();
  }

  viewActivityDetails(activity: RecentActivity): void {
    this.activityDetailsClick.emit(activity);
  }

  loadMoreActivities(): void {
    this.showAll.set(true);
  }

  filterByCategory(category: string): void {
    this.selectedCategory.set(category);
  }

  // === GETTERS ===

  displayedActivities(): RecentActivity[] {
    let filtered = this.activities();

    // Filtrer par catégorie
    if (this.selectedCategory() !== 'all') {
      filtered = filtered.filter(activity => activity.category === this.selectedCategory());
    }

    // Limiter le nombre d'éléments affichés
    if (!this.showAll()) {
      filtered = filtered.slice(0, this.maxDisplayed);
    }

    return filtered;
  }

  hasMoreActivities(): boolean {
    const filtered = this.selectedCategory() === 'all' 
      ? this.activities() 
      : this.activities().filter(a => a.category === this.selectedCategory());
    
    return !this.showAll() && filtered.length > this.maxDisplayed;
  }

  getTodayCount(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return this.activities().filter(activity => {
      const activityDate = new Date(activity.timestamp);
      activityDate.setHours(0, 0, 0, 0);
      return activityDate.getTime() === today.getTime();
    }).length;
  }

  getThisWeekCount(): number {
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    weekStart.setHours(0, 0, 0, 0);
    
    return this.activities().filter(activity => 
      new Date(activity.timestamp) >= weekStart
    ).length;
  }

  getUniqueUsersCount(): number {
    const uniqueUsers = new Set(this.activities().map(activity => activity.user.id));
    return uniqueUsers.size;
  }

  // === HELPERS ===

  getActivityClasses(activity: RecentActivity): string {
    return `activity-${activity.category}`;
  }

  getCategoryClass(category: string): string {
    return `category-${category}`;
  }

  getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      user: 'Utilisateur',
      evaluation: 'Évaluation',
      system: 'Système',
      security: 'Sécurité'
    };
    return labels[category] || category;
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
    return this.dashboardService.getTimeAgo(date);
  }
}