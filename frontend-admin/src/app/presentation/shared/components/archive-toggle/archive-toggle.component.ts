import { Component, Output, EventEmitter, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-archive-toggle',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './archive-toggle.component.html',
  styleUrls: ['./archive-toggle.component.scss']
})
export class ArchiveToggleComponent {
  @Input() showArchived = signal(false);
  @Input() archivedCount = 0;
  @Input() activeCount = 0;
  @Input() totalCount = 0;
  @Input() label = 'éléments';
  
  @Output() toggleArchived = new EventEmitter<boolean>();

  onToggle(checked: boolean): void {
    this.showArchived.set(checked);
    this.toggleArchived.emit(checked);
  }

  getStatusText(): string {
    if (this.showArchived()) {
      return `Affichage des ${this.label} archivés (${this.archivedCount})`;
    }
    return `Affichage des ${this.label} actifs (${this.activeCount})`;
  }
}
