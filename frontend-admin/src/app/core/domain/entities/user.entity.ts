// src/app/core/domain/entities/user.entity.ts
/**
 * Domain Entities - User & Authentication
 */

export type UserRole = 'admin' | 'teacher' | 'student';

export class User {
  constructor(
    public readonly id: string,
    public email: string,
    public firstName: string,
    public lastName: string,
    public role: UserRole,
    public isActive: boolean,
    public createdAt: Date,
    public lastLoginAt?: Date
  ) {}

  /**
   * Nom complet
   */
  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  /**
   * Vérifie si l'utilisateur est admin
   */
  isAdmin(): boolean {
    return this.role === 'admin';
  }

  /**
   * Vérifie si l'utilisateur est enseignant
   */
  isTeacher(): boolean {
    return this.role === 'teacher';
  }

  /**
   * Vérifie si l'utilisateur est étudiant
   */
  isStudent(): boolean {
    return this.role === 'student';
  }

  /**
   * Active l'utilisateur
   */
  activate(): void {
    this.isActive = true;
  }

  /**
   * Désactive l'utilisateur
   */
  deactivate(): void {
    this.isActive = false;
  }

  /**
   * Met à jour la dernière connexion
   */
  updateLastLogin(): void {
    this.lastLoginAt = new Date();
  }
}

export class AuthToken {
  constructor(
    public accessToken: string,
    public refreshToken: string,
    public expiresIn: number,
    public tokenType: string = 'Bearer'
  ) {}

  /**
   * Vérifie si le token est expiré
   */
  isExpired(): boolean {
    // Logique à implémenter
    return false;
  }
}

export class LoginCredentials {
  constructor(
    public email: string,
    public password: string
  ) {}

  /**
   * Valide les credentials
   */
  isValid(): boolean {
    return this.email.length > 0 && this.password.length >= 6;
  }
}
