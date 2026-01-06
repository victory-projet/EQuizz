// Interceptor - Auth
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  
  // Vérifier si le token existe et n'est pas vide/null/undefined
  if (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return next(clonedReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Gérer les erreurs 401 (token expiré ou invalide)
        if (error.status === 401) {
          console.warn('🔒 Token invalide ou expiré, redirection vers login');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
  
  // Si pas de token valide, vérifier si on est sur une route protégée
  const isProtectedRoute = !req.url.includes('/login') && 
                          !req.url.includes('/onboarding') && 
                          !req.url.includes('/public') &&
                          !req.url.includes('/auth/');
  
  if (isProtectedRoute) {
    console.warn('🔒 Tentative d\'accès à une route protégée sans token:', req.url);
    router.navigate(['/login']);
    return throwError(() => new Error('No authentication token'));
  }
  
  return next(req);
};
