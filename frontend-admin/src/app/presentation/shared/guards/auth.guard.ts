// Guard - Auth
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

function isTokenValid(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp && payload.exp > now;
  } catch {
    return false;
  }
}

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  
  if (token && token !== 'undefined' && token !== 'null' && isTokenValid(token)) {
    return true;
  }
  
  // Token absent, invalide ou expiré
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  router.navigate(['/login']);
  return false;
};
