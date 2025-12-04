// Infrastructure - Auth Repository Implementation
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthRepositoryInterface, LoginCredentials, LoginResponse } from '../../core/domain/repositories/auth.repository.interface';
import { User } from '../../core/domain/entities/user.entity';
import { ApiService } from '../http/api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthRepository implements AuthRepositoryInterface {
  constructor(private api: ApiService) {}

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return new Observable<LoginResponse>(observer => {
      this.api.post<any>('/auth/login', credentials).subscribe({
        next: (response) => {
          const mappedResponse: LoginResponse = {
            token: response.token,
            user: response.utilisateur || response.user
          };
          observer.next(mappedResponse);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  logout(): Observable<void> {
    return this.api.post<void>('/auth/logout', {});
  }

  getCurrentUser(): Observable<User> {
    return this.api.get<User>('/auth/me');
  }

  refreshToken(): Observable<{ token: string }> {
    return this.api.post<{ token: string }>('/auth/refresh', {});
  }

  updateProfile(data: Partial<User>): Observable<User> {
    return this.api.put<User>('/auth/profile', data);
  }

  changePassword(oldPassword: string, newPassword: string): Observable<void> {
    return this.api.post<void>('/auth/change-password', { oldPassword, newPassword });
  }
}
