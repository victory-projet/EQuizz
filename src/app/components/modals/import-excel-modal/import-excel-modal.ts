import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ExcelImportService, ExcelQuestion } from '../../../core/services/excel-import.service';

interface ImportedQuestion extends ExcelQuestion {}

@Component({
  selector: 'app-import-excel-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressBarModule,
    MatTooltipModule
  ],
  template: `
    <div class="import-excel-modal">
      <div class="modal-header">
        <h2 mat-dialog-title>Importer des questions depuis Excel</h2>
        <button mat-icon-button (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="modal-content">
        <!-- Upload Section -->
        <div class="upload-section" *ngIf="!fileSelected">
          <div class="upload-area" 
               (click)="fileInput.click()"
               (dragover)="onDragOver($event)"
               (drop)="onDrop($event)">
            <mat-icon class="upload-icon">cloud_upload</mat-icon>
            <p class="upload-text">Glissez-déposez votre fichier Excel ici</p>
            <p class="upload-hint">ou cliquez pour parcourir</p>
            <button mat-raised-button color="primary">
              Choisir un fichier
            </button>
          </div>
          <input #fileInput 
                 type="file" 
                 accept=".xlsx,.xls" 
                 (change)="onFileSelected($event)"
                 style="display: none;">

          <div class="format-info">
            <h4>Format du fichier Excel</h4>
            <ul>
              <li><strong>Colonne A :</strong> Type de question (multiple/ouverte/fermée)</li>
              <li><strong>Colonne B :</strong> Texte de la question</li>
              <li><strong>Colonnes C-F :</strong> Options de réponse (pour choix multiple)</li>
            </ul>
            <a href="#" class="download-link" (click)="downloadTemplate($event)">
              <mat-icon>download</mat-icon>
              Télécharger le modèle Excel
            </a>
          </div>
        </div>

        <!-- Preview Section -->
        <div class="preview-section" *ngIf="fileSelected">
          <div class="file-info">
            <mat-icon>description</mat-icon>
            <div class="file-details">
              <p class="file-name">Fichier: {{ fileName }}</p>
              <p class="questions-count" [class.success]="validQuestions > 0">
                Nombre de questions détectées: {{ totalQuestions }}
              </p>
            </div>
            <button mat-icon-button color="warn" (click)="removeFile()" matTooltip="Supprimer">
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <div class="validation-status">
            <div class="status-bar">
              <span>{{ validQuestions }} valides / {{ errorQuestions }} erreurs</span>
              <mat-progress-bar 
                mode="determinate" 
                [value]="validationProgress"
                [color]="validationProgress === 100 ? 'primary' : 'warn'">
              </mat-progress-bar>
            </div>
          </div>

          <div class="preview-table">
            <table mat-table [dataSource]="previewData" class="questions-table">
              <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef>Type</th>
                <td mat-cell *matCellDef="let question" [class.error]="!question.isValid">
                  {{ question.type }}
                </td>
              </ng-container>

              <ng-container matColumnDef="question">
                <th mat-header-cell *matHeaderCellDef>Question</th>
                <td mat-cell *matCellDef="let question" [class.error]="!question.isValid">
                  {{ question.question || '-' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="option1">
                <th mat-header-cell *matHeaderCellDef>Option 1</th>
                <td mat-cell *matCellDef="let question">
                  {{ question.option1 || '-' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="option2">
                <th mat-header-cell *matHeaderCellDef>Option 2</th>
                <td mat-cell *matCellDef="let question">
                  {{ question.option2 || '-' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="option3">
                <th mat-header-cell *matHeaderCellDef>Option 3</th>
                <td mat-cell *matCellDef="let question">
                  {{ question.option3 || '-' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="option4">
                <th mat-header-cell *matHeaderCellDef>Option 4</th>
                <td mat-cell *matCellDef="let question">
                  {{ question.option4 || '-' }}
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </div>

          <div class="return-button-container">
            <button mat-button (click)="removeFile()">
              <mat-icon>arrow_back</mat-icon>
              Retour
            </button>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="close()">Annuler</button>
        <button mat-raised-button 
                color="primary" 
                (click)="importQuestions()"
                [disabled]="!fileSelected || validQuestions === 0">
          <mat-icon>file_upload</mat-icon>
          Importer
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .import-excel-modal {
      width: 900px;
      max-width: 95vw;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid #e0e0e0;
      background: #3f51b5;
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
      padding: 24px;
      max-height: 70vh;
      overflow-y: auto;
    }

    .upload-section {
      .upload-area {
        border: 2px dashed #ccc;
        border-radius: 12px;
        padding: 48px 24px;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s ease;
        background: #fafafa;

        &:hover {
          border-color: #3f51b5;
          background: #f5f5f5;
        }

        .upload-icon {
          font-size: 64px;
          width: 64px;
          height: 64px;
          color: #3f51b5;
          margin-bottom: 16px;
        }

        .upload-text {
          font-size: 1.1rem;
          font-weight: 500;
          margin: 0 0 8px 0;
          color: #333;
        }

        .upload-hint {
          font-size: 0.9rem;
          color: #999;
          margin: 0 0 24px 0;
        }
      }

      .format-info {
        margin-top: 24px;
        padding: 20px;
        background: #e3f2fd;
        border-radius: 8px;
        border-left: 4px solid #2196f3;

        h4 {
          margin: 0 0 12px 0;
          color: #333;
        }

        ul {
          margin: 0 0 16px 0;
          padding-left: 20px;

          li {
            margin: 8px 0;
            color: #666;
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
    }

    .preview-section {
      .file-info {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;
        background: #f5f5f5;
        border-radius: 8px;
        margin-bottom: 16px;

        mat-icon {
          color: #3f51b5;
          font-size: 32px;
          width: 32px;
          height: 32px;
        }

        .file-details {
          flex: 1;

          .file-name {
            margin: 0 0 4px 0;
            font-weight: 500;
            color: #333;
          }

          .questions-count {
            margin: 0;
            font-size: 0.9rem;
            color: #666;

            &.success {
              color: #4caf50;
              font-weight: 500;
            }
          }
        }
      }

      .validation-status {
        margin-bottom: 24px;

        .status-bar {
          span {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: #333;
          }
        }
      }

      .preview-table {
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        overflow: hidden;
        margin-bottom: 16px;

        .questions-table {
          width: 100%;

          th {
            background: #f5f5f5;
            font-weight: 600;
            color: #333;
          }

          td {
            &.error {
              background: #ffebee;
              color: #c62828;
            }
          }

          .mat-mdc-row:hover {
            background: #f9f9f9;
          }
        }
      }

      .return-button-container {
        text-align: left;

        button {
          mat-icon {
            margin-right: 8px;
          }
        }
      }
    }

    mat-dialog-actions {
      padding: 16px 24px;
      border-top: 1px solid #e0e0e0;

      button mat-icon {
        margin-right: 8px;
      }
    }
  `]
})
export class ImportExcelModalComponent {
  fileSelected = false;
  fileName = '';
  totalQuestions = 0;
  validQuestions = 0;
  errorQuestions = 0;
  validationProgress = 0;
  previewData: ImportedQuestion[] = [];
  displayedColumns = ['type', 'question', 'option1', 'option2', 'option3', 'option4'];

