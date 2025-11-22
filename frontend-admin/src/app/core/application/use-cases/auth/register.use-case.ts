// src/app/core/domain/use-cases/auth/register.use-case.ts
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { User, UserRole } from '../../../domain/entities/user.entity';
import { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';

export interface RegisterDto {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role?: UserRole;
}

@Injectable({
  providedIn: 'root'
})
export class RegisterUseCase {
  private repository = inject(IAuthRepository);

  execute(dto: RegisterDto): Observable<User> {
    this.validate(dto);

    return this.repository.register({
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: dto.role || 'student'
    }, dto.password);
  }

  private validate(dto: RegisterDto): void {
    if (!dto.email || !dto.email.includes('@')) {
      throw new Error('Email invalide');
    }

    if (!dto.firstName || dto.firstName.trim().length === 0) {
      throw new Error('Le prénom est requis');
    }

    if (!dto.lastName || dto.lastName.trim().length === 0) {
      throw new Error('Le nom est requis');
    }

    if (!dto.password || dto.password.length < 6) {
      throw new Error('Le mot de passe doit contenir au moins 6 caractères');
    }
  }
}
