// src/app/core/guards/role.guard.ts
import { Injectable, inject } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router
} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const requiredRoles = route.data['roles'] as Array<string>;
    const userRole = this.getCurrentUserRole();

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // Aucun rôle requis
    }

    if (!userRole || !requiredRoles.includes(userRole)) {
      // Rediriger vers la page non autorisée
      this.router.navigate(['/unauthorized']);
      return false;
    }

    return true;
  }

  private getCurrentUserRole(): string {
    // Implémentation pour récupérer le rôle de l'utilisateur connecté
    const userData = localStorage.getItem('user_data');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user.role || 'user';
      } catch {
        return 'user';
      }
    }
    return 'user';
  }
}
