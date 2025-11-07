import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-delete-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="delete-modal-container">
      <div class="modal-header">
        <mat-icon class="warning-icon">warning</mat-icon>
        <h2 mat-dialog-title>Supprimer {{ data.type || 'cet élément' }}</h2>
      </div>

      <mat-dialog-content class="modal-content">
        <p class="warning-text">
          Êtes-vous sûr de vouloir supprimer <strong>"{{ data.title || data.name }}"</strong> ?
        </p>
        
        <div class="danger-box">
          <mat-icon>error</mat-icon>
          <div>
            <p><strong>Cette action est irréversible!</strong></p>
            <p>Toutes les données associées seront définitivement perdues.</p>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="close()">Annuler</button>
        <button mat-raised-button color="warn" (click)="delete()">
          <mat-icon>delete</mat-icon>
          Supprimer
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .delete-modal-container {
      width: 450px;
      max-width: 95vw;
    }

    .modal-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 24px;
      border-bottom: 1px solid #e0e0e0;
      background: #f44336;
      color: white;

      .warning-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
      }

      h2 {
        margin: 0;
        color: white;
      }
    }

    .modal-content {
      padding: 24px;
    }

    .warning-text {
      font-size: 1.125rem;
      margin-bottom: 20px;
      color: #333;
    }

    .danger-box {
      display: flex;
      gap: 12px;
      padding: 16px;
      background: #ffebee;
      border-radius: 8px;
      border-left: 4px solid #f44336;

      mat-icon {
        color: #f44336;
        flex-shrink: 0;
      }

      p {
        margin: 4px 0;
        color: #666;
      }
    }
  `]
})
export class DeleteModalComponent {
  constructor(
    public dialogRef: MatDialogRef<DeleteModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  delete(): void {
    this.dialogRef.close({ confirmed: true });
  }
}
