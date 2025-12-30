import { Component, Input, Output, EventEmitter, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  ExcelPreviewService, 
  ExcelPreviewData, 
  ExcelImportConfig 
} from '../../../../core/services/excel-preview.service';
import { ExcelPreviewComponent } from '../excel-preview/excel-preview.component';

export interface ExcelUploadResult {
  file: File;
  previewData: ExcelPreviewData;
  cleanedData?: Blob;
}

@Component({
  selector: 'app-excel-upload',
  standalone: true,
  imports: [CommonModule, FormsModule, ExcelPreviewComponent],
  template: `
    <div class="excel-upload" [class.compact]="compact">
      <!-- Zone de drop -->
      @if (currentStep() === 'upload') {
        <div 
          class="upload-zone"
          [class.dragover]="isDragOver()"
          [class.has-error]="uploadError()"
          (dragover)="onDragOver($event)"
          (dragleave)="onDragLeave($event)"
          (drop)="onDrop($event)"
          (click)="fileInput.click()">
          
          <input 
            #fileInput
            type="file"
            accept=".xlsx,.xls"
            (change)="onFileSelected($event)"
            style="display: none">
          
          <div class="upload-content">
            @if (isUploading()) {
              <div class="upload-loading">
                <div class="spinner"></div>
                <h3>Analyse en cours...</h3>
                <p>Veuillez patienter pendant l'analyse de votre fichier Excel</p>
              </div>
            } @else if (uploadError()) {
              <div class="upload-error">
                <span class="material-icons">error</span>
                <h3>Erreur de fichier</h3>
                <p>{{ uploadError() }}</p>
                <button class="btn-retry" (click)="resetUpload()">
                  <span class="material-icons">refresh</span>
                  Réessayer
                </button>
              </div>
            } @else {
              <div class="upload-prompt">
                <div class="upload-icon">
                  <span class="material-icons">cloud_upload</span>
                </div>
                <h3>{{ title || 'Importer un fichier Excel' }}</h3>
                <p>{{ description || 'Glissez-déposez votre fichier ici ou cliquez pour sélectionner' }}</p>
                
                <div class="upload-specs">
                  <div class="spec-item">
                    <span class="material-icons">description</span>
                    <span>Formats: .xlsx, .xls</span>
                  </div>
                  @if (config && config.maxFileSize) {
                    <div class="spec-item">
                      <span class="material-icons">storage</span>
                      <span>Taille max: {{ formatFileSize(config.maxFileSize) }}</span>
                    </div>
                  }
                  @if (config && config.maxRows) {
                    <div class="spec-item">
                      <span class="material-icons">table_rows</span>
                      <span>Lignes max: {{ config.maxRows }}</span>
                    </div>
                  }
                </div>
                
                <button class="btn-upload">
                  <span class="material-icons">folder_open</span>
                  Choisir un fichier
                </button>
              </div>
            }
          </div>
        </div>
      }

      <!-- Prévisualisation -->
      @if (currentStep() === 'preview' && previewData()) {
        <app-excel-preview
          [file]="selectedFile()"
          [config]="config"
          [compact]="compact"
          [showValidation]="showValidation"
          [showStatistics]="showStatistics"
          [showActions]="showActions"
          [allowRetry]="allowRetry"
          [maxPreviewRows]="maxPreviewRows"
          (confirmed)="onPreviewConfirmed($event)"
          (cancelled)="onPreviewCancelled()"
          (retry)="onRetry()">
        </app-excel-preview>
      }

      <!-- Actions personnalisées -->
      @if (currentStep() === 'preview' && showCustomActions) {
        <div class="custom-actions">
          <div class="action-buttons">
            <button 
              class="btn-secondary"
              (click)="downloadCleanedData()"
              [disabled]="isProcessing()"
              title="Télécharger les données nettoyées">
              <span class="material-icons">download</span>
              Télécharger nettoyé
            </button>
            
            <button 
              class="btn-secondary"
              (click)="generateReport()"
              [disabled]="isProcessing()"
              title="Générer un rapport d'analyse">
              <span class="material-icons">assessment</span>
              Rapport d'analyse
            </button>
            
            @if (allowQuickValidation) {
              <button 
                class="btn-secondary"
                (click)="runQuickValidation()"
                [disabled]="isProcessing()"
                title="Validation rapide">
                <span class="material-icons">fact_check</span>
                Validation rapide
              </button>
            }
          </div>
        </div>
      }

      <!-- Indicateur de progression -->
      @if (isProcessing()) {
        <div class="processing-overlay">
          <div class="processing-content">
            <div class="spinner"></div>
            <p>{{ processingMessage() }}</p>
          </div>
        </div>
      }
    </div>
  `,
  styleUrls: ['./excel-upload.component.scss']
})
export class ExcelUploadComponent {
  @Input() title?: string;
  @Input() description?: string;
  @Input() config: ExcelImportConfig | null = null;
  @Input() compact = false;
  @Input() showValidation = true;
  @Input() showStatistics = true;
  @Input() showActions = true;
  @Input() showCustomActions = false;
  @Input() allowRetry = true;
  @Input() allowQuickValidation = false;
  @Input() maxPreviewRows = 10;
  @Input() autoAnalyze = true;

