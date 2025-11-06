import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Activity } from '../../../../shared/interfaces/dashboard.interface';

@Component({
  selector: 'app-recent-activities',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card activities-card">
      <h2>Activités récentes</h2>
      <a href="#" class="view-all">Voir plus</a>
      
      <div *ngFor="let activity of activities" 
           class="activity-item" 
           [ngClass]="{'new-quiz': activity.type === 'quiz'}">
        <span class="icon">{{ activity.icon }}</span>
        <div class="activity-content">
          <p class="activity-title">{{ activity.title }}</p>
          <p class="activity-details">{{ activity.details }}</p>
        </div>
        <p class="activity-time">{{ activity.time }}</p>
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

    .activities-card {
      position: relative;
    }

    .activities-card h2 {
      display: inline-block;
    }

    .view-all {
      position: absolute;
      top: 20px;
      right: 20px;
      text-decoration: none;
      color: #3f51b5;
      font-size: 0.9em;
      font-weight: 600;
    }

    .view-all:hover {
      text-decoration: underline;
    }

    .activity-item {
      display: flex;
      align-items: flex-start;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 15px;
      position: relative;
      background-color: #f9f9f9;
    }

    .activity-item.new-quiz {
      background-color: #fff9c4;
    }

    .icon {
      font-size: 1.5em;
      margin-right: 15px;
      color: #fbc02d;
    }

    .activity-content {
      flex: 1;
    }

    .activity-title {
      font-weight: 600;
      font-size: 0.95em;
      margin: 0 0 4px 0;
    }

    .activity-details {
      font-size: 0.85em;
      color: #666;
      margin: 0;
    }

    .activity-time {
      font-size: 0.85em;
      color: #666;
      margin: 0;
      white-space: nowrap;
      margin-left: 10px;
    }
  `]
})
export class RecentActivitiesComponent {
  @Input() activities: Activity[] = [];
}
