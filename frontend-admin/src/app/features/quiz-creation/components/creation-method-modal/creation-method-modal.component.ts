import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type CreationMethod = 'manual' | 'excel';

@Component({
  selector: 'app-creation-method-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './creation-method-modal.component.html',
  styleUrls: ['./creation-method-modal.component.scss']
})
export class CreationMethodModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() methodSelected = new EventEmitter<CreationMethod>();

  onSelectMethod(method: CreationMethod): void {
    this.methodSelected.emit(method);
  }

  onClose(): void {
    this.close.emit();
  }
}
