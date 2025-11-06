import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-delete-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="delete-modal-container">
      <div class="modal-header">
        <h2 mat-dialog-title>Supprimer le Quiz</h2>
        <button mat-icon-button (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="modal-content">
        <div class="warning-message">
          <mat-icon class="warning-icon">warning</mat-icon>
          <div>
            <h3>Attention !</h3>
            <p>Cette action est irréversible.</p>
          </div>
        </div>

        <div class="quiz-info">
          <p>Vous êtes sur le point de supprimer le quiz :</p>
          <div class="quiz-title">{{ data.quiz.title }}</div>
          <p class="quiz-meta">{{ data.quiz.ue }} - {{ data.quiz.type }}</p>
        </div>

        <div class="confirmation-text">
          <p>Êtes-vous sûr de vouloir continuer ?</p>
          <p class="small-text">Toutes les données associées à ce quiz seront définitivement supprimées.</p>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="close()">Annuler</button>
        <button mat-raised-button color="warn" (click)="confirm()">
          <mat-icon>delete</mat-icon>
          Supprimer définitivement
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .delete-modal-container {
      width: 450px;
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
      color: #d32f2f;
    }

    .modal-content {
      padding: 24px;
    }

    .warning-message {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 16px;
      background: #ffebee;
      border-radius: 8px;
      border-left: 4px solid #d32f2f;
      margin-bottom: 24px;
    }

    .warning-icon {
      color: #d32f2f;
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .warning-message h3 {
      margin: 0 0 4px 0;
      color: #d32f2f;
      font-size: 1.1rem;
    }

    .warning-message p {
      margin: 0;
      color: #666;
    }

    .quiz-info {
      margin-bottom: 24px;
    }

    .quiz-info > p {
      margin-bottom: 12px;
      color: #666;
    }

    .quiz-title {
      font-size: 1.2rem;
      font-weight: 600;
      color: #333;
      padding: 12px;
      background: #f5f5f5;
      border-radius: 4px;
      margin-bottom: 8px;
    }

    .quiz-meta {
      color: #999;
      font-size: 0.9rem;
      margin: 0;
    }

    .confirmation-text {
      padding: 16px;
      background: #fff3e0;
      border-radius: 8px;
    }

    .confirmation-text p {
      margin: 0 0 8px 0;
      font-weight: 500;
    }

    .small-text {
      font-size: 0.85rem;
      color: #666;
      font-weight: normal !important;
    }

    mat-dialog-actions {
      padding: 16px 24px;
      border-top: 1px solid #e0e0e0;
    }

    mat-dialog-actions button[color="warn"] {
      background-color: #d32f2f;
      color: white;
    }

    mat-dialog-actions button[color="warn"]:hover {
      background-color: #b71c1c;
    }
  `]
})
export class DeleteModalComponent {
  constructor(
    public dialogRef: MatDialogRef<DeleteModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { quiz: any }
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  confirm(): void {
    this.dialogRef.close({ confirmed: true });
  }
}
