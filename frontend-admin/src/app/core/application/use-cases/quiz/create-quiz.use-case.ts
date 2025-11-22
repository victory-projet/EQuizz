// src/app/core/application/use-cases/quiz/create-quiz.use-case.ts
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Quiz } from '../../../domain/entities/quiz.entity';
import { IQuizRepository } from '../../../domain/repositories/quiz.repository.interface';

export interface CreateQuizDto {
  title: string;
  subject: string;
  classIds: string[];
  type?: string;
  endDate?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CreateQuizUseCase {
  private repository = inject(IQuizRepository);

  // Accepte soit un DTO soit une entité Quiz
  execute(input: CreateQuizDto | Quiz): Observable<Quiz> {
    let quiz: Quiz;

    if (input instanceof Quiz) {
      // Si c'est déjà une entité Quiz, l'utiliser directement
      quiz = input;
    } else {
      // Sinon, créer l'entité à partir du DTO
      this.validate(input);
      quiz = new Quiz(
        this.generateId(),
        input.title,
        input.subject,
        'draft',
        [],
        input.classIds,
        new Date(),
        input.endDate,
        input.type
      );
    }

    return this.repository.create(quiz);
  }

  private validate(dto: CreateQuizDto): void {
    if (!dto.title || dto.title.trim().length === 0) {
      throw new Error('Le titre du quiz est requis');
    }

    if (!dto.subject || dto.subject.trim().length === 0) {
      throw new Error('La matière est requise');
    }

    if (!dto.classIds || dto.classIds.length === 0) {
      throw new Error('Au moins une classe doit être sélectionnée');
    }
  }

  private generateId(): string {
    return `quiz-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
