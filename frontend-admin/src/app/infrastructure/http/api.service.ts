// Service API de base pour toutes les requêtes HTTP
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { BackendResponse } from './interfaces/backend.interfaces';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * GET request
   */
  get<T>(endpoint: string, params?: HttpParams): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}${endpoint}`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * GET request avec réponse BackendResponse
   */
  getWithResponse<T>(endpoint: string, params?: HttpParams): Observable<T> {
    return this.http.get<BackendResponse<T>>(`${this.apiUrl}${endpoint}`, { params }).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.error || 'Erreur lors de la récupération des données');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * POST request
   */
  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}${endpoint}`, body).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * POST request avec réponse BackendResponse
   */
  postWithResponse<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<BackendResponse<T>>(`${this.apiUrl}${endpoint}`, body).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.error || 'Erreur lors de la création');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * PUT request
   */
  put<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}${endpoint}`, body).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * PUT request avec réponse BackendResponse
   */
  putWithResponse<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<BackendResponse<T>>(`${this.apiUrl}${endpoint}`, body).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.error || 'Erreur lors de la mise à jour');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * DELETE request
   */
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}${endpoint}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * DELETE request avec réponse BackendResponse
   */
  deleteWithResponse(endpoint: string): Observable<void> {
    return this.http.delete<BackendResponse<void>>(`${this.apiUrl}${endpoint}`).pipe(
      map(response => {
        if (response.success) {
          return;
        }
        throw new Error(response.error || 'Erreur lors de la suppression');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * POST request pour upload de fichier
   */
  upload<T>(endpoint: string, formData: FormData): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}${endpoint}`, formData).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * GET request pour télécharger un fichier (PDF, Excel, etc.)
   */
  download(endpoint: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}${endpoint}`, {
      responseType: 'blob'
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Gestion des erreurs HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur est survenue';

    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      if (error.status === 0) {
        errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.';
      } else if (error.status === 401) {
        errorMessage = 'Non authentifié. Veuillez vous reconnecter.';
      } else if (error.status === 403) {
        errorMessage = 'Accès refusé. Vous n\'avez pas les permissions nécessaires.';
      } else if (error.status === 404) {
        errorMessage = 'Ressource non trouvée.';
      } else if (error.status === 500) {
        errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
      } else if (error.error?.error) {
        errorMessage = error.error.error;
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
    }

    console.error('Erreur HTTP:', error);
    return throwError(() => new Error(errorMessage));
  }
}
