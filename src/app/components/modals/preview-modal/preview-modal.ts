import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-preview-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="preview-modal-container">
      <div class="modal-header">
        <h2 mat-dialog-title>Prévisualisation du Quiz</h2>
        <button mat-icon-button (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>
      
      <mat-dialog-content class="modal-content">
        <div class="quiz-info">
          <h3>{{ data.quiz.title }}</h3>
          <p><strong>UE:</strong> {{ data.quiz.ue }}</p>
          <p><strong>Type:</strong> {{ data.quiz.type }}</p>
          <p><strong>Date de fin:</strong> {{ data.quiz.endDate }}</p>
          <p><strong>Classes:</strong> {{ data.quiz.classes?.join(', ') }}</p>
          <p><strong>Nombre de questions:</strong> {{ data.quiz.questions }}</p>
        </div>

        <div class="questions-section" *ngIf="data.quiz.questionsList">
          <h4>Questions</h4>
          <div *ngFor="let question of data.quiz.questionsList; let i = index" class="question-item">
            <p><strong>Question {{ i + 1 }}:</strong> {{ question.text }}</p>
            <ul class="answers-list">
              <li *ngFor="let answer of question.answers" 
                  [class.correct]="answer.isCorrect">
                {{ answer.text }}
                <span *ngIf="answer.isCorrect" class="correct-badge">✓ Correcte</span>
              </li>
            </ul>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-raised-button (click)="close()">Fermer</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .preview-modal-container {
      max-height: 80vh;
      display: flex;
      flex-direction: column;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-bottom: 1px solid #e0e0e0;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.5rem;
    }

    .modal-content {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
    }

    .quiz-info {
      background: #f5f5f5;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 24px;
    }

    .quiz-info h3 {
      margin-top: 0;
      color: #3f51b5;
    }

    .quiz-info p {
      margin: 8px 0;
    }

    .questions-section h4 {
      color: #3f51b5;
      margin-bottom: 16px;
    }

    .question-item {
      background: white;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 16px;
      border: 1px solid #e0e0e0;
    }

    .question-item p {
      margin-bottom: 12px;
      font-weight: 500;
    }

    .answers-list {
      list-style: none;
      padding: 0;
    }

    .answers-list li {
      padding: 8px 12px;
      margin: 4px 0;
      background: #f9f9f9;
      border-radius: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .answers-list li.correct {
      background: #e8f5e9;
      border-left: 3px solid #4caf50;
    }

    .correct-badge {
      color: #4caf50;
      font-weight: 600;
      font-size: 0.9rem;
    }

    mat-dialog-actions {
      padding: 16px 24px;
      border-top: 1px solid #e0e0e0;
    }
  `]
})
export class PreviewModalComponent {
  constructor(
    public dialogRef: MatDialogRef<PreviewModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { quiz: any }
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}
