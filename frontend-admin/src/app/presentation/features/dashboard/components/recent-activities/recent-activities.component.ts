import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../../../shared/components/svg-icon/svg-icon';

interface Activity {
  id: string;
  type: 'quiz_created' | 'quiz_completed' | 'student_joined';
  description: string;
  user: string;
  timestamp: Date;
}

@Component({
  selector: 'app-recent-activities',
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  template: `
    <div class="activities-card">
      <div class="card-header">
        <h2>
          <app-svg-icon name="Activity" size="sm" />
          Activités récentes
        </h2>
        <button class="view-all-btn">
          <span>Tout voir</span>
          <app-svg-icon name="ArrowRight" size="xs" />
        </button>
      </div>
      <div class="activities-list">
        @for (activity of activities(); track activity.id) {
          <div class="activity-item">
            <div class="activity-icon" [class]="activity.type">
              @switch (activity.type) {
                @case ('quiz_created') { 
                  <app-svg-icon name="FilePlus" size="sm" />
                }
                @case ('quiz_completed') { 
                  <app-svg-icon name="Check" size="sm" />
                }
                @case ('student_joined') { 
                  <app-svg-icon name="User" size="sm" />
                }
              }
            </div>
            <div class="activity-content">
              <p class="activity-description">{{ activity.description }}</p>
              <div class="activity-meta">
                <span class="activity-user">
                  <app-svg-icon name="User" size="xs" />
                  {{ activity.user }}
                </span>
                <span class="activity-time">
                  <app-svg-icon name="Clock" size="xs" />
                  {{ formatTime(activity.timestamp) }}
                </span>
              </div>
            </div>
          </div>
        } @empty {
          <div class="no-activities">
            <app-svg-icon name="Inbox" size="lg" />
            <p>Aucune activité récente</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    @import '../../../../../../styles.scss';

    .activities-card {
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

    .activities-list {
      display: flex;
      flex-direction: column;
      gap: $spacing-3;
    }

    .activity-item {
      display: flex;
      gap: $spacing-4;
      padding: $spacing-4;
      border-radius: $radius-base;
      background: $bg-secondary;
      transition: all $transition-fast;

      &:hover {
        background: $neutral-100;
        transform: translateX(4px);
      }
    }

    .activity-icon {
      width: 44px;
      height: 44px;
      border-radius: $radius-base;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      &.quiz_created { 
        background: $primary-100; 
        color: $primary-600;
      }
      &.quiz_completed { 
        background: $success-50; 
        color: $success-600;
      }
      &.student_joined { 
        background: $info-50; 
        color: $info-600;
      }
    }

    .activity-content {
      flex: 1;
      min-width: 0;
    }

    .activity-description {
      margin: 0 0 $spacing-2 0;
      color: $text-primary;
      font-size: $text-sm;
      font-weight: $font-medium;
      line-height: $leading-relaxed;
    }

    .activity-meta {
      display: flex;
      gap: $spacing-4;
      font-size: $text-xs;
      color: $text-secondary;
      flex-wrap: wrap;

      .activity-user,
      .activity-time {
        display: inline-flex;
        align-items: center;
        gap: $spacing-1;
      }

      .activity-user {
        font-weight: $font-medium;
      }
    }

    .no-activities {
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
export class RecentActivitiesComponent {
  activities = signal<Activity[]>([
    {
      id: '1',
      type: 'quiz_created',
      description: 'Nouveau quiz "Mathématiques - Chapitre 5" créé',
      user: 'Prof. Martin',
      timestamp: new Date()
    },
    {
      id: '2',
      type: 'quiz_completed',
      description: 'Quiz "Histoire - Révolution" complété par 25 étudiants',
      user: 'Système',
      timestamp: new Date(Date.now() - 1800000)
    },
    {
      id: '3',
      type: 'student_joined',
      description: '3 nouveaux étudiants ont rejoint la classe',
      user: 'Admin',
      timestamp: new Date(Date.now() - 7200000)
    },
    {
      id: '4',
      type: 'quiz_created',
      description: 'Quiz "Physique - Mécanique" publié',
      user: 'Prof. Dubois',
      timestamp: new Date(Date.now() - 10800000)
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
