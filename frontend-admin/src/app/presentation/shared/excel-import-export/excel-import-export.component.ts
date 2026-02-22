import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-excel-import-export',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './excel-import-export.component.html',
  styleUrls: ['./excel-import-export.component.scss']
})
export class ExcelImportExportComponent {
  @Input() entityType!: string; // 'ecoles', 'classes', 'etudiants', 'enseignants', 'cours'
  @Input() entityLabel!: string; // Label à afficher
  @Input() classeId?: string; // Pour l'export des étudiants
  @Output() importComplete = new EventEmitter<any>();

  isImporting = false;
  isExporting = false;
  importResult: any = null;
  selectedFile: File | null = null;

  constructor(private http: HttpClient) {}

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    this.importResult = null;
  }

  downloadTemplate(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get(
      `${environment.apiUrl}/data/templates/${this.entityType}`,
      { headers, responseType: 'blob' }
    ).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `template_${this.entityType}_${Date.now()}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Erreur lors du téléchargement du template:', error);
        alert('Erreur lors du téléchargement du template');
      }
    });
  }

  importData(): void {
    if (!this.selectedFile) {
      alert('Veuillez sélectionner un fichier');
      return;
    }

    this.isImporting = true;
    this.importResult = null;

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.post(
      `${environment.apiUrl}/data/import/${this.entityType}`,
      formData,
      { headers }
    ).subscribe({
      next: (response: any) => {
        this.isImporting = false;
        this.importResult = response.data;
        this.selectedFile = null;
        this.importComplete.emit(response.data);
        
        // Reset file input
        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      },
      error: (error) => {
        this.isImporting = false;
        console.error('Erreur lors de l\'import:', error);
        alert('Erreur lors de l\'import: ' + (error.error?.message || 'Erreur inconnue'));
      }
    });
  }

  exportData(): void {
    this.isExporting = true;

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    let url = `${environment.apiUrl}/data/export/${this.entityType}`;
    if (this.entityType === 'etudiants' && this.classeId) {
      url += `?classeId=${this.classeId}`;
    }

    this.http.get(url, { headers, responseType: 'blob' }).subscribe({
      next: (blob) => {
        this.isExporting = false;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${this.entityType}_${Date.now()}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        this.isExporting = false;
        console.error('Erreur lors de l\'export:', error);
        alert('Erreur lors de l\'export');
      }
    });
  }
}
