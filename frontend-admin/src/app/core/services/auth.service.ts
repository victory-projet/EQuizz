// src/app/core/services/auth.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { User } from '../domain/entities/user.entity';
import { GetCurrentUserUseCase } from '../application/use-cases/auth/get-current-user.use-case';
import { LogoutUseCase } from '../application/use-cases/auth/logout.use-case';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private getCurrentUserUseCase = inject(GetCurrentUserUseCase);
  private logoutUseCase = inject(LogoutUseCase);
  private router = inject(Router);

  // Signal pour l'utilisateur connecté
  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);

  constructor() {
    this.checkAuthentication();
  }

  /**
   * Vérifie si l'utilisateur est authentifié au démarrage
   */
  private checkAuthentication(): void {
    const token = localStorage.getItem('auth_token');
    if (token) {
      this.loadCurrentUser();
    }
  }

  /**
   * Charge les informations de l'utilisateur connecté
   */
  loadCurrentUser(): void {
    this.getCurrentUserUseCase.execute().subscribe({
      next: (user) => {
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'utilisateur:', error);
        this.logout();
      }
    });
  }

  /**
   * Déconnexion
   */
  logout(): void {
    this.logoutUseCase.execute().subscribe({
      next: () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        this.currentUser.set(null);
        this.isAuthenticated.set(false);
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Erreur lors de la déconnexion:', error);
        // Forcer la déconnexion même en cas d'erreur
        localStorage.removeItem('auth_token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        this.currentUser.set(null);
        this.isAuthenticated.set(false);
        this.router.navigate(['/login']);
      }
    });
  }

  /**
   * Obtenir le nom complet de l'utilisateur
   */
  getUserFullName(): string {
    const user = this.currentUser();
    return user ? user.getFullName() : '';
  }

  /**
   * Obtenir le rôle de l'utilisateur
   */
  getUserRole(): string {
    const user = this.currentUser();
    return user ? user.role : '';
  }

  /**
   * Obtenir l'email de l'utilisateur
   */
  getUserEmail(): string {
    const user = this.currentUser();
    return user ? user.email : '';
  }

  /**
   * Vérifier si l'utilisateur a un rôle spécifique
   */
  hasRole(role: string): boolean {
    return this.getUserRole() === role;
  }

  /**
   * Vérifier si l'utilisateur est admin
   */
  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  /**
   * Vérifier si l'utilisateur est enseignant
   */
  isTeacher(): boolean {
    return this.hasRole('teacher');
  }

  /**
   * Vérifier si l'utilisateur est étudiant
   */
  isStudent(): boolean {
    return this.hasRole('student');
  }
}
