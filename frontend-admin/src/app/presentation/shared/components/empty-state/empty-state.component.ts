import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty-state">
      <span class="material-icons empty-icon">{{ icon }}</span>
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
      <button *ngIf="actionText" class="action-btn" (click)="onAction()">
        <span class="material-icons" *ngIf="actionIcon">{{ actionIcon }}</span>
        {{ actionText }}
      </button>
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
    }

    .empty-icon {
      font-size: 80px;
      color: #BDC3C7;
      margin-bottom: 20px;
    }

    h3 {
      font-size: 20px;
      font-weight: 600;
      color: #2C3E50;
      margin: 0 0 8px 0;
    }

    p {
      font-size: 15px;
      color: #7F8C8D;
      margin: 0 0 24px 0;
      max-width: 400px;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: #5B7396;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: #4A5F7F;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(91, 115, 150, 0.3);
      }

      .material-icons {
        font-size: 20px;
      }
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input() title = 'Aucune donnée';
  @Input() message = 'Il n\'y a rien à afficher pour le moment.';
  @Input() actionText = '';
  @Input() actionIcon = '';
  @Output() action = new EventEmitter<void>();

  onAction(): void {
    this.action.emit();
  }
}
