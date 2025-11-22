import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Edit3, FileSpreadsheet, X } from 'lucide-angular';

export type CreationMethod = 'manual' | 'excel';

@Component({
  selector: 'app-creation-method-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './creation-method-modal.component.html',
  styleUrls: ['./creation-method-modal.component.scss']
})
export class CreationMethodModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() methodSelected = new EventEmitter<CreationMethod>();

  // Lucide icons
  readonly Edit3 = Edit3;
  readonly FileSpreadsheet = FileSpreadsheet;
  readonly X = X;

  onSelectMethod(method: CreationMethod): void {
    this.methodSelected.emit(method);
  }

  onClose(): void {
    this.close.emit();
  }
}
