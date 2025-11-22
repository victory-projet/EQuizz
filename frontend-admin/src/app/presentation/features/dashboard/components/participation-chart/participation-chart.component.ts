import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ChartData {
  label: string;
  value: number;
  color: string;
}

@Component({
  selector: 'app-participation-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-card">
      <h2>Participation des étudiants</h2>
      <div class="chart-container">
        <div class="bar-chart">
          @for (item of chartData(); track item.label) {
            <div class="bar-item">
              <div class="bar-wrapper">
                <div 
                  class="bar" 
                  [style.height.%]="item.value"
                  [style.background-color]="item.color"
                  [title]="item.label + ': ' + item.value + '%'">
                </div>
              </div>
              <div class="bar-label">{{ item.label }}</div>
              <div class="bar-value">{{ item.value }}%</div>
            </div>
          }
        </div>
        <div class="chart-legend">
          <div class="legend-item">
            <span class="legend-dot" style="background: #4f46e5"></span>
            <span>Taux de participation moyen</span>
          </div>
        </div>
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

    .chart-container {
      height: 300px;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .bar-chart {
      flex: 1;
      display: flex;
      align-items: flex-end;
      justify-content: space-around;
      gap: 1rem;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 8px;
    }

    .bar-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .bar-wrapper {
      width: 100%;
      height: 200px;
      display: flex;
      align-items: flex-end;
      justify-content: center;
    }

    .bar {
      width: 60%;
      min-height: 20px;
      border-radius: 4px 4px 0 0;
      transition: all 0.3s ease;
      cursor: pointer;

      &:hover {
        opacity: 0.8;
        transform: translateY(-4px);
      }
    }

    .bar-label {
      font-size: 0.75rem;
      color: #666;
      text-align: center;
      font-weight: 500;
    }

    .bar-value {
      font-size: 0.875rem;
      color: #1a1a1a;
      font-weight: 600;
    }

    .chart-legend {
      display: flex;
      justify-content: center;
      gap: 1.5rem;
      padding-top: 0.5rem;
      border-top: 1px solid #e5e7eb;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: #666;
    }

    .legend-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }
  `]
})
export class ParticipationChartComponent {
  chartData = signal<ChartData[]>([
    { label: 'Lun', value: 75, color: '#4f46e5' },
    { label: 'Mar', value: 82, color: '#4f46e5' },
    { label: 'Mer', value: 68, color: '#4f46e5' },
    { label: 'Jeu', value: 90, color: '#4f46e5' },
    { label: 'Ven', value: 85, color: '#4f46e5' },
    { label: 'Sam', value: 45, color: '#4f46e5' },
    { label: 'Dim', value: 30, color: '#4f46e5' }
  ]);
}
