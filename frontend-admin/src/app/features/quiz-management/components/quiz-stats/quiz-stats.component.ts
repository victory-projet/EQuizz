import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface QuizStats {
  totalAttempts: number;
  averageScore: number;
  completionRate: number;
  averageTime: number;
}

@Component({
  selector: 'app-quiz-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stats-container">
      <div class="stat-item">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <span class="stat-value">{{ stats().totalAttempts }}</span>
          <span class="stat-label">Tentatives</span>
        </div>
      </div>

      <div class="stat-item">
        <div class="stat-icon">⭐</div>
        <div class="stat-content">
          <span class="stat-value">{{ stats().averageScore }}%</span>
          <span class="stat-label">Score moyen</span>
        </div>
      </div>

      <div class="stat-item">
        <div class="stat-icon">✓</div>
        <div class="stat-content">
          <span class="stat-value">{{ stats().completionRate }}%</span>
          <span class="stat-label">Taux de complétion</span>
        </div>
      </div>

      <div class="stat-item">
        <div class="stat-icon">⏱️</div>
        <div class="stat-content">
          <span class="stat-value">{{ stats().averageTime }}min</span>
          <span class="stat-label">Temps moyen</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stats-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      padding: 1rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 8px;
    }

    .stat-icon {
      font-size: 2rem;
    }

    .stat-content {
      display: flex;
      flex-direction: column;

      .stat-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: #1a1a1a;
      }

      .stat-label {
        font-size: 0.75rem;
        color: #666;
      }
    }
  `]
})
export class QuizStatsComponent {
  stats = input.required<QuizStats>();
}
