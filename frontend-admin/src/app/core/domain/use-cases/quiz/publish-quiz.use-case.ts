// src/app/core/domain/use-cases/quiz/publish-quiz.use-case.ts
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Quiz } from '../../entities/quiz.entity';
import { IQuizRepository } from '../../repositories/quiz.repository.interface';

@Injectable({
  providedIn: 'root'
})
export class PublishQuizUseCase {
  private repository = inject(IQuizRepository);

  execute(id: string): Observable<Quiz> {
    return this.repository.publish(id);
  }
}
