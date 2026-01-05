import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../infrastructure/http/api.service';

export interface ImportResult {
  success: number;
  errors: string[];
  warnings: string[];
  data?: any[];
}

export interface ImportPreview {
  data: any[];
  errors: string[];
  warnings: string[];
  totalRows: number;
  validRows: number;
}

@Injectable({
  providedIn: 'root'
})
export class ImportService {
  constructor(private api: ApiService) {}

  // Import des cours
  importCours(file: File): Observable<ImportResult> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.post<ImportResult>('/cours/import', formData);
  }

  // Import des classes
  importClasses(file: File): Observable<ImportResult> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.post<ImportResult>('/classes/import', formData);
  }

  // Import des étudiants
  importEtudiants(file: File): Observable<ImportResult> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.post<ImportResult>('/users/import/etudiants', formData);
  }

  // Import des enseignants
  importEnseignants(file: File): Observable<ImportResult> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.post<ImportResult>('/users/import/enseignants', formData);
  }

  // Import des administrateurs
  importAdministrateurs(file: File): Observable<ImportResult> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.post<ImportResult>('/users/import/administrateurs', formData);
  }

  // Prévisualisation générique
  previewImport(file: File, type: string): Observable<ImportPreview> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.post<ImportPreview>(`/${type}/preview`, formData);
  }
}