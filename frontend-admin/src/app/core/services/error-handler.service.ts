import { Injectable, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';

export interface AppError {
  id: string;
  type: 'network' | 'auth' | 'validation' | 'server' | 'unknown';
  message: string;
  details?: string;
  timestamp: Date;
  url?: string;
  status?: number;
  isRetryable: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  private router = inject(Router);
  
  // Signal pour les erreurs actives
  errors = signal<AppError[]>([]);
  
  /**
   * Méthode générique pour gérer les erreurs (compatibilité)
   */
  handleError<T>(operation = 'operation') {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      
      // Si c'est une HttpErrorResponse, utiliser handleHttpError
      if (error.status !== undefined) {
        return this.handleHttpError(error, operation);
      }
      
      // Sinon, créer une erreur générique
      const appError: AppError = {
        id: this.generateErrorId(),
        type: 'unknown',
        message: error.message || 'Une erreur inattendue s\'est produite',
        timestamp: new Date(),
        isRetryable: false
      };
      
      this.addError(appError);
      return throwError(() => appError);
    };
  }

  /**
>>>>>>> frontend_admin_2
   * Gère les erreurs HTTP et les transforme en erreurs applicatives
   */
  handleHttpError(error: HttpErrorResponse, context?: string): Observable<never> {
    const appError = this.createAppError(error, context);
    this.addError(appError);
    
    // Actions spécifiques selon le type d'erreur
    switch (error.status) {
      case 401:
        this.handleAuthError();
        break;
      case 403:
        this.handleForbiddenError();
        break;
      case 404:
        this.handleNotFoundError(error);
        break;
      case 500:
        this.handleServerError(error);
        break;
    }
    
    return throwError(() => appError);
  }
  
  /**
   * Crée une erreur applicative à partir d'une erreur HTTP
   */
  private createAppError(error: HttpErrorResponse, context?: string): AppError {
    const id = this.generateErrorId();
    const timestamp = new Date();
    
    let type: AppError['type'] = 'unknown';
    let message = 'Une erreur inattendue s\'est produite';
    let isRetryable = false;
    
    // Déterminer le type et le message selon le statut
    switch (error.status) {
      case 0:
        type = 'network';
        message = 'Problème de connexion réseau';
        isRetryable = true;
        break;
      case 401:
        type = 'auth';
        message = 'Session expirée, veuillez vous reconnecter';
        isRetryable = false;
        break;
      case 403:
        type = 'auth';
        message = 'Accès non autorisé';
        isRetryable = false;
        break;
      case 404:
        type = 'server';
        message = 'Ressource non trouvée';
        isRetryable = false;
        break;
      case 422:
        type = 'validation';
        message = 'Données invalides';
        isRetryable = false;
        break;
      case 500:
        type = 'server';
        message = 'Erreur interne du serveur';
        isRetryable = true;
        break;
      case 502:
      case 503:
      case 504:
        type = 'server';
        message = 'Service temporairement indisponible';
        isRetryable = true;
        break;
      default:
        if (error.status >= 400 && error.status < 500) {
          type = 'validation';
          message = 'Erreur de requête';
        } else if (error.status >= 500) {
          type = 'server';
          message = 'Erreur du serveur';
          isRetryable = true;
        }
    }
    
    // Utiliser le message d'erreur du serveur si disponible
    if (error.error?.message) {
      message = error.error.message;
    } else if (error.message && error.message !== 'Http failure response') {
      message = error.message;
    }
    
    return {
      id,
      type,
      message,
      details: context ? `${context}: ${error.message}` : error.message,
      timestamp,
      url: error.url || undefined,
      status: error.status,
      isRetryable
    };
  }
  
  /**
   * Ajoute une erreur à la liste
   */
  private addError(error: AppError): void {
    const currentErrors = this.errors();
    
    // Éviter les doublons récents (même URL et statut dans les 5 dernières secondes)
    const isDuplicate = currentErrors.some(existing => 
      existing.url === error.url && 
      existing.status === error.status &&
      (error.timestamp.getTime() - existing.timestamp.getTime()) < 5000
    );
    
    if (!isDuplicate) {
      // Garder seulement les 10 dernières erreurs
      const updatedErrors = [error, ...currentErrors.slice(0, 9)];
      this.errors.set(updatedErrors);
    }
  }
  
  /**
   * Gère les erreurs d'authentification (401)
   */
  private handleAuthError(): void {
    console.warn('🔒 Erreur d\'authentification détectée');
    
    // Nettoyer les données d'authentification
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Rediriger vers la page de connexion
    setTimeout(() => {
      this.router.navigate(['/login'], { 
        queryParams: { reason: 'session_expired' } 
      });
    }, 1000);
  }
  
  /**
   * Gère les erreurs d'autorisation (403)
   */
  private handleForbiddenError(): void {
    console.warn('🚫 Accès non autorisé');
    // Optionnel: rediriger vers une page d'erreur ou le dashboard
  }
  
  /**
   * Gère les erreurs 404
   */
  private handleNotFoundError(error: HttpErrorResponse): void {
    console.warn('❌ Ressource non trouvée:', error.url);
  }
  
  /**
   * Gère les erreurs serveur (500+)
   */
  private handleServerError(error: HttpErrorResponse): void {
    console.error('🔥 Erreur serveur:', error);
  }
  
  /**
   * Supprime une erreur de la liste
   */
  dismissError(errorId: string): void {
    const currentErrors = this.errors();
    const updatedErrors = currentErrors.filter(error => error.id !== errorId);
    this.errors.set(updatedErrors);
  }
  
  /**
   * Supprime toutes les erreurs
   */
  clearAllErrors(): void {
    this.errors.set([]);
  }
  
  /**
   * Obtient les erreurs par type
   */
  getErrorsByType(type: AppError['type']): AppError[] {
    return this.errors().filter(error => error.type === type);
  }
  
  /**
   * Vérifie s'il y a des erreurs critiques
   */
  hasCriticalErrors(): boolean {
    return this.errors().some(error => 
      error.type === 'server' && error.status && error.status >= 500
    );
  }
  
  /**
   * Génère un ID unique pour l'erreur
   */
  private generateErrorId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
  
  /**
   * Obtient un message d'erreur convivial
   */
  getFriendlyMessage(error: AppError): string {
    const friendlyMessages: Record<AppError['type'], string> = {
      network: 'Vérifiez votre connexion internet et réessayez',
      auth: 'Veuillez vous reconnecter à votre compte',
      validation: 'Vérifiez les informations saisies',
      server: 'Nos serveurs rencontrent un problème temporaire',
      unknown: 'Une erreur inattendue s\'est produite'
    };
    
    return friendlyMessages[error.type] || error.message;
  }
}