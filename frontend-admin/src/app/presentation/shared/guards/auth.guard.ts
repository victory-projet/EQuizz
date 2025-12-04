// Guard - Auth
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  
  if (token && token !== 'undefined' && token !== 'null') {
    return true;
  }
  
  if (token === 'undefined' || token === 'null') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
  
  router.navigate(['/login']);
  return false;
};
