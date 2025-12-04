// Presentation Service - Auth State Management
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthUseCase } from '../../../core/usecases/auth.usecase';
import { LoginCredentials, LoginResponse } from '../../../core/domain/repositories/auth.repository.interface';
import { User } from '../../../core/domain/entities/user.entity';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);

  constructor(
    private authUseCase: AuthUseCase,
    private router: Router
  ) {
    this.checkAuth();
  }

  private checkAuth(): void {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && token !== 'undefined' && token !== 'null' && 
        userStr && userStr !== 'undefined' && userStr !== 'null') {
      try {
        const user = JSON.parse(userStr);
        if (user && user.id) {
          this.currentUser.set(user);
          this.isAuthenticated.set(true);
          return;
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    
    this.clearAuthSilent();
  }
  
  private clearAuthSilent(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return new Observable<LoginResponse>(observer => {
      this.authUseCase.login(credentials).subscribe({
        next: (response) => {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          this.currentUser.set(response.user);
          this.isAuthenticated.set(true);
          observer.next(response);
          observer.complete();
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 100);
        },
        error: (error) => {
          console.error('Login failed', error);
          observer.error(error);
        }
      });
    });
  }

  logout(): void {
    this.clearAuth();
  }

  private clearAuth(): void {
    this.clearAuthSilent();
    this.router.navigate(['/login']);
  }
}
