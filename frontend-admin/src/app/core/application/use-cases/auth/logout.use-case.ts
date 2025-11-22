// src/app/core/domain/use-cases/auth/logout.use-case.ts
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';

@Injectable({
  providedIn: 'root'
})
export class LogoutUseCase {
  private repository = inject(IAuthRepository);

  execute(): Observable<void> {
    return this.repository.logout().pipe(
      tap(() => {
        // Supprimer les tokens
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      })
    );
  }
}
