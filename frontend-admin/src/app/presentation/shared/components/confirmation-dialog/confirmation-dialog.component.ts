import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dialog-overlay" *ngIf="isOpen" (click)="onCancel()">
      <div class="dialog-container" (click)="$event.stopPropagation()">
        <div class="dialog-header">
          <h3>{{ title }}</h3>
          <button class="close-btn" (click)="onCancel()">
            <span class="material-icons">close</span>
          </button>
        </div>

        <div class="dialog-body">
          <p>{{ message }}</p>
        </div>

        <div class="dialog-footer">
          <button class="btn btn-secondary" (click)="onCancel()">
            {{ cancelText }}
          </button>
          <button class="btn btn-primary" [class.btn-danger]="type === 'danger'" (click)="onConfirm()">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.2s;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .dialog-container {
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 500px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      animation: slideUp 0.3s;
    }

    @keyframes slideUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid #E0E6ED;

      h3 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: #2C3E50;
      }
    }

    .close-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 4px;
      color: #95A5A6;
      transition: color 0.2s;

      &:hover {
        color: #2C3E50;
      }

      .material-icons {
        font-size: 24px;
      }
    }

    .dialog-body {
      padding: 24px;

      p {
        margin: 0;
        font-size: 15px;
        color: #7F8C8D;
        line-height: 1.6;
      }
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px;
      border-top: 1px solid #E0E6ED;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;

      &.btn-secondary {
        background: #E0E6ED;
        color: #2C3E50;

        &:hover {
          background: #D0D6DD;
        }
      }

      &.btn-primary {
        background: #5B7396;
        color: white;

        &:hover {
          background: #4A5F7F;
        }
      }

      &.btn-danger {
        background: #E74C3C;

        &:hover {
          background: #C0392B;
        }
      }
    }
  `]
})
export class ConfirmationDialogComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirmation';
  @Input() message = 'Êtes-vous sûr de vouloir continuer ?';
  @Input() confirmText = 'Confirmer';
  @Input() cancelText = 'Annuler';
  @Input() type: 'default' | 'danger' = 'default';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
