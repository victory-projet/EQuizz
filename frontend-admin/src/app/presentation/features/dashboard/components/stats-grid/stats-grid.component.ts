import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../../../shared/components/svg-icon/svg-icon';
import { AnalyticsData } from '../../../../../core/models/quiz.interface';

@Component({
  selector: 'app-stats-grid',
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  template: `
    <div class="stats-grid">
      <div class="stat-card quiz">
        <div class="stat-icon">
          <app-svg-icon name="FileText" size="lg" />
        </div>
        <div class="stat-content">
          <h3>{{ data().totalQuizzes }}</h3>
          <p>Quiz créés</p>
          <div class="stat-trend positive">
            <app-svg-icon name="TrendingUp" size="xs" />
            <span>+12%</span>
          </div>
        </div>
      </div>

      <div class="stat-card students">
        <div class="stat-icon">
          <app-svg-icon name="Users" size="lg" />
        </div>
        <div class="stat-content">
          <h3>{{ data().totalStudents }}</h3>
          <p>Étudiants actifs</p>
          <div class="stat-trend positive">
            <app-svg-icon name="TrendingUp" size="xs" />
            <span>+8%</span>
          </div>
        </div>
      </div>

      <div class="stat-card score">
        <div class="stat-icon">
          <app-svg-icon name="Award" size="lg" />
        </div>
        <div class="stat-content">
          <h3>{{ data().averageScore }}%</h3>
          <p>Score moyen</p>
          <div class="stat-trend positive">
            <app-svg-icon name="TrendingUp" size="xs" />
            <span>+5%</span>
          </div>
        </div>
      </div>

      <div class="stat-card completion">
        <div class="stat-icon">
          <app-svg-icon name="Check" size="lg" />
        </div>
        <div class="stat-content">
          <h3>{{ data().completionRate }}%</h3>
          <p>Taux de complétion</p>
          <div class="stat-trend negative">
            <app-svg-icon name="TrendingDown" size="xs" />
            <span>-3%</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @import '../../../../../../styles.scss';

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: $spacing-6;
      margin-bottom: $spacing-2;

      @media (max-width: $breakpoint-sm) {
        grid-template-columns: 1fr;
      }
    }

    .stat-card {
      background: $bg-primary;
      border-radius: $radius-lg;
      padding: $spacing-6;
      display: flex;
      align-items: flex-start;
      gap: $spacing-4;
      box-shadow: $shadow-sm;
      transition: all $transition-base;
      border-left: 4px solid;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        width: 100px;
        height: 100px;
        border-radius: 50%;
        opacity: 0.05;
        transform: translate(30%, -30%);
      }

      &:hover {
        transform: translateY(-4px);
        box-shadow: $shadow-lg;
      }

      &.quiz {
        border-left-color: $primary-500;
        &::before { background: $primary-500; }
        .stat-icon { background: $primary-100; color: $primary-600; }
      }

      &.students {
        border-left-color: $info-500;
        &::before { background: $info-500; }
        .stat-icon { background: $info-50; color: $info-600; }
      }

      &.score {
        border-left-color: $warning-500;
        &::before { background: $warning-500; }
        .stat-icon { background: $warning-50; color: $warning-700; }
      }

      &.completion {
        border-left-color: $success-500;
        &::before { background: $success-500; }
        .stat-icon { background: $success-50; color: $success-600; }
      }
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: $radius-base;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      position: relative;
      z-index: 1;
    }

    .stat-content {
      flex: 1;
      position: relative;
      z-index: 1;

      h3 {
        font-size: $text-3xl;
        font-weight: $font-bold;
        color: $text-primary;
        margin: 0 0 $spacing-1 0;
        line-height: 1;
      }

      p {
        color: $text-secondary;
        margin: 0 0 $spacing-2 0;
        font-size: $text-sm;
        font-weight: $font-medium;
      }
    }

    .stat-trend {
      display: inline-flex;
      align-items: center;
      gap: $spacing-1;
      padding: $spacing-1 $spacing-2;
      border-radius: $radius-sm;
      font-size: $text-xs;
      font-weight: $font-semibold;

      &.positive {
        background: $success-50;
        color: $success-700;
      }

      &.negative {
        background: $error-50;
        color: $error-700;
      }

      span {
        line-height: 1;
      }
    }
  `]
})
export class StatsGridComponent {
  data = input.required<AnalyticsData>();
}
