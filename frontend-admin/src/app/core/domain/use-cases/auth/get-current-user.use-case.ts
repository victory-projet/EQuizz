// src/app/core/domain/use-cases/auth/get-current-user.use-case.ts
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../entities/user.entity';
import { IAuthRepository } from '../../repositories/auth.repository.interface';

@Injectable({
  providedIn: 'root'
})
export class GetCurrentUserUseCase {
  private repository = inject(IAuthRepository);

  execute(): Observable<User> {
    return this.repository.getCurrentUser();
  }
}
