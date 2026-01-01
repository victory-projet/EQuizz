import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { ErrorHandlerService } from '../services/error-handler.service';

/**
 * Intercepteur global pour la gestion des erreurs HTTP
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorHandler = inject(ErrorHandlerService);
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Contexte pour identifier d'où vient l'erreur
      const context = `${req.method} ${req.url}`;
      
      // Déléguer la gestion à ErrorHandlerService
      return errorHandler.handleHttpError(error, context);
    })
  );
};