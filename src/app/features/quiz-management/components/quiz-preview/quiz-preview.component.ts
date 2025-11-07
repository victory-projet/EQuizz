import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatCardModule } from '@angular/material/card';
import { Quiz, Question } from '../../../../shared/interfaces/quiz.interface';

export interface QuizPreviewData {
  quiz: Quiz;
  questions: Question[];
}

@Component({
  selector: 'app-quiz-preview',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    MatCardModule
  ],
  templateUrl: './quiz-preview.component.html',
  styleUrls: ['./quiz-preview.component.scss']
})
export class QuizPreviewComponent {
  currentQuestionIndex = 0;
  selectedAnswers: Map<string, any> = new Map();
  String = String; // Exposer String pour le template

  constructor(
    public dialogRef: MatDialogRef<QuizPreviewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: QuizPreviewData
  ) {}

  get currentQuestion(): Question {
    return this.data.questions[this.currentQuestionIndex];
  }

  get progress(): number {
    return ((this.currentQuestionIndex + 1) / this.data.questions.length) * 100;
  }

  get isFirstQuestion(): boolean {
    return this.currentQuestionIndex === 0;
  }

  get isLastQuestion(): boolean {
    return this.currentQuestionIndex === this.data.questions.length - 1;
  }

  nextQuestion(): void {
    if (!this.isLastQuestion) {
      this.currentQuestionIndex++;
    }
  }

  previousQuestion(): void {
    if (!this.isFirstQuestion) {
      this.currentQuestionIndex--;
    }
  }

  goToQuestion(index: number): void {
    this.currentQuestionIndex = index;
  }

  selectAnswer(questionId: string, answer: any): void {
    this.selectedAnswers.set(questionId, answer);
  }

  getSelectedAnswer(questionId: string): any {
    return this.selectedAnswers.get(questionId);
  }

  onInputChange(event: Event, questionId: string): void {
    const target = event.target as HTMLInputElement;
    if (target) {
      this.selectAnswer(questionId, target.value);
    }
  }

  onTextareaChange(event: Event, questionId: string): void {
    const target = event.target as HTMLTextAreaElement;
    if (target) {
      this.selectAnswer(questionId, target.value);
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  getTotalPoints(): number {
    return this.data.questions.reduce((sum, q) => sum + q.points, 0);
  }
}
