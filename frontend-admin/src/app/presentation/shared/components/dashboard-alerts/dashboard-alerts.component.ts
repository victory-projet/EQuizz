import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { DashboardService, DashboardAlert } from '../../../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard-alerts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-alerts" [class.compact]="compact">
      <!-- Header -->
      <div class="alerts-header">
        <div class="header-left">
          <h3>
            <span class="material-icons">warning</span>
            Alertes Système
          </h3>
          @if (activeAlerts().length > 0) {
            <span class="alerts-count" [class]="getCountClass()">
              {{ activeAlerts().length }}
            </span>
          }
        </div>
        <div class="header-actions">
          <button class="btn-icon" (click)="refresh()" 
                  [class.loading]="isLoading()"
                  title="Actualiser">
            <span class="material-icons">refresh</span>
          </button>
          @if (showSettings) {
            <button class="btn-icon" (click)="openSettings()" title="Paramètres">
              <span class="material-icons">settings</span>
            </button>
          }
        </div>
      </div>

      <!-- Alerts List -->
      <div class="alerts-content">
        @if (isLoading()) {
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Chargement des alertes...</p>
          </div>
        } @else if (error()) {
          <div class="error-state">
            <span class="material-icons">error</span>
            <p>{{ error() }}</p>
            <button class="btn-primary btn-sm" (click)="refresh()">Réessayer</button>
          </div>
        } @else if (activeAlerts().length > 0) {
          <div class="alerts-list">
            @for (alert of displayedAlerts(); track alert.id) {
              <div class="alert-item" 
                   [class]="getAlertClasses(alert)"
                   [class.action-required]="alert.actionRequired">
                <div class="alert-icon" [style.background-color]="alert.color">
                  <span class="material-icons">{{ alert.icon }}</span>
                </div>
                
                <div class="alert-content" (click)="onAlertClick(alert)">
                  <div class="alert-header">
                    <h4>{{ alert.title }}</h4>
                    <div class="alert-meta">
                      <span class="severity-badge" [class]="getSeverityClass(alert.severity)">
                        {{ getSeverityLabel(alert.severity) }}
                      </span>
                      <span class="alert-time">{{ getTimeAgo(alert.timestamp) }}</span>
                    </div>
                  </div>
                  
                  <p class="alert-message">{{ alert.message }}</p>
                  
                  @if (alert.actionUrl && alert.actionLabel) {
                    <a [href]="alert.actionUrl" class="alert-action" (click)="$event.stopPropagation()">
                      {{ alert.actionLabel }}
                      <span class="material-icons">arrow_forward</span>
                    </a>
                  }
                </div>

                <div class="alert-actions">
                  @if (alert.actionRequired) {
                    <span class="action-indicator" title="Action requise">
                      <span class="material-icons">priority_high</span>
                    </span>
                  }
                  
                  <button class="btn-icon btn-sm" 
                          (click)="resolveAlert(alert)" 
                          title="Marquer comme résolu">
                    <span class="material-icons">check</span>
                  </button>
                  
                  <button class="btn-icon btn-sm btn-danger" 
                          (click)="deleteAlert(alert)" 
                          title="Supprimer">
                    <span class="material-icons">close</span>
                  </button>
                </div>
              </div>
            }
            
            @if (hasMoreAlerts()) {
              <div class="show-more">
                <button class="btn-text" (click)="showAllAlerts()">
                  <span class="material-icons">expand_more</span>
                  Voir toutes les alertes ({{ alerts().length }})
                </button>
              </div>
            }
          </div>
        } @else {
          <div class="empty-state">
            <span class="material-icons">check_circle</span>
            <h4>Aucune alerte active</h4>
            <p>Tous les systèmes fonctionnent normalement</p>
          </div>
        }
      </div>

      <!-- Summary Stats -->
      @if (showSummary && alerts().length > 0) {
        <div class="alerts-summary">
          <div class="summary-item">
            <span class="summary-label">Critiques:</span>
            <span class="summary-value critical">{{ getCriticalCount() }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Erreurs:</span>
            <span class="summary-value error">{{ getErrorCount() }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Avertissements:</span>
            <span class="summary-value warning">{{ getWarningCount() }}</span>
          </div>
        </div>
      }
    </div>
  `,
  styleUrls: ['./dashboard-alerts.component.scss']
})
export class DashboardAlertsComponent implements OnInit, OnDestroy {
  @Input() compact = false;
  @Input() maxDisplayed = 5;
  @Input() showSettings = true;
  @Input() showSummary = true;
  @Input() autoRefresh = true;

  @Output() alertClick = new EventEmitter<DashboardAlert>();
  @Output() settingsClick = new EventEmitter<void>();

  private dashboardService = inject(DashboardService);
  private destroy$ = new Subject<void>();

  // État
  alerts = signal<DashboardAlert[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  showAll = signal(false);

  ngOnInit(): void {
    this.loadAlerts();
    this.setupSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSubscriptions(): void {
    // Écouter les alertes
    this.dashboardService.alerts$
      .pipe(takeUntil(this.destroy$))
      .subscribe(alerts => {
        this.alerts.set(alerts);
      });

    // Écouter l'état de chargement
    this.dashboardService.isLoading()
    
    // Écouter les erreurs
    this.dashboardService.error()
  }

  private loadAlerts(): void {
    this.isLoading.set(true);
    this.dashboardService.getAlerts().subscribe({
      next: () => {
        this.isLoading.set(false);
      },
      error: (error) => {
        this.error.set('Erreur lors du chargement des alertes');
        this.isLoading.set(false);
      }
    });
  }

  // === ACTIONS ===

  refresh(): void {
    this.loadAlerts();
  }

  resolveAlert(alert: DashboardAlert): void {
    this.dashboardService.resolveAlert(alert.id).subscribe({
      next: () => {
        // L'alerte sera automatiquement mise à jour via l'observable
      },
      error: (error) => {
        console.error('Erreur lors de la résolution de l\'alerte:', error);
      }
    });
  }

  deleteAlert(alert: DashboardAlert): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette alerte ?')) {
      this.dashboardService.deleteAlert(alert.id).subscribe({
        next: () => {
          // L'alerte sera automatiquement supprimée via l'observable
        },
        error: (error) => {
          console.error('Erreur lors de la suppression de l\'alerte:', error);
        }
      });
    }
  }

  onAlertClick(alert: DashboardAlert): void {
    this.alertClick.emit(alert);
  }

  showAllAlerts(): void {
    this.showAll.set(true);
  }

  openSettings(): void {
    this.settingsClick.emit();
  }

  // === GETTERS ===

  activeAlerts(): DashboardAlert[] {
    return this.alerts().filter(alert => alert.isActive);
  }

  displayedAlerts(): DashboardAlert[] {
    const active = this.activeAlerts();
    if (this.showAll()) {
      return active;
    }
    return active.slice(0, this.maxDisplayed);
  }

  hasMoreAlerts(): boolean {
    return !this.showAll() && this.activeAlerts().length > this.maxDisplayed;
  }

  getCriticalCount(): number {
    return this.activeAlerts().filter(alert => alert.severity === 'critical').length;
  }

  getErrorCount(): number {
    return this.activeAlerts().filter(alert => alert.severity === 'error').length;
  }

  getWarningCount(): number {
    return this.activeAlerts().filter(alert => alert.severity === 'warning').length;
  }

  // === HELPERS ===

  getAlertClasses(alert: DashboardAlert): string {
    return `alert-${alert.type} severity-${alert.severity}`;
  }

  getSeverityClass(severity: string): string {
    return `severity-${severity}`;
  }

  getSeverityLabel(severity: string): string {
    const labels: Record<string, string> = {
      info: 'Info',
      warning: 'Attention',
      error: 'Erreur',
      critical: 'Critique'
    };
    return labels[severity] || severity;
  }

  getCountClass(): string {
    const criticalCount = this.getCriticalCount();
    const errorCount = this.getErrorCount();
    
    if (criticalCount > 0) return 'count-critical';
    if (errorCount > 0) return 'count-error';
    return 'count-warning';
  }

  getTimeAgo(date: Date): string {
    return this.dashboardService.getTimeAgo(date);
  }
}