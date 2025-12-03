// Repository Interface - Auth
import { Observable } from 'rxjs';
import { User } from '../entities/user.entity';

export interface LoginCredentials {
  email?: string;
  matricule?: string;
  motDePasse: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export abstract class AuthRepositoryInterface {
  abstract login(credentials: LoginCredentials): Observable<LoginResponse>;
  abstract logout(): Observable<void>;
  abstract getCurrentUser(): Observable<User>;
  abstract refreshToken(): Observable<{ token: string }>;
  abstract updateProfile(data: Partial<User>): Observable<User>;
  abstract changePassword(oldPassword: string, newPassword: string): Observable<void>;
}
