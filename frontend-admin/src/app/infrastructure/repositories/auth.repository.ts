// src/app/core/infrastructure/repositories/auth.repository.ts
import { Injectable, inject } from '@angular/core';
import { Observable, throwError, of, tap, map } from 'rxjs';
import { User, AuthToken, LoginCredentials } from '../../core/domain/entities/user.entity';
import { IAuthRepository, IUserRepository } from '../../core/domain/repositories/auth.repository.interface';
import { ApiService } from '../http/api.service';
import { AuthMapper } from '../mappers/auth.mapper';
import { BackendAuthResponse } from '../http/interfaces/backend.interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthRepository implements IAuthRepository {
  private apiService = inject(ApiService);

  login(credentials: LoginCredentials): Observable<AuthToken> {
    // Validation
    if (!credentials.isValid()) {
      return throwError(() => new Error('Identifiants invalides'));
    }

    // Appel API
    const loginRequest = AuthMapper.toBackendLoginRequest(credentials);
    
    return this.apiService.post<BackendAuthResponse>('/auth/login', loginRequest).pipe(
      tap(response => {
        // Stocker le token
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('access_token', response.token);
        
        // Stocker les informations utilisateur
        localStorage.setItem('user', JSON.stringify(response.user));
      }),
      map(response => AuthMapper.toAuthToken(response))
    );
  }

  logout(): Observable<void> {
    // Appel API pour déconnexion côté serveur
    return this.apiService.post<void>('/auth/logout', {}).pipe(
      tap(() => {
        // Nettoyer le localStorage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      })
    );
  }

  refreshToken(refreshToken: string): Observable<AuthToken> {
    if (!refreshToken) {
      return throwError(() => new Error('Refresh token invalide'));
    }

    // Appel API pour rafraîchir le token
    return this.apiService.post<{ token: string }>('/auth/refresh', { refreshToken }).pipe(
      tap(response => {
        // Mettre à jour le token dans le localStorage
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('access_token', response.token);
      }),
      map(response => new AuthToken(
        response.token,
        refreshToken,
        3600,
        'Bearer'
      ))
    );
  }

  getCurrentUser(): Observable<User> {
    // Appel API pour récupérer l'utilisateur connecté
    return this.apiService.get<any>('/auth/me').pipe(
      tap(backendUser => {
        // Mettre à jour le localStorage avec les données fraîches
        localStorage.setItem('user', JSON.stringify(backendUser));
      }),
      map(backendUser => AuthMapper.toDomain(backendUser))
    );
  }

  register(userData: Partial<User>, password: string): Observable<User> {
    // Non implémenté pour l'admin
    // Les étudiants s'inscrivent via POST /api/auth/claim-account (mobile)
    return throwError(() => new Error('Fonctionnalité non disponible pour l\'admin'));
  }

  resetPassword(email: string): Observable<void> {
    // Non implémenté
    // TODO: Ajouter l'endpoint POST /api/auth/forgot-password dans le backend
    return throwError(() => new Error('Fonctionnalité non disponible'));
  }

  changePassword(oldPassword: string, newPassword: string): Observable<void> {
    // Non implémenté
    // TODO: Ajouter l'endpoint PUT /api/auth/change-password dans le backend
    return throwError(() => new Error('Fonctionnalité non disponible'));
  }
}

@Injectable({
  providedIn: 'root'
})
export class UserRepository implements IUserRepository {
  private apiService = inject(ApiService);

  getAll(): Observable<User[]> {
    // TODO: Endpoint GET /api/users non disponible dans le backend
    // Pour l'instant, retourner une erreur
    return throwError(() => new Error('Endpoint GET /api/users non disponible. Fonctionnalité à implémenter dans le backend.'));
  }

  getById(id: string): Observable<User> {
    // TODO: Endpoint GET /api/users/:id non disponible dans le backend
    return throwError(() => new Error('Endpoint GET /api/users/:id non disponible. Fonctionnalité à implémenter dans le backend.'));
  }

  getByRole(role: string): Observable<User[]> {
    // TODO: Endpoint GET /api/users?role=... non disponible dans le backend
    return throwError(() => new Error('Endpoint GET /api/users?role=... non disponible. Fonctionnalité à implémenter dans le backend.'));
  }

  create(user: User): Observable<User> {
    // TODO: Endpoint POST /api/users non disponible dans le backend
    return throwError(() => new Error('Endpoint POST /api/users non disponible. Fonctionnalité à implémenter dans le backend.'));
  }

  update(id: string, updates: Partial<User>): Observable<User> {
    // TODO: Endpoint PUT /api/users/:id non disponible dans le backend
    return throwError(() => new Error('Endpoint PUT /api/users/:id non disponible. Fonctionnalité à implémenter dans le backend.'));
  }

  delete(id: string): Observable<void> {
    // TODO: Endpoint DELETE /api/users/:id non disponible dans le backend
    return throwError(() => new Error('Endpoint DELETE /api/users/:id non disponible. Fonctionnalité à implémenter dans le backend.'));
  }

  activate(id: string): Observable<User> {
    // TODO: Endpoint POST /api/users/:id/activate non disponible dans le backend
    return throwError(() => new Error('Endpoint POST /api/users/:id/activate non disponible. Fonctionnalité à implémenter dans le backend.'));
  }

  deactivate(id: string): Observable<User> {
    // TODO: Endpoint POST /api/users/:id/deactivate non disponible dans le backend
    return throwError(() => new Error('Endpoint POST /api/users/:id/deactivate non disponible. Fonctionnalité à implémenter dans le backend.'));
  }
}
