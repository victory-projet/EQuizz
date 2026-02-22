import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExcelImportExportComponent } from '../../shared/excel-import-export/excel-import-export.component';

@Component({
  selector: 'app-data-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ExcelImportExportComponent],
  templateUrl: './data-management.component.html',
  styleUrls: ['./data-management.component.scss']
})
export class DataManagementComponent {
  selectedEntity: string = 'ecoles';
  selectedClasseId?: string;

  entities = [
    { type: 'ecoles', label: 'Écoles' },
    { type: 'classes', label: 'Classes' },
    { type: 'etudiants', label: 'Étudiants' },
    { type: 'enseignants', label: 'Enseignants' },
    { type: 'cours', label: 'Cours' }
  ];

  onImportComplete(result: any): void {
    console.log('Import terminé:', result);
    // Rafraîchir les données si nécessaire
  }

  getEntityLabel(): string {
    return this.entities.find(e => e.type === this.selectedEntity)?.label || '';
  }
}
