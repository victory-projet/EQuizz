// src/app/core/application/use-cases/quiz/get-quiz-by-id.use-case.ts
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Quiz } from '../../../domain/entities/quiz.entity';
import { IQuizRepository } from '../../../domain/repositories/quiz.repository.interface';

@Injectable({
  providedIn: 'root'
})
export class GetQuizByIdUseCase {
  private repository = inject(IQuizRepository);

  execute(id: string): Observable<Quiz> {
    return this.repository.getById(id);
  }
}
