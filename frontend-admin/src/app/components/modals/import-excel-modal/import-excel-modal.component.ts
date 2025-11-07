import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-import-excel-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule
  ],
  template: `
    <div class="import-excel-modal">
      <div class="modal-header">
        <h2 mat-dialog-title>Importer des Questions depuis Excel</h2>
        <button mat-icon-button (click)="close()" class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="modal-content">
        @if (!fileSelected()) {
          <!-- Upload Section -->
          <div class="upload-section">
            <div class="upload-area" 
                 (click)="fileInput.click()"
                 (dragover)="onDragOver($event)"
                 (drop)="onDrop($event)">
              <div class="upload-icon">📤</div>
              <p class="upload-text">Glissez-déposez votre fichier Excel ici</p>
              <p class="upload-hint">ou cliquez pour parcourir</p>
              <button mat-raised-button color="primary">
                <mat-icon>folder_open</mat-icon>
                Choisir un fichier
              </button>
            </div>
            <input #fileInput 
                   type="file" 
                   accept=".xlsx,.xls" 
                   (change)="onFileSelected($event)"
                   style="display: none;">

            <div class="format-info">
              <h4>📋 Format du fichier Excel</h4>
              <ul>
                <li><strong>Colonne A :</strong> Type de question (QCM/Ouverte/Fermée)</li>
                <li><strong>Colonne B :</strong> Texte de la question</li>
                <li><strong>Colonnes C-F :</strong> Options de réponse (pour QCM)</li>
                <li><strong>Colonne G :</strong> Réponse correcte</li>
              </ul>
              <a href="#" class="download-link" (click)="downloadTemplate($event)">
                <mat-icon>download</mat-icon>
                Télécharger le modèle Excel
              </a>
            </div>
          </div>
        } @else {
          <!-- Preview Section -->
          <div class="preview-section">
            <div class="file-info">
              <div class="file-icon">📄</div>
              <div class="file-details">
                <p class="file-name">{{ fileName() }}</p>
                <p class="questions-count">
                  {{ validQuestions() }} questions valides détectées
                </p>
              </div>
              <button mat-icon-button color="warn" (click)="removeFile()">
                <mat-icon>close</mat-icon>
              </button>
            </div>

            <div class="validation-status">
              <div class="status-bar">
                <span class="status-text">
                  ✓ {{ validQuestions() }} valides 
                  @if (errorQuestions() > 0) {
                    <span class="error-text">• ✗ {{ errorQuestions() }} erreurs</span>
                  }
                </span>
                <mat-progress-bar 
                  mode="determinate" 
                  [value]="validationProgress()"
                  [color]="validationProgress() === 100 ? 'primary' : 'warn'">
                </mat-progress-bar>
              </div>
            </div>

            <div class="preview-info">
              <p>Aperçu des premières questions :</p>
              <div class="preview-list">
                <div class="preview-item" *ngFor="let q of previewQuestions(); let i = index">
                  <span class="question-number">{{ i + 1 }}.</span>
                  <span class="question-text">{{ q }}</span>
                </div>
              </div>
            </div>

            <button mat-button (click)="removeFile()" class="back-btn">
              <mat-icon>arrow_back</mat-icon>
              Choisir un autre fichier
            </button>
          </div>
        }
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="close()">Annuler</button>
        <button mat-raised-button 
                color="primary" 
                (click)="importQuestions()"
                [disabled]="!fileSelected() || validQuestions() === 0">
          <mat-icon>file_upload</mat-icon>
          Importer {{ validQuestions() }} question(s)
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .import-excel-modal {
      width: 800px;
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
        font-size: 1.5rem;
        font-weight: 700;
        color: white;
      }

      .close-btn {
        color: white;
      }
    }

    .modal-content {
      padding: 32px;
      max-height: 70vh;
      overflow-y: auto;
    }

    .upload-area {
      border: 3px dashed #ccc;
      border-radius: 16px;
      padding: 60px 32px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background: #fafafa;

      &:hover {
        border-color: #667eea;
        background: #f5f5f5;
      }

      .upload-icon {
        font-size: 64px;
        margin-bottom: 16px;
      }

      .upload-text {
        font-size: 1.25rem;
        font-weight: 600;
        margin: 0 0 8px 0;
        color: #333;
      }

      .upload-hint {
        font-size: 1rem;
        color: #999;
        margin: 0 0 24px 0;
      }

      button {
        height: 44px;
        font-size: 1rem;
        padding: 0 32px;
      }
    }

    .format-info {
      margin-top: 32px;
      padding: 24px;
      background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
      border-radius: 12px;
      border-left: 4px solid #667eea;

      h4 {
        margin: 0 0 16px 0;
        color: #333;
        font-size: 1.125rem;
      }

      ul {
        margin: 0 0 20px 0;
        padding-left: 24px;

        li {
          margin: 10px 0;
          color: #666;
          font-size: 0.9375rem;
          line-height: 1.6;
        }
      }

      .download-link {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: #667eea;
        text-decoration: none;
        font-weight: 600;
        transition: all 0.2s;

        &:hover {
          color: #764ba2;
          text-decoration: underline;
        }
      }
    }

    .file-info {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
      border-radius: 12px;
      margin-bottom: 24px;

      .file-icon {
        font-size: 40px;
      }

      .file-details {
        flex: 1;

        .file-name {
          margin: 0 0 6px 0;
          font-weight: 600;
          color: #333;
          font-size: 1.125rem;
        }

        .questions-count {
          margin: 0;
          font-size: 0.9375rem;
          color: #4caf50;
          font-weight: 500;
        }
      }
    }

    .validation-status {
      margin-bottom: 24px;

      .status-bar {
        .status-text {
          display: block;
          margin-bottom: 12px;
          font-weight: 600;
          color: #333;
          font-size: 1rem;

          .error-text {
            color: #f44336;
          }
        }
      }
    }

    .preview-info {
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;

      p {
        margin: 0 0 16px 0;
        font-weight: 600;
        color: #333;
      }

      .preview-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .preview-item {
        display: flex;
        gap: 12px;
        padding: 12px;
        background: #f5f5f5;
        border-radius: 8px;

        .question-number {
          font-weight: 700;
          color: #667eea;
          min-width: 30px;
        }

        .question-text {
          color: #666;
          line-height: 1.5;
        }
      }
    }

    .back-btn {
      mat-icon {
        margin-right: 8px;
      }
    }

    mat-dialog-actions {
      padding: 16px 32px;
      border-top: 1px solid #e0e0e0;
    }
  `]
})
export class ImportExcelModalComponent {
  fileSelected = signal(false);
  fileName = signal('');
  validQuestions = signal(0);
  errorQuestions = signal(0);
  validationProgress = signal(0);
  previewQuestions = signal<string[]>([]);

  constructor(
    public dialogRef: MatDialogRef<ImportExcelModalComponent>
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFile(input.files[0]);
    }
  }

  processFile(file: File): void {
    this.fileName.set(file.name);
    this.fileSelected.set(true);
    
    // Simulation de traitement
    setTimeout(() => {
      this.validQuestions.set(15);
      this.errorQuestions.set(2);
      this.validationProgress.set(88);
      this.previewQuestions.set([
        'Qu\'est-ce qu\'un algorithme ?',
        'Quelle est la complexité de la recherche binaire ?',
        'Définissez le concept de récursivité'
      ]);
    }, 500);
  }

  removeFile(): void {
    this.fileSelected.set(false);
    this.fileName.set('');
    this.validQuestions.set(0);
    this.errorQuestions.set(0);
    this.validationProgress.set(0);
    this.previewQuestions.set([]);
  }

  importQuestions(): void {
    this.dialogRef.close({
      success: true,
      questionsCount: this.validQuestions()
    });
  }

  downloadTemplate(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    console.log('Téléchargement du template...');
  }
}
