import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-generate-quiz-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="generate-quiz-modal">
      <div class="modal-header">
        <h2 mat-dialog-title>Créer un Nouveau Quiz</h2>
        <button mat-icon-button (click)="close()" class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="modal-content">
        <p class="subtitle">Choisissez votre méthode de création</p>
        
        <div class="options-container">
          <div class="option-card" (click)="selectManual()">
            <div class="option-icon manual">
              <span class="icon">✏️</span>
            </div>
            <h3>Création Manuelle</h3>
            <p>Créez votre quiz en configurant manuellement tous les paramètres et questions</p>
            <button mat-raised-button color="primary">
              <mat-icon>edit_note</mat-icon>
              Créer manuellement
            </button>
          </div>

          <div class="divider">
            <span>OU</span>
          </div>

        </div>
      </mat-dialog-content>
    </div>
  `,
  styles: [`
    .generate-quiz-modal {
      width: 900px;
      max-width: 95vw;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 32px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;

      h2 {
        margin: 0;
        font-size: 1.75rem;
        font-weight: 700;
        color: white;
      }

      .close-btn {
        color: white;
      }
    }

    .modal-content {
      padding: 32px;
    }

    .subtitle {
      text-align: center;
      font-size: 1.125rem;
      color: #666;
      margin: 0 0 32px 0;
    }

    .options-container {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      gap: 32px;
      margin-bottom: 32px;
      align-items: stretch;
    }

    .option-card {
      background: #ffffff;
      border: 2px solid #e0e0e0;
      border-radius: 16px;
      padding: 32px 24px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
      align-items: center;

      &:hover {
        border-color: #667eea;
        box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
        transform: translateY(-4px);
      }

      .option-icon {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 20px;
        
        &.manual {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        &.import {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }

        .icon {
          font-size: 40px;
        }
      }

      h3 {
        margin: 0 0 12px 0;
        font-size: 1.375rem;
        color: #333;
        font-weight: 600;
      }

      p {
        margin: 0 0 24px 0;
        color: #666;
        font-size: 0.9375rem;
        line-height: 1.5;
        min-height: 60px;
        flex: 1;
      }

      button {
        width: 100%;
        height: 44px;
        font-size: 1rem;
        font-weight: 500;

        mat-icon {
          margin-right: 8px;
        }
      }
    }

    .divider {
      display: flex;
      align-items: center;
      justify-content: center;

      span {
        background: white;
        padding: 12px 20px;
        border: 2px solid #e0e0e0;
        border-radius: 24px;
        font-weight: 700;
        color: #999;
        font-size: 0.875rem;
      }
    }

    .info-section {
      display: flex;
      gap: 16px;
      padding: 24px;
      background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
      border-radius: 12px;
      border-left: 4px solid #667eea;

      mat-icon {
        color: #667eea;
        flex-shrink: 0;
        font-size: 28px;
        width: 28px;
        height: 28px;
      }

      p {
        margin: 0 0 12px 0;
        color: #333;
        font-weight: 600;
      }

      ul {
        margin: 8px 0 16px 0;
        padding-left: 20px;
        color: #666;

        li {
          margin: 6px 0;
          font-size: 0.9375rem;
          line-height: 1.5;
        }
      }

      .download-link {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: #667eea;
        text-decoration: none;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          color: #764ba2;
          text-decoration: underline;
        }

        mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
        }
      }
    }

    @media (max-width: 768px) {
      .options-container {
        grid-template-columns: 1fr;

        .divider {
          transform: rotate(90deg);
        }
      }
    }
  `]
})
export class GenerateQuizModalComponent {
  constructor(
    public dialogRef: MatDialogRef<GenerateQuizModalComponent>
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  selectManual(): void {
    this.dialogRef.close({ type: 'manual' });
  }

  selectImport(): void {
    this.dialogRef.close({ type: 'import' });
  }

  downloadTemplate(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    console.log('Téléchargement du template Excel...');
    // TODO: Implémenter le téléchargement du template
  }
}
