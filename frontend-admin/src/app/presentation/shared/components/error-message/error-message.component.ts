import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="error-container" [class]="type">
      <span class="material-icons">{{ getIcon() }}</span>
      <div class="error-content">
        <h4 *ngIf="title">{{ title }}</h4>
        <p>{{ message }}</p>
      </div>
      <button *ngIf="dismissible" class="close-btn" (click)="onDismiss()">
        <span class="material-icons">close</span>
      </button>
    </div>
  `,
  styles: [`
    .error-container {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      border-radius: 8px;
      border: 1px solid;
      margin-bottom: 16px;

      &.error {
        background: #FFEBEE;
        border-color: #FFCDD2;
        color: #C62828;
      }

      &.warning {
        background: #FFF3E0;
        border-color: #FFE0B2;
        color: #E65100;
      }

      &.info {
        background: #E3F2FD;
        border-color: #BBDEFB;
        color: #1565C0;
      }

      &.success {
        background: #E8F5E9;
        border-color: #C8E6C9;
        color: #2E7D32;
      }

      .material-icons {
        font-size: 24px;
      }
    }

    .error-content {
      flex: 1;

      h4 {
        margin: 0 0 4px 0;
        font-size: 16px;
        font-weight: 600;
      }

      p {
        margin: 0;
        font-size: 14px;
      }
    }

    .close-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 4px;
      opacity: 0.7;
      transition: opacity 0.2s;

      &:hover {
        opacity: 1;
      }

      .material-icons {
        font-size: 20px;
      }
    }
  `]
})
export class ErrorMessageComponent {
  @Input() type: 'error' | 'warning' | 'info' | 'success' = 'error';
  @Input() title = '';
  @Input() message = '';
  @Input() dismissible = true;
  @Output() dismiss = new EventEmitter<void>();

  getIcon(): string {
    const icons = {
      error: 'error',
      warning: 'warning',
      info: 'info',
      success: 'check_circle'
    };
    return icons[this.type];
  }

  onDismiss(): void {
    this.dismiss.emit();
  }
}
