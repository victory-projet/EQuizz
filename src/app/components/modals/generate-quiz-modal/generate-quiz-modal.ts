import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-generate-quiz-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule
  ],
  template: `
    <div class="generate-quiz-modal">
      <div class="modal-header">
        <h2 mat-dialog-title>Générer un Quiz</h2>
        <button mat-icon-button (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="modal-content">
        <div class="options-container">
          <div class="option-card" (click)="selectManual()">
            <div class="option-icon">
              <mat-icon>edit_note</mat-icon>
            </div>
            <h3>Création Manuelle</h3>
            <p>Créez votre quiz en configurant manuellement tous les champs</p>
            <button mat-raised-button color="primary">
              <mat-icon>add</mat-icon>
              Créer manuellement
            </button>
          </div>

          <div class="divider">
            <span>OU</span>
          </div>

          <div class="option-card" (click)="selectImport()">
            <div class="option-icon">
              <mat-icon>upload_file</mat-icon>
            </div>
            <h3>Importer depuis Excel</h3>
            <p>Importez vos questions depuis un fichier Excel</p>
            <button mat-raised-button color="accent">
              <mat-icon>file_upload</mat-icon>
              Importer un fichier
            </button>
          </div>
        </div>

        <div class="info-section">
          <mat-icon>info</mat-icon>
          <div>
            <p><strong>Format du fichier Excel requis:</strong></p>
            <ul>
              <li>Colonne A : Type de question (multiple/ouverte/fermée)</li>
              <li>Colonne B : Texte de la question</li>
              <li>Colonnes C-F : Options de réponse (pour choix multiple)</li>
            </ul>
            <a href="#" class="download-link" (click)="downloadTemplate($event)">
              <mat-icon>download</mat-icon>
              Télécharger le modèle Excel
            </a>
          </div>
        </div>
      </mat-dialog-content>
    </div>
  `,
  styles: [`
    .generate-quiz-modal {
      width: 800px;
      max-width: 95vw;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid #e0e0e0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;

      h2 {
        margin: 0;
        font-size: 1.5rem;
        color: white;
      }

      button {
        color: white;
      }
    }

    .modal-content {
      padding: 32px 24px;
    }

    .options-container {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      gap: 24px;
      margin-bottom: 32px;
      align-items: center;
    }

    .option-card {
      background: #f8f9fa;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      padding: 32px 24px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        border-color: #3f51b5;
        box-shadow: 0 4px 12px rgba(63, 81, 181, 0.2);
        transform: translateY(-4px);
      }

      .option-icon {
        margin-bottom: 16px;

        mat-icon {
          font-size: 64px;
          width: 64px;
          height: 64px;
          color: #3f51b5;
        }
      }

      h3 {
        margin: 0 0 12px 0;
        font-size: 1.25rem;
        color: #333;
      }

      p {
        margin: 0 0 24px 0;
        color: #666;
        font-size: 0.9rem;
        min-height: 40px;
      }

      button {
        width: 100%;

        mat-icon {
          margin-right: 8px;
        }
      }
    }

    .divider {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;

      span {
        background: white;
        padding: 8px 16px;
        border: 2px solid #e0e0e0;
        border-radius: 20px;
        font-weight: 600;
        color: #999;
      }
    }

    .info-section {
      display: flex;
      gap: 16px;
      padding: 20px;
      background: #e3f2fd;
      border-radius: 8px;
      border-left: 4px solid #2196f3;

      mat-icon {
        color: #2196f3;
        flex-shrink: 0;
      }

      p {
        margin: 0 0 12px 0;
        color: #333;
      }

      ul {
        margin: 8px 0;
        padding-left: 20px;
        color: #666;

        li {
          margin: 4px 0;
          font-size: 0.9rem;
        }
      }

      .download-link {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: #2196f3;
        text-decoration: none;
        font-weight: 500;
        margin-top: 12px;
        cursor: pointer;

        &:hover {
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
          span {
            transform: rotate(90deg);
          }
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
    // Logique pour télécharger le template Excel
    console.log('Téléchargement du template Excel...');
  }
}
