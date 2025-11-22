// src/app/core/domain/use-cases/quiz/add-question.use-case.ts
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Question, QuestionOption, QuestionType } from '../../../domain/entities/quiz.entity';
import { IQuizRepository } from '../../../domain/repositories/quiz.repository.interface';

export interface AddQuestionDto {
  quizId: string;
  text: string;
  type: QuestionType;
  points: number;
  options: { text: string; isCorrect: boolean }[];
  correctAnswer?: string | string[];
  explanation?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AddQuestionUseCase {
  private repository = inject(IQuizRepository);

  execute(dto: AddQuestionDto): Observable<Question> {
    this.validate(dto);

    const options = dto.options.map((opt, index) => 
      new QuestionOption(`opt-${Date.now()}-${index}`, opt.text, opt.isCorrect)
    );

    const question = new Question(
      this.generateId(),
      dto.text,
      dto.type,
      dto.points,
      options,
      dto.correctAnswer,
      dto.explanation
    );

    return this.repository.addQuestion(dto.quizId, question);
  }

  private validate(dto: AddQuestionDto): void {
    if (!dto.text || dto.text.trim().length === 0) {
      throw new Error('Le texte de la question est requis');
    }

    if (dto.points <= 0) {
      throw new Error('Les points doivent être supérieurs à 0');
    }

    if (dto.type === 'QCM' && dto.options.length < 2) {
      throw new Error('Un QCM doit avoir au moins 2 options');
    }

    if (dto.type === 'QCM' && !dto.options.some(opt => opt.isCorrect)) {
      throw new Error('Au moins une option doit être correcte');
    }
  }

  private generateId(): string {
    return `question-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
