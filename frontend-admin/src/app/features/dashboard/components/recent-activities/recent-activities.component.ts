import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule],
  template: `
    <div class="activities-card">
      <h2>Activités récentes</h2>
      <div class="activities-list">
        @for (activity of activities(); track activity.id) {
          <div class="activity-item">
            <div class="activity-icon" [class]="activity.type">
              @switch (activity.type) {
                @case ('quiz_created') { 📝 }
                @case ('quiz_completed') { ✅ }
                @case ('student_joined') { 👤 }
              }
            </div>
            <div class="activity-content">
              <p class="activity-description">{{ activity.description }}</p>
              <div class="activity-meta">
                <span class="activity-user">{{ activity.user }}</span>
                <span class="activity-time">{{ formatTime(activity.timestamp) }}</span>
              </div>
            </div>
          </div>
        } @empty {
          <p class="no-activities">Aucune activité récente</p>
        }
      </div>
    </div>
  `,
  styles: [`
    .activities-card {
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

    .activities-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .activity-item {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      border-radius: 8px;
      background: #f9fafb;
      transition: background 0.2s;

      &:hover {
        background: #f3f4f6;
      }
    }

    .activity-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      flex-shrink: 0;

      &.quiz_created { background: #e0e7ff; }
      &.quiz_completed { background: #d1fae5; }
      &.student_joined { background: #dbeafe; }
    }

    .activity-content {
      flex: 1;
      min-width: 0;
    }

    .activity-description {
      margin: 0 0 0.5rem 0;
      color: #1a1a1a;
      font-size: 0.875rem;
    }

    .activity-meta {
      display: flex;
      gap: 1rem;
      font-size: 0.75rem;
      color: #666;

      .activity-user {
        font-weight: 500;
      }
    }

    .no-activities {
      text-align: center;
      color: #666;
      padding: 2rem;
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
