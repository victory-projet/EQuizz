// src/app/shared/components/confirmation-modal/confirmation-modal.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ConfirmationData {
  title: string;
  message: string;
  entityName?: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
}

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation-modal.component.html',
  styleUrl: './confirmation-modal.component.scss'
})
export class ConfirmationModalComponent {
  @Input() isOpen = false;
  @Input() data: ConfirmationData = {
    title: 'Confirmation',
    message: 'Êtes-vous sûr ?',
    confirmText: 'Confirmer',
    cancelText: 'Annuler',
    isDangerous: false
  };

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }
}
