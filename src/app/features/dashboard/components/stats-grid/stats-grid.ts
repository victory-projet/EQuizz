import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatCard } from '../../../../shared/interfaces/dashboard.interface';

@Component({
  selector: 'app-stats-grid',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="stats-grid">
      <div *ngFor="let stat of stats" class="stat-card">
        <h3>{{ stat.title }}</h3>
        <p class="stat-number">{{ stat.value }}</p>
        <p class="stat-change" [ngClass]="stat.changeType">{{ stat.change }}</p>
      </div>
    </section>
  `,
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      background-color: #fff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      text-align: center;
    }

    .stat-card h3 {
      font-size: 0.9em;
      color: #666;
      margin-bottom: 10px;
    }

    .stat-number {
      font-size: 2.2em;
      font-weight: bold;
      color: #333;
      margin-bottom: 5px;
    }

    .stat-change {
      font-size: 0.9em;
      font-weight: 600;
    }

    .stat-change.positive {
      color: #4caf50;
    }

    .stat-change.negative {
      color: #f44336;
    }

    .stat-change.neutral {
      color: #999;
    }

    @media (max-width: 1024px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class StatsGrid {
  @Input() stats: StatCard[] = [];
}
