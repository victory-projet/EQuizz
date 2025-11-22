// src/app/core/domain/use-cases/quiz/submit-quiz.use-case.ts
import { Injectable, inject } from '@angular/core';
import { Observable, switchMap, map } from 'rxjs';
import { QuizSubmission, QuizAnswer } from '../../../domain/entities/quiz.entity';
import { IQuizRepository, IQuizSubmissionRepository } from '../../../domain/repositories/quiz.repository.interface';

export interface SubmitQuizDto {
  quizId: string;
  studentId: string;
  answers: { questionId: string; answer: string | string[] }[];
}

@Injectable({
  providedIn: 'root'
})
export class SubmitQuizUseCase {
  private quizRepository = inject(IQuizRepository);
  private submissionRepository = inject(IQuizSubmissionRepository);

  execute(dto: SubmitQuizDto): Observable<QuizSubmission> {
    this.validate(dto);

    return this.quizRepository.getById(dto.quizId).pipe(
      switchMap(quiz => {
        const answers = dto.answers.map(a => new QuizAnswer(a.questionId, a.answer));
        
        const submission = new QuizSubmission(
          this.generateId(),
          dto.quizId,
          dto.studentId,
          answers,
          new Date()
        );

        // Calculer le score
        submission.score = submission.calculateTotalScore(quiz);
        submission.totalPoints = quiz.getTotalPoints();

        return this.submissionRepository.submit(submission);
      })
    );
  }

  private validate(dto: SubmitQuizDto): void {
    if (!dto.quizId) {
      throw new Error('Quiz ID requis');
    }

    if (!dto.studentId) {
      throw new Error('Student ID requis');
    }

    if (!dto.answers || dto.answers.length === 0) {
      throw new Error('Au moins une réponse est requise');
    }
  }

  private generateId(): string {
    return `submission-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
