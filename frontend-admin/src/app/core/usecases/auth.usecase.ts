// Use Case - Auth
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthRepositoryInterface, LoginCredentials, LoginResponse } from '../domain/repositories/auth.repository.interface';
import { User } from '../domain/entities/user.entity';

@Injectable({
  providedIn: 'root'
})
export class AuthUseCase {
  constructor(private authRepository: AuthRepositoryInterface) {}

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.authRepository.login(credentials);
  }

  logout(): Observable<void> {
    return this.authRepository.logout();
  }

  getCurrentUser(): Observable<User> {
    return this.authRepository.getCurrentUser();
  }

  refreshToken(): Observable<{ token: string }> {
    return this.authRepository.refreshToken();
  }

  updateProfile(data: Partial<User>): Observable<User> {
    return this.authRepository.updateProfile(data);
  }

  changePassword(oldPassword: string, newPassword: string): Observable<void> {
    return this.authRepository.changePassword(oldPassword, newPassword);
  }
}
