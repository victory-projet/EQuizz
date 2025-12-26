import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmationService } from '../../services/confirmation.service';

@Component({
  selector: 'app-global-confirmation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dialog-overlay" *ngIf="confirmationService.isOpen()" (click)="onCancel()">
      <div class="dialog-container" (click)="$event.stopPropagation()">
        <div class="dialog-header">
          <div class="header-title-with-icon">
            <span class="material-icons dialog-icon" [ngClass]="getIconClass()">
              {{ confirmationService.config().icon }}
            </span>
            <h3>{{ confirmationService.config().title }}</h3>
          </div>
          <button class="close-btn" (click)="onCancel()" aria-label="Fermer">
            <span class="material-icons">close</span>
          </button>
        </div>

        <div class="dialog-body">
          <p>{{ confirmationService.config().message }}</p>
        </div>

        <div class="dialog-footer">
          <button 
            class="btn btn-secondary" 
            (click)="onCancel()"
            type="button">
            {{ confirmationService.config().cancelText }}
          </button>
          <button 
            class="btn btn-primary" 
            [class.btn-danger]="confirmationService.config().type === 'danger'"
            [class.btn-warning]="confirmationService.config().type === 'warning'"
            [class.btn-info]="confirmationService.config().type === 'info'"
            [class.btn-success]="confirmationService.config().type === 'success'"
            (click)="onConfirm()"
            type="button">
            {{ confirmationService.config().confirmText }}
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
      animation: fadeIn 0.2s ease-out;
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
      animation: slideUp 0.3s ease-out;
      max-height: 90vh;
      overflow-y: auto;
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

      .header-title-with-icon {
        display: flex;
        align-items: center;
        gap: 12px;

        .dialog-icon {
          font-size: 28px;
          
          &.icon-danger {
            color: #E74C3C;
          }
          
          &.icon-warning {
            color: #F39C12;
          }
          
          &.icon-info {
            color: #3498DB;
          }
          
          &.icon-success {
            color: #27AE60;
          }
          
          &.icon-default {
            color: #5B7396;
          }
        }

        h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: #2C3E50;
        }
      }
    }

    .close-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 4px;
      color: #95A5A6;
      transition: color 0.2s ease;
      border-radius: 4px;

      &:hover {
        color: #2C3E50;
        background: #F8F9FA;
      }

      &:focus {
        outline: 2px solid #5B7396;
        outline-offset: 2px;
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
      transition: all 0.2s ease;
      min-width: 80px;

      &:focus {
        outline: 2px solid #5B7396;
        outline-offset: 2px;
      }

      &.btn-secondary {
        background: #E0E6ED;
        color: #2C3E50;

        &:hover {
          background: #D0D6DD;
        }

        &:active {
          background: #C0C6CD;
        }
      }

      &.btn-primary {
        background: #5B7396;
        color: white;

        &:hover {
          background: #4A5F7F;
        }

        &:active {
          background: #3A4F6F;
        }
      }

      &.btn-danger {
        background: #E74C3C;

        &:hover {
          background: #C0392B;
        }

        &:active {
          background: #A93226;
        }
      }

      &.btn-warning {
        background: #F39C12;

        &:hover {
          background: #E67E22;
        }

        &:active {
          background: #D68910;
        }
      }

      &.btn-info {
        background: #3498DB;

        &:hover {
          background: #2980B9;
        }

        &:active {
          background: #21618C;
        }
      }

      &.btn-success {
        background: #27AE60;

        &:hover {
          background: #229954;
        }

        &:active {
          background: #1E8449;
        }
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .dialog-container {
        width: 95%;
        margin: 20px;
      }

      .dialog-header,
      .dialog-body,
      .dialog-footer {
        padding-left: 16px;
        padding-right: 16px;
      }

      .dialog-footer {
        flex-direction: column-reverse;
        gap: 8px;

        .btn {
          width: 100%;
        }
      }
    }
  `]
})
export class GlobalConfirmationComponent {
  protected readonly confirmationService = inject(ConfirmationService);

  onConfirm(): void {
    this.confirmationService.onConfirm();
  }

  onCancel(): void {
    this.confirmationService.onCancel();
  }

  getIconClass(): string {
    const type = this.confirmationService.config().type;
    return `icon-${type}`;
  }
}