  constructor(
    public dialogRef: MatDialogRef<ImportExcelModalComponent>,
    private excelImportService: ExcelImportService
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

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.processFile(file);
    }
  }

  processFile(file: File): void {
    this.fileName = file.name;
    this.fileSelected = true;

    // Utiliser le service pour parser le fichier Excel
    this.excelImportService.parseExcelFile(file).subscribe({
      next: (questions) => {
        this.previewData = questions;
        this.totalQuestions = this.previewData.length;
        this.validQuestions = this.previewData.filter(q => q.isValid).length;
        this.errorQuestions = this.totalQuestions - this.validQuestions;
        this.validationProgress = (this.validQuestions / this.totalQuestions) * 100;
      },
      error: (error) => {
        console.error('Erreur lors du parsing du fichier:', error);
        alert('Erreur lors de la lecture du fichier Excel');
        this.removeFile();
      }
    });
  }

  removeFile(): void {
    this.fileSelected = false;
    this.fileName = '';
    this.previewData = [];
    this.totalQuestions = 0;
    this.validQuestions = 0;
    this.errorQuestions = 0;
  }

  downloadTemplate(event: Event): void {
    event.preventDefault();
    this.excelImportService.generateTemplate();
  }

  importQuestions(): void {
    const validData = this.previewData.filter(q => q.isValid);
    const convertedQuestions = this.excelImportService.convertToAppFormat(validData);
    this.dialogRef.close({ questions: convertedQuestions });
  }
}
