// src/app/core/application/use-cases/quiz/get-all-quizzes.use-case.ts
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Quiz } from '../../../domain/entities/quiz.entity';
import { IQuizRepository } from '../../../domain/repositories/quiz.repository.interface';

@Injectable({
  providedIn: 'root'
})
export class GetAllQuizzesUseCase {
  private repository = inject(IQuizRepository);

  execute(): Observable<Quiz[]> {
    return this.repository.getAll();
  }
}
