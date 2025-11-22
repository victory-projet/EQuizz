// src/app/infrastructure/http/error.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { ToastService } from '../../core/services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorHandler = inject(ErrorHandlerService);
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Ne pas afficher de toast pour les erreurs 401 (gérées par auth interceptor)
      if (error.status !== 401) {
        // Afficher un toast pour les erreurs courantes
        if (error.status >= 400 && error.status < 500) {
          const message = error.error?.message || 'Une erreur est survenue';
          toastService.error(message);
        } else if (error.status >= 500) {
          toastService.error('Erreur serveur. Veuillez réessayer plus tard.');
        } else if (error.status === 0) {
          toastService.error('Impossible de se connecter au serveur.');
        }
        
        // Logger l'erreur
        errorHandler.handleError(error).subscribe({
          error: () => {} // Ignorer l'erreur du handler
        });
      }

      return throwError(() => error);
    })
  );
};
