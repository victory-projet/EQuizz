// src/app/core/services/error-handler.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

export interface AppError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  private errorLog: AppError[] = [];

  handleError(error: any): Observable<never> {
    const appError = this.parseError(error);
    this.logError(appError);
    return throwError(() => appError);
  }

  private parseError(error: any): AppError {
    const timestamp = new Date();

    // HTTP Error
    if (error instanceof HttpErrorResponse) {
      return {
        message: this.getHttpErrorMessage(error),
        code: error.error?.code || 'HTTP_ERROR',
        status: error.status,
        details: error.error,
        timestamp
      };
    }

    // Application Error
    if (error instanceof Error) {
      return {
        message: error.message,
        code: 'APP_ERROR',
        details: error.stack,
        timestamp
      };
    }

    // Unknown Error
    return {
      message: 'Une erreur inattendue s\'est produite',
      code: 'UNKNOWN_ERROR',
      details: error,
      timestamp
    };
  }

  private getHttpErrorMessage(error: HttpErrorResponse): string {
    switch (error.status) {
      case 0:
        return 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.';
      case 400:
        return error.error?.message || 'Requête invalide. Vérifiez les données saisies.';
      case 401:
        return 'Session expirée. Veuillez vous reconnecter.';
      case 403:
        return 'Vous n\'avez pas les permissions nécessaires pour cette action.';
      case 404:
        return 'Ressource non trouvée.';
      case 409:
        return error.error?.message || 'Conflit détecté. Cette ressource existe déjà.';
      case 422:
        return error.error?.message || 'Données invalides.';
      case 500:
        return 'Erreur serveur. Veuillez réessayer plus tard.';
      case 503:
        return 'Service temporairement indisponible. Veuillez réessayer plus tard.';
      default:
        return error.error?.message || `Erreur ${error.status}: ${error.statusText}`;
    }
  }

  private logError(error: AppError): void {
    this.errorLog.push(error);
    
    // Limiter le log à 50 erreurs
    if (this.errorLog.length > 50) {
      this.errorLog.shift();
    }

    // Log en console en développement
    if (!this.isProduction()) {
      console.error('Application Error:', error);
    }
  }

  getErrorLog(): AppError[] {
    return [...this.errorLog];
  }

  clearErrorLog(): void {
    this.errorLog = [];
  }

  private isProduction(): boolean {
    return false; // À configurer selon l'environnement
  }
}
