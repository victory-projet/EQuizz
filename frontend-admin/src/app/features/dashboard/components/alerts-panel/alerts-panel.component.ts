import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Alert {
  id: string;
  type: 'info' | 'warning' | 'success';
  message: string;
  timestamp: Date;
}

@Component({
  selector: 'app-alerts-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="alerts-card">
      <h2>Alertes et notifications</h2>
      <div class="alerts-list">
        @for (alert of alerts(); track alert.id) {
          <div class="alert-item" [class]="alert.type">
            <div class="alert-icon">
              @switch (alert.type) {
                @case ('info') { ℹ️ }
                @case ('warning') { ⚠️ }
                @case ('success') { ✅ }
              }
            </div>
            <div class="alert-content">
              <p>{{ alert.message }}</p>
              <span class="alert-time">{{ formatTime(alert.timestamp) }}</span>
            </div>
          </div>
        } @empty {
          <p class="no-alerts">Aucune alerte pour le moment</p>
        }
      </div>
    </div>
  `,
  styles: [`
    .alerts-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

      h2 {
        font-size: 1.25rem;
        font-weight: 600;
        margin: 0 0 1.5rem 0;
        color: #1a1a1a;
      }
    }

    .alerts-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .alert-item {
      display: flex;
      gap: 0.75rem;
      padding: 1rem;
      border-radius: 8px;
      border-left: 4px solid;

      &.info {
        background: #eff6ff;
        border-color: #3b82f6;
      }

      &.warning {
        background: #fffbeb;
        border-color: #f59e0b;
      }

      &.success {
        background: #f0fdf4;
        border-color: #10b981;
      }
    }

    .alert-icon {
      font-size: 1.25rem;
    }

    .alert-content {
      flex: 1;

      p {
        margin: 0 0 0.25rem 0;
        color: #1a1a1a;
        font-size: 0.875rem;
      }

      .alert-time {
        font-size: 0.75rem;
        color: #666;
      }
    }

    .no-alerts {
      text-align: center;
      color: #666;
      padding: 2rem;
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
