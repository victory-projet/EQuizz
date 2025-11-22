// src/app/core/domain/use-cases/auth/login.use-case.ts
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { LoginCredentials, AuthToken } from '../../../domain/entities/user.entity';
import { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';

export interface LoginDto {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoginUseCase {
  private repository = inject(IAuthRepository);

  execute(dto: LoginDto): Observable<AuthToken> {
    const credentials = new LoginCredentials(dto.email, dto.password);
    
    if (!credentials.isValid()) {
      throw new Error('Email ou mot de passe invalide');
    }

    return this.repository.login(credentials).pipe(
      tap(token => {
        // Stocker le token (localStorage, sessionStorage, etc.)
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', token.accessToken);
          localStorage.setItem('refresh_token', token.refreshToken);
        }
      })
    );
  }
}
