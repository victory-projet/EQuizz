import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImportResult } from '../../../../core/services/import.service';

export type ImportType = 'cours' | 'classes' | 'etudiants' | 'enseignants' | 'administrateurs' | null;

interface ImportOption {
  type: ImportType;
  title: string;
  description: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-import-manager',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './import-manager.component.html',
  styleUrls: ['./import-manager.component.scss']
})
export class ImportManagerComponent {
  selectedImportType = signal<ImportType>(null);
  importResult = signal<ImportResult | null>(null);
  showResult = signal(false);

  importOptions: ImportOption[] = [
    {
      type: 'cours',
      title: 'Cours',
      description: 'Importer des cours avec codes, noms et enseignants',
      icon: 'fas fa-book',
      color: '#667eea'
    },
    {
      type: 'classes',
      title: 'Classes',
      description: 'Importer des classes avec noms et niveaux',
      icon: 'fas fa-users',
      color: '#f093fb'
    },
    {
      type: 'etudiants',
      title: 'Étudiants',
      description: 'Importer des étudiants avec informations personnelles',
      icon: 'fas fa-user-graduate',
      color: '#4facfe'
    },
    {
      type: 'enseignants',
      title: 'Enseignants',
      description: 'Importer des enseignants avec spécialités',
      icon: 'fas fa-chalkboard-teacher',
      color: '#43e97b'
    },
    {
      type: 'administrateurs',
      title: 'Administrateurs',
      description: 'Importer des administrateurs système',
      icon: 'fas fa-user-shield',
      color: '#fa709a'
    }
  ];

  selectImportType(type: ImportType): void {
    this.selectedImportType.set(type);
    this.showResult.set(false);
    this.importResult.set(null);
  }

  onImportCompleted(result: ImportResult): void {
    this.importResult.set(result);
    this.showResult.set(true);
    console.log('Import completed:', result);
  }

  onImportCancelled(): void {
    this.selectedImportType.set(null);
    this.showResult.set(false);
    this.importResult.set(null);
  }

  backToSelection(): void {
    this.selectedImportType.set(null);
    this.showResult.set(false);
    this.importResult.set(null);
  }

  startNewImport(): void {
    this.showResult.set(false);
    this.importResult.set(null);
  }
}