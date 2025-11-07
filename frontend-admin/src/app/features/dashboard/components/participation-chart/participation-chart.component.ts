import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-participation-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-card">
      <h2>Participation des étudiants</h2>
      <div class="chart-placeholder">
        <p>Graphique de participation (à intégrer avec Chart.js ou autre)</p>
      </div>
    </div>
  `,
  styles: [`
    .chart-card {
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

    .chart-placeholder {
      height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f9fafb;
      border-radius: 8px;
      color: #666;
    }
  `]
})
export class ParticipationChartComponent {}
