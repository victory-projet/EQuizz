// src/app/core/guards/auth.guard.ts
import { Injectable, inject } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    // Vérifier si l'utilisateur est authentifié
    const isAuthenticated = this.checkAuthentication();

    if (!isAuthenticated) {
      // Rediriger vers la page de login avec l'URL de retour
      return this.router.createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url }
      });
    }

    // Vérifier les rôles si spécifiés dans la route
    const requiredRoles = route.data['roles'] as Array<string>;
    if (requiredRoles) {
      const userRole = this.getUserRole();
      if (!requiredRoles.includes(userRole)) {
        // Rediriger vers la page non autorisée
        return this.router.createUrlTree(['/unauthorized']);
      }
    }

    return true;
  }

  private checkAuthentication(): boolean {
    // Vérifier la présence du token et sa validité
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return false;
    }

    // Vérifier l'expiration du token (exemple basique)
    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = tokenPayload.exp * 1000 < Date.now();
      return !isExpired;
    } catch {
      return false;
    }
  }

  private getUserRole(): string {
    // Récupérer le rôle de l'utilisateur depuis le token ou le storage
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        return tokenPayload.role || 'user';
      } catch {
        return 'user';
      }
    }
    return 'user';
  }
}
