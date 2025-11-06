import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Alert } from '../../../../shared/interfaces/dashboard.interface';

@Component({
  selector: 'app-alerts-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card alerts-card">
      <h2>Alertes & Suivi</h2>
      <div *ngFor="let alert of alerts" class="alert-item">
        <div class="alert-content">
          <p class="alert-title">{{ alert.title }}</p>
          <p class="alert-details">{{ alert.details }}</p>
        </div>
        <span class="alert-action">+</span>
      </div>
    </div>
  `,
  styles: [`
    .card {
      background-color: #fff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }

    .card h2 {
      font-size: 1.2em;
      margin-bottom: 20px;
      font-weight: 600;
    }

    .alerts-card {
      display: flex;
      flex-direction: column;
    }

    .alert-item {
      padding: 15px 0;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .alert-item:last-child {
      border-bottom: none;
    }

    .alert-content {
      flex: 1;
    }

    .alert-title {
      font-weight: 600;
      font-size: 0.95em;
      color: #3f51b5;
      margin: 0 0 4px 0;
    }

    .alert-details {
      font-size: 0.85em;
      color: #666;
      margin: 0;
    }

    .alert-action {
      font-size: 1.5em;
      color: #999;
      cursor: pointer;
      font-weight: 300;
      transition: color 0.2s;
    }

    .alert-action:hover {
      color: #3f51b5;
    }
  `]
})
export class AlertsPanelComponent {
  @Input() alerts: Alert[] = [];
}
