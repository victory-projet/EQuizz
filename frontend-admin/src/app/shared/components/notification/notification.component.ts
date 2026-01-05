import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Notification, NotificationAction } from '../../../core/domain/entities/notification.entity';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification" [class]="'notification-' + notification.type">
      <div class="notification-icon">
        <i class="material-icons">{{ getIcon() }}</i>
      </div>
      
      <div class="notification-content">
        <div class="notification-title">{{ notification.title }}</div>
        <div class="notification-message">{{ notification.message }}</div>
        
        @if (notification.actions && notification.actions.length > 0) {
          <div class="notification-actions">
            @for (action of notification.actions; track action.label) {
              <button 
                class="notification-action"
                [class]="'btn-' + (action.style || 'secondary')"
                (click)="onActionClick(action)">
                {{ action.label }}
              </button>
            }
          </div>
        }
      </div>
      
      @if (!notification.persistent) {
        <button class="notification-close" (click)="onDismiss()">
          <i class="material-icons">close</i>
        </button>
      }
    </div>
  `,
  styles: [`
    .notification {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 1rem;
      border-radius: 8px;
      border: 1px solid;
      margin-bottom: 0.75rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      animation: slideIn 0.3s ease-out;
      position: relative;
      min-width: 320px;
      max-width: 500px;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .notification-success {
      background-color: rgba(34, 197, 94, 0.05);
      border-color: rgba(34, 197, 94, 0.2);
      color: #059669;
    }

    .notification-error {
      background-color: rgba(239, 68, 68, 0.05);
      border-color: rgba(239, 68, 68, 0.2);
      color: #dc2626;
    }

    .notification-warning {
      background-color: rgba(245, 158, 11, 0.05);
      border-color: rgba(245, 158, 11, 0.2);
      color: #d97706;
    }

    .notification-info {
      background-color: rgba(59, 130, 246, 0.05);
      border-color: rgba(59, 130, 246, 0.2);
      color: #2563eb;
    }

    .notification-icon {
      flex-shrink: 0;
      
      .material-icons {
        font-size: 1.25rem;
      }
    }

    .notification-content {
      flex: 1;
      min-width: 0;
    }

    .notification-title {
      font-weight: 600;
      font-size: 0.875rem;
      margin-bottom: 0.25rem;
    }

    .notification-message {
      font-size: 0.875rem;
      line-height: 1.4;
      opacity: 0.9;
    }

    .notification-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.75rem;
    }

    .notification-action {
      padding: 0.375rem 0.75rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;

      &.btn-primary {
        background-color: currentColor;
        color: white;

        &:hover {
          opacity: 0.9;
        }
      }

      &.btn-secondary {
        background-color: transparent;
        color: currentColor;
        border: 1px solid currentColor;

        &:hover {
          background-color: currentColor;
          color: white;
        }
      }
    }

    .notification-close {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 4px;
      color: currentColor;
      opacity: 0.6;
      transition: opacity 0.2s ease;

      &:hover {
        opacity: 1;
      }

      .material-icons {
        font-size: 1rem;
      }
    }
  `]
})
export class NotificationComponent {
  @Input() notification!: Notification;
  @Output() dismiss = new EventEmitter<string>();
  @Output() actionClick = new EventEmitter<{ notification: Notification; action: NotificationAction }>();

  getIcon(): string {
    switch (this.notification.type) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'notifications';
    }
  }

  onDismiss(): void {
    this.dismiss.emit(this.notification.id);
  }

  onActionClick(action: NotificationAction): void {
    this.actionClick.emit({ notification: this.notification, action });
    action.action();
    
    // Auto-dismiss après action si pas persistante
    if (!this.notification.persistent) {
      setTimeout(() => {
        this.onDismiss();
      }, 100);
    }
  }
}