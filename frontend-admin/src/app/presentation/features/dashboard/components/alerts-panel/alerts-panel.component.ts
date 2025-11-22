import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../../../shared/components/svg-icon/svg-icon';

interface Alert {
  id: string;
  type: 'info' | 'warning' | 'success';
  message: string;
  timestamp: Date;
}

@Component({
  selector: 'app-alerts-panel',
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  template: `
    <div class="alerts-card">
      <div class="card-header">
        <h2>
          <app-svg-icon name="Bell" size="sm" />
          Alertes et notifications
        </h2>
        <button class="view-all-btn">
          <span>Tout voir</span>
          <app-svg-icon name="ArrowRight" size="xs" />
        </button>
      </div>
      <div class="alerts-list">
        @for (alert of alerts(); track alert.id) {
          <div class="alert-item" [class]="alert.type">
            <div class="alert-icon">
              @switch (alert.type) {
                @case ('info') { 
                  <app-svg-icon name="Info" size="sm" />
                }
                @case ('warning') { 
                  <app-svg-icon name="Info" size="sm" />
                }
                @case ('success') { 
                  <app-svg-icon name="Check" size="sm" />
                }
              }
            </div>
            <div class="alert-content">
              <p>{{ alert.message }}</p>
              <span class="alert-time">
                <app-svg-icon name="Clock" size="xs" />
                {{ formatTime(alert.timestamp) }}
              </span>
            </div>
          </div>
        } @empty {
          <div class="no-alerts">
            <app-svg-icon name="Check" size="lg" />
            <p>Aucune alerte pour le moment</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    @import '../../../../../../styles.scss';

    .alerts-card {
      h2 {
        display: flex;
        align-items: center;
        gap: $spacing-2;
        font-size: $text-xl;
        font-weight: $font-semibold;
        margin: 0;
        color: $text-primary;
      }
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: $spacing-6;
      gap: $spacing-4;
    }

    .view-all-btn {
      display: flex;
      align-items: center;
      gap: $spacing-1;
      padding: $spacing-2 $spacing-3;
      font-size: $text-xs;
      font-weight: $font-medium;
      color: $primary-500;
      background: transparent;
      border: none;
      border-radius: $radius-sm;
      cursor: pointer;
      transition: all $transition-fast;

      &:hover {
        background: $primary-50;
        color: $primary-600;
      }
    }

    .alerts-list {
      display: flex;
      flex-direction: column;
      gap: $spacing-3;
      max-height: 400px;
      overflow-y: auto;
    }

    .alert-item {
      display: flex;
      gap: $spacing-3;
      padding: $spacing-4;
      border-radius: $radius-base;
      border-left: 3px solid;
      transition: all $transition-fast;

      &:hover {
        transform: translateX(4px);
      }

      &.info {
        background: $info-50;
        border-color: $info-500;

        .alert-icon {
          color: $info-600;
        }
      }

      &.warning {
        background: $warning-50;
        border-color: $warning-500;

        .alert-icon {
          color: $warning-700;
        }
      }

      &.success {
        background: $success-50;
        border-color: $success-500;

        .alert-icon {
          color: $success-600;
        }
      }
    }

    .alert-icon {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .alert-content {
      flex: 1;
      min-width: 0;

      p {
        margin: 0 0 $spacing-2 0;
        color: $text-primary;
        font-size: $text-sm;
        line-height: $leading-relaxed;
      }

      .alert-time {
        display: inline-flex;
        align-items: center;
        gap: $spacing-1;
        font-size: $text-xs;
        color: $text-secondary;
      }
    }

    .no-alerts {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: $spacing-12 $spacing-4;
      text-align: center;
      color: $text-tertiary;

      p {
        margin: $spacing-3 0 0 0;
        font-size: $text-sm;
      }
    }
  `]
})
export class AlertsPanelComponent {
  alerts = signal<Alert[]>([
    {
      id: '1',
      type: 'info',
      message: '5 nouveaux quiz en attente de publication',
      timestamp: new Date()
    },
    {
      id: '2',
      type: 'warning',
      message: 'Taux de participation faible cette semaine',
      timestamp: new Date(Date.now() - 3600000)
    },
    {
      id: '3',
      type: 'success',
      message: 'Tous les quiz de la semaine ont été complétés',
      timestamp: new Date(Date.now() - 7200000)
    }
  ]);

  formatTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${Math.floor(hours / 24)}j`;
  }
}
