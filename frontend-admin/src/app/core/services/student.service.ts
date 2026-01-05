import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ErrorHandlerService } from './error-handler.service';
import { CacheService } from './cache.service';

export interface Student {
  id: string;
  numeroEtudiant?: string;
  nom: string;
  prenom: string;
  email: string;
  estActif: boolean;
  dateInscription: string;
  createdAt: string;
  classe?: {
    id: string;
    nom: string;
    ecole?: {
      id: string;
      nom: string;
    };
  };
}

export interface CreateStudentRequest {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  numeroEtudiant?: string;
  classeId: string;
}

export interface UpdateStudentRequest {
  nom?: string;
  prenom?: string;
  email?: string;
  motDePasse?: string;
  numeroEtudiant?: string;
  classeId?: string;
  estActif?: boolean;
}

export interface StudentsResponse {
  etudiants: Student[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface StudentResponse {
  etudiant: Student;
}

export interface GetStudentsParams {
  page?: number;
  limit?: number;
  search?: string;
  classeId?: string;
  ecoleId?: string;
  estActif?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = `${environment.apiUrl}/etudiants`;
  private http = inject(HttpClient);
  private errorHandler = inject(ErrorHandlerService);
  private cacheService = inject(CacheService);

  // Configuration du cache pour les étudiants
  private readonly cacheConfig = {
    ttl: 5 * 60 * 1000, // 5 minutes
    maxSize: 100,
    persistToStorage: true
  };

  // Clés de cache
  private readonly CACHE_KEYS = {
    STUDENTS_LIST: (params: string) => `students_list_${params}`,
    STUDENT_BY_ID: (id: string) => `student_${id}`,
    STUDENTS_BY_CLASSE: (classeId: string) => `students_classe_${classeId}`,
    STUDENTS_STATS: 'students_stats'
  };

  /**
   * Obtenir tous les étudiants avec pagination et filtres
   */
  getStudents(params: GetStudentsParams = {}): Observable<StudentsResponse> {
    let httpParams = new HttpParams();

    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.classeId) httpParams = httpParams.set('classeId', params.classeId);
    if (params.ecoleId) httpParams = httpParams.set('ecoleId', params.ecoleId);
    if (params.estActif !== undefined) httpParams = httpParams.set('estActif', params.estActif.toString());

    // Créer une clé de cache basée sur les paramètres
    const cacheKey = this.CACHE_KEYS.STUDENTS_LIST(httpParams.toString());

    return this.cacheService.getOrFetch(
      cacheKey,
      () => this.http.get<StudentsResponse>(this.apiUrl, { params: httpParams }).pipe(
        catchError(this.errorHandler.handleError<StudentsResponse>('getStudents'))
      ),
      this.cacheConfig
    );
  }

  /**
   * Obtenir tous les étudiants avec pagination (alias pour compatibilité)
   */
  getStudentsPaginated(params: GetStudentsParams = {}): Observable<{ students: Student[]; pagination: any }> {
    return this.getStudents(params).pipe(
      map(response => ({
        students: response.etudiants,
        pagination: response.pagination
      }))
    );
  }

  /**
   * Obtenir un étudiant par ID
   */
  getStudent(id: string): Observable<StudentResponse> {
    const cacheKey = this.CACHE_KEYS.STUDENT_BY_ID(id);

    return this.cacheService.getOrFetch(
      cacheKey,
      () => this.http.get<StudentResponse>(`${this.apiUrl}/${id}`).pipe(
        catchError(this.errorHandler.handleError<StudentResponse>('getStudent'))
      ),
      this.cacheConfig
    );
  }

  /**
   * Créer un nouvel étudiant
   */
  createStudent(student: CreateStudentRequest): Observable<Student> {
    return this.http.post<{ message: string; etudiant: Student }>(this.apiUrl, student).pipe(
      map(response => response.etudiant),
      tap(() => {
        // Invalider le cache après création
        this.invalidateStudentsCache();
      }),
      catchError(this.errorHandler.handleError<Student>('createStudent'))
    );
  }

  /**
   * Mettre à jour un étudiant
   */
  updateStudent(id: string | number, student: UpdateStudentRequest): Observable<Student> {
    return this.http.put<{ message: string; etudiant: Student }>(`${this.apiUrl}/${id}`, student).pipe(
      map(response => response.etudiant),
      tap(() => {
        // Invalider le cache de cet étudiant et les listes
        this.cacheService.delete(this.CACHE_KEYS.STUDENT_BY_ID(id.toString()));
        this.invalidateStudentsCache();
      }),
      catchError(this.errorHandler.handleError<Student>('updateStudent'))
    );
  }

  /**
   * Supprimer un étudiant
   */
  deleteStudent(id: string | number): Observable<void> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`).pipe(
      map(() => void 0),
      tap(() => {
        // Invalider le cache après suppression
        this.cacheService.delete(this.CACHE_KEYS.STUDENT_BY_ID(id.toString()));
        this.invalidateStudentsCache();
      }),
      catchError(this.errorHandler.handleError<void>('deleteStudent'))
    );
  }

  /**
   * Activer/Désactiver un étudiant
   */
  toggleStudentStatus(id: string): Observable<{ message: string; etudiant: Student }> {
    return this.http.patch<{ message: string; etudiant: Student }>(`${this.apiUrl}/${id}/toggle-status`, {});
  }

  /**
   * Changer la classe d'un étudiant
   */
  changeStudentClasse(id: string, classeId: string): Observable<{ message: string; etudiant: Student }> {
    return this.http.patch<{ message: string; etudiant: Student }>(`${this.apiUrl}/${id}/change-classe`, { classeId });
  }

  /**
   * Obtenir les étudiants d'une classe
   */
  getStudentsByClasse(classeId: string): Observable<{ etudiants: Student[]; total: number }> {
    const cacheKey = this.CACHE_KEYS.STUDENTS_BY_CLASSE(classeId);

    return this.cacheService.getOrFetch(
      cacheKey,
      () => this.http.get<{ etudiants: Student[]; total: number }>(`${this.apiUrl}/classe/${classeId}`).pipe(
        catchError(this.errorHandler.handleError<{ etudiants: Student[]; total: number }>('getStudentsByClasse'))
      ),
      this.cacheConfig
    );
  }

  /**
   * Invalide tout le cache des étudiants
   */
  invalidateStudentsCache(): void {
    // Invalider les listes d'étudiants
    this.cacheService.invalidateByPattern('^students_list_');
    this.cacheService.invalidateByPattern('^students_classe_');
    this.cacheService.delete(this.CACHE_KEYS.STUDENTS_STATS);
  }

  /**
   * Précharge les données essentielles des étudiants
   */
  preloadEssentialData(): void {
    // Précharger la première page des étudiants
    this.getStudents({ page: 1, limit: 20 }).subscribe();
  }

  /**
   * Obtient les statistiques du cache des étudiants
   */
  getCacheStats(): {
    cachedStudents: number;
    cacheHitRate: number;
  } {
    const cacheStats = this.cacheService.getStats();
    const studentCacheKeys = cacheStats.keys.filter(key => 
      key.startsWith('students_') || key.startsWith('student_')
    );

    return {
      cachedStudents: studentCacheKeys.length,
      cacheHitRate: 0.85 // Approximation, dans une vraie app on trackrait les hits/misses
    };
  }
}