import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsData } from '../../../../core/models/quiz.interface';

@Component({
  selector: 'app-stats-grid',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon quiz">📝</div>
        <div class="stat-content">
          <h3>{{ data().totalQuizzes }}</h3>
          <p>Quiz créés</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon students">👥</div>
        <div class="stat-content">
          <h3>{{ data().totalStudents }}</h3>
          <p>Étudiants actifs</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon score">⭐</div>
        <div class="stat-content">
          <h3>{{ data().averageScore }}%</h3>
          <p>Score moyen</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon completion">✓</div>
        <div class="stat-content">
          <h3>{{ data().completionRate }}%</h3>
          <p>Taux de complétion</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
    }

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;

      &.quiz { background: #e0e7ff; }
      &.students { background: #dbeafe; }
      &.score { background: #fef3c7; }
      &.completion { background: #d1fae5; }
    }

    .stat-content {
      h3 {
        font-size: 1.75rem;
        font-weight: 700;
        color: #1a1a1a;
        margin: 0 0 0.25rem 0;
      }

      p {
        color: #666;
        margin: 0;
        font-size: 0.875rem;
      }
    }
  `]
})
export class StatsGridComponent {
  data = input.required<AnalyticsData>();
}
