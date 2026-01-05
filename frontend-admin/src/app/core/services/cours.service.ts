import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../infrastructure/http/api.service';

export interface Enseignant {
  id: string;
  Utilisateur: {
    nom: string;
    prenom: string;
    email: string;
  };
}

export interface Cours {
  id: string;
  nom: string;
  code: string;
  description?: string;
  estArchive: boolean;
  anneeAcademiqueId?: string;
  Enseignants?: Enseignant[];
}

export interface Classe {
  id: string;
  nom: string;
  niveau: string;
  anneeAcademiqueId?: string;
  effectif?: number; // Calculé côté backend
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedResponse<T> {
  [key: string]: T[] | any;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CoursService {
  constructor(private api: ApiService) {}

  getCours(params?: PaginationParams): Observable<PaginatedResponse<Cours> | Cours[]> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    
    const url = `/academic/cours${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.api.get<PaginatedResponse<Cours> | Cours[]>(url);
  }

  getClasses(params?: PaginationParams): Observable<PaginatedResponse<Classe> | Classe[]> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    
    const url = `/academic/classes${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.api.get<PaginatedResponse<Classe> | Classe[]>(url);
  }

  getCoursById(id: string): Observable<Cours> {
    return this.api.get<Cours>(`/academic/cours/${id}`);
  }

  getClasseById(id: string): Observable<Classe> {
    return this.api.get<Classe>(`/academic/classes/${id}`);
  }

  createCours(cours: Partial<Cours> & { enseignantIds?: string[] }): Observable<Cours> {
    return this.api.post<Cours>('/academic/cours', cours);
  }

  updateCours(id: string, cours: Partial<Cours> & { enseignantIds?: string[] }): Observable<Cours> {
    return this.api.put<Cours>(`/academic/cours/${id}`, cours);
  }

  deleteCours(id: string): Observable<{ message: string }> {
    return this.api.delete<{ message: string }>(`/academic/cours/${id}`);
  }

  addEnseignantToCours(coursId: string, enseignantId: string): Observable<{ message: string }> {
    return this.api.post<{ message: string }>(`/academic/cours/${coursId}/enseignants`, { enseignantId });
  }

  removeEnseignantFromCours(coursId: string, enseignantId: string): Observable<{ message: string }> {
    return this.api.delete<{ message: string }>(`/academic/cours/${coursId}/enseignants/${enseignantId}`);
  }
}