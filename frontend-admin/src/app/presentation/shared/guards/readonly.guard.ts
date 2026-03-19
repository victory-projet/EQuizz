// Guard - Block write routes for SUPER-ADMIN (read-only role)
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const readonlyGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const userStr = localStorage.getItem('user');

  if (userStr && userStr !== 'undefined' && userStr !== 'null') {
    try {
      const user = JSON.parse(userStr);
      if (user?.role === 'SUPER-ADMIN') {
        // SUPER-ADMIN cannot access write routes — redirect to evaluations list
        router.navigate(['/evaluations']);
        return false;
      }
    } catch (e) {}
  }

  return true;
};
