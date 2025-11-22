// src/app/core/application/use-cases/quiz/update-quiz.use-case.ts
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Quiz } from '../../../domain/entities/quiz.entity';
import { IQuizRepository } from '../../../domain/repositories/quiz.repository.interface';

export interface UpdateQuizDto {
  id: string;
  title?: string;
  description?: string;
  subject?: string;
  classIds?: string[];
  endDate?: Date;
  status?: 'draft' | 'active' | 'closed';
  questions?: any[]; // Questions du quiz
  semesterId?: string;
  academicYearId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UpdateQuizUseCase {
  private repository = inject(IQuizRepository);

  execute(dto: UpdateQuizDto): Observable<Quiz> {
    this.validate(dto);
    return this.repository.update(dto.id, dto);
  }

  private validate(dto: UpdateQuizDto): void {
    if (dto.title !== undefined && dto.title.trim().length === 0) {
      throw new Error('Le titre ne peut pas être vide');
    }

    if (dto.classIds !== undefined && dto.classIds.length === 0) {
      throw new Error('Au moins une classe doit être sélectionnée');
    }
  }
}
