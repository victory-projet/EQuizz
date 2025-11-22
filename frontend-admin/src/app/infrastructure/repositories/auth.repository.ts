// src/app/core/infrastructure/repositories/auth.repository.ts
import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { User, AuthToken, LoginCredentials } from '../../core/domain/entities/user.entity';
import { IAuthRepository, IUserRepository } from '../../core/domain/repositories/auth.repository.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthRepository implements IAuthRepository {
  private currentUser: User | null = null;
  private currentToken: AuthToken | null = null;

  login(credentials: LoginCredentials): Observable<AuthToken> {
    // Mock validation
    if (!credentials.isValid()) {
      return throwError(() => new Error('Identifiants invalides'));
    }

    // Mock authentication
    if (credentials.email === 'admin@equizz.com' && credentials.password === 'admin123') {
      const token = new AuthToken(
        'mock-access-token-' + Date.now(),
        'mock-refresh-token-' + Date.now(),
        3600,
        'Bearer'
      );

      this.currentToken = token;
      this.currentUser = new User(
        'user-1',
        credentials.email,
        'Admin',
        'User',
        'admin',
        true,
        new Date(),
        new Date()
      );

      return of(token).pipe(delay(500));
    }

    return throwError(() => new Error('Email ou mot de passe incorrect'));
  }

  logout(): Observable<void> {
    this.currentUser = null;
    this.currentToken = null;
    return of(void 0).pipe(delay(200));
  }

  refreshToken(refreshToken: string): Observable<AuthToken> {
    if (!refreshToken) {
      return throwError(() => new Error('Refresh token invalide'));
    }

    const newToken = new AuthToken(
      'mock-access-token-' + Date.now(),
      refreshToken,
      3600,
      'Bearer'
    );

    this.currentToken = newToken;
    return of(newToken).pipe(delay(300));
  }

  getCurrentUser(): Observable<User> {
    if (!this.currentUser) {
      return throwError(() => new Error('Utilisateur non connecté'));
    }
    return of(this.currentUser).pipe(delay(200));
  }

  register(userData: Partial<User>, password: string): Observable<User> {
    if (!userData.email || !userData.firstName || !userData.lastName) {
      return throwError(() => new Error('Données utilisateur incomplètes'));
    }

    if (password.length < 6) {
      return throwError(() => new Error('Le mot de passe doit contenir au moins 6 caractères'));
    }

    const user = new User(
      `user-${Date.now()}`,
      userData.email,
      userData.firstName,
      userData.lastName,
      userData.role || 'student',
      true,
      new Date()
    );

    return of(user).pipe(delay(500));
  }

  resetPassword(email: string): Observable<void> {
    if (!email || !email.includes('@')) {
      return throwError(() => new Error('Email invalide'));
    }

    // Mock: envoyer un email de réinitialisation
    return of(void 0).pipe(delay(500));
  }

  changePassword(oldPassword: string, newPassword: string): Observable<void> {
    if (!this.currentUser) {
      return throwError(() => new Error('Utilisateur non connecté'));
    }

    if (newPassword.length < 6) {
      return throwError(() => new Error('Le nouveau mot de passe doit contenir au moins 6 caractères'));
    }

    // Mock: changer le mot de passe
    return of(void 0).pipe(delay(500));
  }
}

@Injectable({
  providedIn: 'root'
})
export class UserRepository implements IUserRepository {
  private users: User[] = this.initMockData();

  getAll(): Observable<User[]> {
    return of([...this.users]).pipe(delay(300));
  }

  getById(id: string): Observable<User> {
    const user = this.users.find(u => u.id === id);
    if (!user) {
      return throwError(() => new Error(`Utilisateur ${id} non trouvé`));
    }
    return of(user).pipe(delay(200));
  }

  getByRole(role: string): Observable<User[]> {
    const filtered = this.users.filter(u => u.role === role);
    return of(filtered).pipe(delay(300));
  }

  create(user: User): Observable<User> {
    this.users.push(user);
    return of(user).pipe(delay(300));
  }

  update(id: string, updates: Partial<User>): Observable<User> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) {
      return throwError(() => new Error(`Utilisateur ${id} non trouvé`));
    }

    this.users[index] = { ...this.users[index], ...updates } as User;
    return of(this.users[index]).pipe(delay(300));
  }

  delete(id: string): Observable<void> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) {
      return throwError(() => new Error(`Utilisateur ${id} non trouvé`));
    }

    this.users.splice(index, 1);
    return of(void 0).pipe(delay(300));
  }

  activate(id: string): Observable<User> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) {
      return throwError(() => new Error(`Utilisateur ${id} non trouvé`));
    }

    this.users[index].activate();
    return of(this.users[index]).pipe(delay(300));
  }

  deactivate(id: string): Observable<User> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) {
      return throwError(() => new Error(`Utilisateur ${id} non trouvé`));
    }

    this.users[index].deactivate();
    return of(this.users[index]).pipe(delay(300));
  }

  private initMockData(): User[] {
    const admin = new User(
      'user-1',
      'admin@equizz.com',
      'Admin',
      'User',
      'admin',
      true,
      new Date('2024-01-01')
    );

    const teacher = new User(
      'user-2',
      'teacher@equizz.com',
      'Pierre',
      'Durand',
      'teacher',
      true,
      new Date('2024-01-15')
    );

    const student = new User(
      'user-3',
      'student@equizz.com',
      'Jean',
      'Dupont',
      'student',
      true,
      new Date('2024-09-01')
    );

    return [admin, teacher, student];
  }
}
