// src/app/core/domain/entities/quiz.entity.ts
/**
 * Domain Entities - Quiz
 */

export type QuestionType = 'QCM' | 'closed' | 'open';
export type QuizStatus = 'draft' | 'published' | 'active' | 'closed';

export class Quiz {
  constructor(
    public readonly id: string,
    public title: string,
    public subject: string,
    public status: QuizStatus,
    public questions: Question[],
    public classIds: string[],
    public createdDate: Date,
    public endDate?: Date,
    public type?: string,
    public description?: string,
    public semesterId?: string,
    public academicYearId?: string
  ) {}

  /**
   * Vérifie si le quiz peut être modifié
   */
  canBeEdited(): boolean {
    return this.status === 'draft';
  }

  /**
   * Vérifie si le quiz est actif
   */
  isActive(): boolean {
    return this.status === 'active';
  }

  /**
   * Vérifie si le quiz est un brouillon
   */
  isDraft(): boolean {
    return this.status === 'draft';
  }

  /**
   * Obtient le statut actuel du quiz en tenant compte de la date de fin
   */
  getCurrentStatus(): QuizStatus {
    // Si c'est un brouillon, retourner draft
    if (this.status === 'draft') {
      return 'draft';
    }

    // Si le quiz a une date de fin et qu'elle est passée, il est fermé
    if (this.endDate && new Date() > this.endDate) {
      return 'closed';
    }

    // Sinon, retourner le statut actuel
    return this.status;
  }

  /**
   * Vérifie si le quiz est terminé (date de fin passée)
   */
  isExpired(): boolean {
    return this.endDate !== undefined && new Date() > this.endDate;
  }

  /**
   * Publie le quiz
   */
  publish(): void {
    if (this.questions.length === 0) {
      throw new Error('Impossible de publier un quiz sans questions');
    }
    this.status = 'active';
  }

  /**
   * Clôture le quiz
   */
  close(): void {
    this.status = 'closed';
  }

  /**
   * Ajoute une question
   */
  addQuestion(question: Question): void {
    if (!this.canBeEdited()) {
      throw new Error('Impossible de modifier un quiz publié');
    }
    this.questions.push(question);
  }

  /**
   * Supprime une question
   */
  removeQuestion(questionId: string): void {
    if (!this.canBeEdited()) {
      throw new Error('Impossible de modifier un quiz publié');
    }
    this.questions = this.questions.filter(q => q.id !== questionId);
  }

  /**
   * Calcule le score total
   */
  getTotalPoints(): number {
    return this.questions.reduce((sum, q) => sum + q.points, 0);
  }
}

export class Question {
  constructor(
    public readonly id: string,
    public text: string,
    public type: QuestionType,
    public points: number,
    public options: QuestionOption[],
    public correctAnswer?: string | string[],
    public explanation?: string
  ) {}

  /**
   * Vérifie si une réponse est correcte
   */
  isCorrectAnswer(answer: string | string[]): boolean {
    if (this.type === 'QCM' && Array.isArray(this.correctAnswer)) {
      const answerArray = Array.isArray(answer) ? answer : [answer];
      return JSON.stringify(answerArray.sort()) === JSON.stringify(this.correctAnswer.sort());
    }
    return answer === this.correctAnswer;
  }

  /**
   * Calcule le score pour une réponse
   */
  calculateScore(answer: string | string[]): number {
    return this.isCorrectAnswer(answer) ? this.points : 0;
  }
}

export class QuestionOption {
  constructor(
    public readonly id: string,
    public text: string,
    public isCorrect: boolean
  ) {}
}

export class QuizSubmission {
  constructor(
    public readonly id: string,
    public quizId: string,
    public studentId: string,
    public answers: QuizAnswer[],
    public submittedAt: Date,
    public score?: number,
    public totalPoints?: number
  ) {}

  /**
   * Calcule le score total
   */
  calculateTotalScore(quiz: Quiz): number {
    return this.answers.reduce((sum, answer) => {
      const question = quiz.questions.find(q => q.id === answer.questionId);
      return sum + (question?.calculateScore(answer.answer) || 0);
    }, 0);
  }

  /**
   * Calcule le pourcentage
   */
  getPercentage(quiz: Quiz): number {
    const total = quiz.getTotalPoints();
    const score = this.calculateTotalScore(quiz);
    return total > 0 ? (score / total) * 100 : 0;
  }
}

export class QuizAnswer {
  constructor(
    public questionId: string,
    public answer: string | string[]
  ) {}
}
