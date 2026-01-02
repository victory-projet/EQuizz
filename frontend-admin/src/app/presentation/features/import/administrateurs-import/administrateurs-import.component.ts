import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExcelImportComponent } from '../../../shared/components/excel-import/excel-import.component';
import { ADMINISTRATEURS_IMPORT_CONFIG } from '../../../shared/components/excel-import/import-configs';
import { ImportResult } from '../../../../core/services/import.service';

@Component({
  selector: 'app-administrateurs-import',
  standalone: true,
  imports: [CommonModule, ExcelImportComponent],
  template: `
    <app-excel-import
      [config]="importConfig"
      (imported)="onImported($event)"
      (cancelled)="onCancelled()">
    </app-excel-import>
  `
})
export class AdministrateursImportComponent {
  @Output() imported = new EventEmitter<ImportResult>();
  @Output() cancelled = new EventEmitter<void>();

  importConfig = ADMINISTRATEURS_IMPORT_CONFIG;

  onImported(result: ImportResult): void {
    this.imported.emit(result);
  }

  onCancelled(): void {
    this.cancelled.emit();
  }
}