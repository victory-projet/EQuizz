// Guard - Admin Role
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const userStr = localStorage.getItem('user');
  
  if (userStr && userStr !== 'undefined' && userStr !== 'null') {
    try {
      const user = JSON.parse(userStr);
      if (user && user.role === 'ADMIN') {
        return true;
      }
    } catch (e) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }
  
  router.navigate(['/login']);
  return false;
};
