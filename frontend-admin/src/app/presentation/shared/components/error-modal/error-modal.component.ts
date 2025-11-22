// src/app/shared/components/error-modal/error-modal.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppError } from '../../../../core/services/error-handler.service';

@Component({
  selector: 'app-error-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-modal.component.html',
  styleUrl: './error-modal.component.scss'
})
export class ErrorModalComponent {
  @Input() isOpen = false;
  @Input() error: AppError | null = null;
  @Input() title = 'Erreur';
  @Output() close = new EventEmitter<void>();

  showDetails = false;

  onClose(): void {
    this.showDetails = false;
    this.close.emit();
  }

  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.onClose();
    }
  }

  getErrorIcon(): string {
    if (!this.error?.status) return 'error';
    
    if (this.error.status >= 500) return 'error';
    if (this.error.status >= 400) return 'warning';
    return 'info';
  }

  getErrorClass(): string {
    if (!this.error?.status) return 'error';
    
    if (this.error.status >= 500) return 'error';
    if (this.error.status >= 400) return 'warning';
    return 'info';
  }
}
