// src/app/core/application/use-cases/quiz/delete-quiz.use-case.ts
import { Injectable, inject } from '@angular/core';
import { Observable, switchMap, throwError } from 'rxjs';
import { IQuizRepository } from '../../../domain/repositories/quiz.repository.interface';

@Injectable({
  providedIn: 'root'
})
export class DeleteQuizUseCase {
  private repository = inject(IQuizRepository);

  execute(id: string): Observable<void> {
    return this.repository.getById(id).pipe(
      switchMap(quiz => {
        if (quiz.status === 'active') {
          return throwError(() => new Error('Impossible de supprimer un quiz actif'));
        }
        return this.repository.delete(id);
      })
    );
  }
}