  @Output() fileUploaded = new EventEmitter<ExcelUploadResult>();
  @Output() uploadCancelled = new EventEmitter<void>();
  @Output() validationCompleted = new EventEmitter<{ isValid: boolean; errors: string[] }>();

  private excelPreviewService = inject(ExcelPreviewService);

  // État
  currentStep = signal<'upload' | 'preview'>('upload');
  selectedFile = signal<File | null>(null);
  previewData = signal<ExcelPreviewData | null>(null);
  isDragOver = signal(false);
  isUploading = signal(false);
  isProcessing = signal(false);
  uploadError = signal<string | null>(null);
  processingMessage = signal('Traitement en cours...');

  // Computed
  canProceed = computed(() => {
    const data = this.previewData();
    return data && !data.hasErrors;
  });

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (file) {
      await this.processFile(file);
    }
  }

  async onDrop(event: DragEvent): Promise<void> {
    event.preventDefault();
    this.isDragOver.set(false);
    
    const files = event.dataTransfer?.files;
    const file = files?.[0];
    
    if (file) {
      await this.processFile(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
  }

  private async processFile(file: File): Promise<void> {
    this.uploadError.set(null);
    this.selectedFile.set(file);

    // Validation rapide du fichier
    try {
      const quickValidation = await this.excelPreviewService.quickValidate(file);
      
      if (!quickValidation.isValid) {
        this.uploadError.set(quickValidation.errors.join(', '));
        return;
      }

      if (this.autoAnalyze) {
        await this.analyzeFile(file);
      } else {
        this.currentStep.set('preview');
      }

    } catch (error) {
      this.uploadError.set(`Erreur lors de la validation: ${error}`);
    }
  }

  private async analyzeFile(file: File): Promise<void> {
    this.isUploading.set(true);
    
    try {
      const previewData = await this.excelPreviewService.analyzeExcelFile(file, this.config || undefined);
      this.previewData.set(previewData);
      this.currentStep.set('preview');
      
    } catch (error) {
      this.uploadError.set(`Erreur lors de l'analyse: ${error}`);
    } finally {
      this.isUploading.set(false);
    }
  }

  onPreviewConfirmed(data: ExcelPreviewData): void {
    const file = this.selectedFile();
    if (file) {
      this.fileUploaded.emit({
        file,
        previewData: data
      });
    }
  }

  onPreviewCancelled(): void {
    this.resetUpload();
    this.uploadCancelled.emit();
  }

  onRetry(): void {
    this.resetUpload();
  }

  resetUpload(): void {
    this.currentStep.set('upload');
    this.selectedFile.set(null);
    this.previewData.set(null);
    this.uploadError.set(null);
    this.isUploading.set(false);
    this.isProcessing.set(false);
  }

  async downloadCleanedData(): Promise<void> {
    const data = this.previewData();
    if (!data) return;

    this.isProcessing.set(true);
    this.processingMessage.set('Génération du fichier nettoyé...');

    try {
      const cleanedBlob = await this.excelPreviewService.exportCleanedData(data, this.config || undefined);
      
      // Télécharger le fichier
      const url = URL.createObjectURL(cleanedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${data.fileName.replace(/\.[^/.]+$/, '')}_cleaned.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    } finally {
      this.isProcessing.set(false);
    }
  }

  async generateReport(): Promise<void> {
    const data = this.previewData();
    if (!data) return;

    this.isProcessing.set(true);
    this.processingMessage.set('Génération du rapport...');

    try {
      const statistics = this.excelPreviewService.generateDataStatistics(data);
      const report = this.excelPreviewService.generateAnalysisReport(data, statistics);
      
      // Télécharger le rapport
      const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${data.fileName.replace(/\.[^/.]+$/, '')}_report.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
    } finally {
      this.isProcessing.set(false);
    }
  }

  async runQuickValidation(): Promise<void> {
    const file = this.selectedFile();
    if (!file) return;

    this.isProcessing.set(true);
    this.processingMessage.set('Validation en cours...');

    try {
      const validation = await this.excelPreviewService.quickValidate(file);
      this.validationCompleted.emit(validation);

    } catch (error) {
      console.error('Erreur lors de la validation:', error);
    } finally {
      this.isProcessing.set(false);
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}