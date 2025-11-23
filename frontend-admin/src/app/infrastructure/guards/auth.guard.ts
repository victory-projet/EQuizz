import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router'; 

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('auth_token');

  if (token) {
    // Vérifier si le token n'est pas expiré
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp * 1000 < Date.now();
      
      if (isExpired) {
        // Token expiré, nettoyer et rediriger
        localStorage.removeItem('auth_token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        router.navigate(['/login']);
        return false;
      }
      
      return true;
    } catch (error) {
      // Token invalide, nettoyer et rediriger
      localStorage.removeItem('auth_token');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      router.navigate(['/login']);
      return false;
    }
  }

  router.navigate(['/login']);
  return false;
};