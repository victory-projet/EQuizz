// src/app/infrastructure/http/error.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { ToastService } from '../../core/services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorHandler = inject(ErrorHandlerService);
  const toastService = inject(ToastService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Une erreur est survenue';

      // Gestion spécifique selon le code d'erreur
      if (error.status === 0) {
        // Erreur réseau ou serveur inaccessible
        errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.';
        toastService.error(errorMessage);
      } else if (error.status === 401) {
        // Non authentifié - Rediriger vers login
        errorMessage = 'Session expirée. Veuillez vous reconnecter.';
        toastService.warning(errorMessage);
        
        // Nettoyer le localStorage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        
        // Rediriger vers login
        router.navigate(['/login']);
      } else if (error.status === 403) {
        // Non autorisé
        errorMessage = 'Accès refusé. Vous n\'avez pas les permissions nécessaires.';
        toastService.error(errorMessage);
      } else if (error.status === 404) {
        // Ressource non trouvée
        errorMessage = 'Ressource non trouvée.';
        toastService.error(errorMessage);
      } else if (error.status === 422) {
        // Erreur de validation
        errorMessage = error.error?.message || 'Données invalides.';
        toastService.error(errorMessage);
      } else if (error.status >= 500) {
        // Erreur serveur
        errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
        toastService.error(errorMessage);
      } else if (error.status >= 400 && error.status < 500) {
        // Autres erreurs client
        errorMessage = error.error?.message || error.error?.error || 'Une erreur est survenue.';
        toastService.error(errorMessage);
      }
      
      // Logger l'erreur pour debug
      console.error('HTTP Error:', {
        status: error.status,
        message: errorMessage,
        url: req.url,
        error: error.error
      });
      
      // Logger via le service d'erreur
      errorHandler.handleError(error).subscribe({
        error: () => {} // Ignorer l'erreur du handler
      });

      return throwError(() => error);
    })
  );
};
