// src/app/core/domain/repositories/auth.repository.interface.ts
import { Observable } from 'rxjs';
import { User, AuthToken, LoginCredentials } from '../entities/user.entity';

/**
 * Repository Interface - Authentication
 */
export abstract class IAuthRepository {
  abstract login(credentials: LoginCredentials): Observable<AuthToken>;
  abstract logout(): Observable<void>;
  abstract refreshToken(refreshToken: string): Observable<AuthToken>;
  abstract getCurrentUser(): Observable<User>;
  abstract register(user: Partial<User>, password: string): Observable<User>;
  abstract resetPassword(email: string): Observable<void>;
  abstract changePassword(oldPassword: string, newPassword: string): Observable<void>;
}

/**
 * Repository Interface - User
 */
export abstract class IUserRepository {
  abstract getAll(): Observable<User[]>;
  abstract getById(id: string): Observable<User>;
  abstract getByRole(role: string): Observable<User[]>;
  abstract create(user: User): Observable<User>;
  abstract update(id: string, user: Partial<User>): Observable<User>;
  abstract delete(id: string): Observable<void>;
  abstract activate(id: string): Observable<User>;
  abstract deactivate(id: string): Observable<User>;
}
