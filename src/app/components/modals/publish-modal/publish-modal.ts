import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-publish-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="publish-modal-container">
      <div class="modal-header">
        <h2 mat-dialog-title>Publier le Quiz</h2>
        <button mat-icon-button (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="modal-content">
        <div class="confirmation-message">
          <mat-icon class="warning-icon">info</mat-icon>
          <p>Êtes-vous sûr de vouloir publier ce quiz ?</p>
        </div>

        <div class="quiz-details">
          <h3>{{ data.quiz.title }}</h3>
          <div class="detail-row">
            <span class="label">UE:</span>
            <span class="value">{{ data.quiz.ue }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Type:</span>
            <span class="value">{{ data.quiz.type }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Date de fin:</span>
            <span class="value">{{ data.quiz.endDate }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Classes:</span>
            <span class="value">{{ data.quiz.classes?.join(', ') }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Questions:</span>
            <span class="value">{{ data.quiz.questions }}</span>
          </div>
        </div>

        <div class="info-box">
          <mat-icon>lightbulb</mat-icon>
          <p>Une fois publié, le quiz sera accessible aux étudiants des classes sélectionnées.</p>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="close()">Annuler</button>
        <button mat-raised-button color="primary" (click)="confirm()">
          Confirmer la publication
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .publish-modal-container {
      width: 500px;
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
      padding: 24px;
    }

    .confirmation-message {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
      padding: 16px;
      background: #e3f2fd;
      border-radius: 8px;
    }

    .warning-icon {
      color: #2196f3;
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .confirmation-message p {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 500;
    }

    .quiz-details {
      background: #f5f5f5;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .quiz-details h3 {
      margin-top: 0;
      margin-bottom: 16px;
      color: #3f51b5;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e0e0e0;
    }

    .detail-row:last-child {
      border-bottom: none;
    }

    .label {
      font-weight: 600;
      color: #666;
    }

    .value {
      color: #333;
    }

    .info-box {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px;
      background: #fff9c4;
      border-radius: 8px;
      border-left: 4px solid #fbc02d;
    }

    .info-box mat-icon {
      color: #f57f17;
      margin-top: 2px;
    }

    .info-box p {
      margin: 0;
      font-size: 0.9rem;
      color: #666;
    }

    mat-dialog-actions {
      padding: 16px 24px;
      border-top: 1px solid #e0e0e0;
    }
  `]
})
export class PublishModalComponent {
  constructor(
    public dialogRef: MatDialogRef<PublishModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { quiz: any }
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  confirm(): void {
    this.dialogRef.close({ confirmed: true });
  }
}
