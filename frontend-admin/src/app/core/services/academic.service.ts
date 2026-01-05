import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Ecole {
  id: string;
  nom: string;
  adresse?: string;
  telephone?: string;
  email?: string;
}

export interface Classe {
  id: string;
  nom: string;
  niveau?: string;
  ecole?: Ecole;
  nombreEtudiants?: number;
}

export interface Cours {
  id: string;
  code: string;
  nom: string;
  estArchive: boolean;
  semestre?: {
    id: string;
    nom: string;
    anneeAcademique?: {
      id: string;
      nom: string;
    };
  };
  enseignants?: Array<{
    id: string;
    nom: string;
    prenom: string;
    email: string;
    role: 'TITULAIRE' | 'ASSISTANT' | 'INTERVENANT';
    estPrincipal: boolean;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class AcademicService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ============================================
  // ÉCOLES
  // ============================================

  getEcoles(): Observable<Ecole[]> {
    return this.http.get<Ecole[]>(`${this.apiUrl}/academic/ecoles`);
  }

  getEcole(id: string): Observable<Ecole> {
    return this.http.get<Ecole>(`${this.apiUrl}/academic/ecoles/${id}`);
  }

  createEcole(ecole: Partial<Ecole>): Observable<Ecole> {
    return this.http.post<Ecole>(`${this.apiUrl}/academic/ecoles`, ecole);
  }

  updateEcole(id: string, ecole: Partial<Ecole>): Observable<Ecole> {
    return this.http.put<Ecole>(`${this.apiUrl}/academic/ecoles/${id}`, ecole);
  }

  deleteEcole(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/academic/ecoles/${id}`);
  }

  // ============================================
  // CLASSES
  // ============================================

  getClasses(): Observable<Classe[]> {
    return this.http.get<{classes: Classe[], pagination: any}>(`${this.apiUrl}/academic/classes`)
      .pipe(
        map(response => response.classes || [])
      );
  }

  getClassesByEcole(ecoleId: string): Observable<Classe[]> {
    return this.http.get<Classe[]>(`${this.apiUrl}/academic/ecoles/${ecoleId}/classes`);
  }

  getClasse(id: string): Observable<Classe> {
    return this.http.get<Classe>(`${this.apiUrl}/academic/classes/${id}`);
  }

  createClasse(classe: Partial<Classe>): Observable<Classe> {
    return this.http.post<Classe>(`${this.apiUrl}/academic/classes`, classe);
  }

  updateClasse(id: string, classe: Partial<Classe>): Observable<Classe> {
    return this.http.put<Classe>(`${this.apiUrl}/academic/classes/${id}`, classe);
  }

  deleteClasse(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/academic/classes/${id}`);
  }

  // ============================================
  // COURS
  // ============================================

  getCours(): Observable<Cours[]> {
    return this.http.get<{cours: Cours[], pagination: any}>(`${this.apiUrl}/cours`)
      .pipe(
        map(response => response.cours || [])
      );
  }

  getCour(id: string): Observable<Cours> {
    return this.http.get<Cours>(`${this.apiUrl}/cours/${id}`);
  }

  createCours(cours: Partial<Cours>): Observable<Cours> {
    return this.http.post<Cours>(`${this.apiUrl}/cours`, cours);
  }

  updateCours(id: string, cours: Partial<Cours>): Observable<Cours> {
    return this.http.put<Cours>(`${this.apiUrl}/cours/${id}`, cours);
  }

  deleteCours(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/cours/${id}`);
  }

  // ============================================
  // ENSEIGNANTS
  // ============================================

  getEnseignants(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/enseignants`);
  }

  // ============================================
  // ASSOCIATIONS COURS-ENSEIGNANT
  // ============================================

  getEnseignantsByCours(coursId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/cours/${coursId}/enseignants`);
  }

  assignerEnseignantToCours(coursId: string, data: {
    enseignantId: string;
    role?: 'TITULAIRE' | 'ASSISTANT' | 'INTERVENANT';
    estPrincipal?: boolean;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/cours/${coursId}/enseignants`, data);
  }

  modifierRoleEnseignant(coursId: string, enseignantId: string, data: {
    role: 'TITULAIRE' | 'ASSISTANT' | 'INTERVENANT';
    estPrincipal?: boolean;
  }): Observable<any> {
    return this.http.put(`${this.apiUrl}/cours/${coursId}/enseignants/${enseignantId}`, data);
  }

  retirerEnseignantFromCours(coursId: string, enseignantId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cours/${coursId}/enseignants/${enseignantId}`);
  }

  getCoursByEnseignant(enseignantId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/enseignants/${enseignantId}/cours`);
  }
}