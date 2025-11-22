import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, FileSpreadsheet, Upload, Download, X, FileCheck, AlertCircle, Trash2 } from 'lucide-angular';
import * as ExcelJS from 'exceljs';

interface ParsedQuestion {
  type: 'multiple' | 'close' | 'open';
  question: string;
  option1?: string;
  option2?: string;
  option3?: string;
  option4?: string;
  correctAnswer?: string;
}

interface ValidationResult {
  valid: number;
  errors: number;
  questions: ParsedQuestion[];
}

@Component({
  selector: 'app-excel-import-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './excel-import-modal.component.html',
  styleUrls: ['./excel-import-modal.component.scss']
})
export class ExcelImportModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() import = new EventEmitter<ParsedQuestion[]>();

  selectedFile = signal<File | null>(null);
  fileName = signal<string>('');
  isProcessing = signal(false);
  validationResult = signal<ValidationResult | null>(null);
  errorMessage = signal<string>('');

  // Lucide icons
  readonly FileSpreadsheet = FileSpreadsheet;
  readonly Upload = Upload;
  readonly Download = Download;
  readonly X = X;
  readonly FileCheck = FileCheck;
  readonly AlertCircle = AlertCircle;
  readonly Trash2 = Trash2;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.processFile(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      this.processFile(file);
    }
  }

  private async processFile(file: File): Promise<void> {
    // Vérifier l'extension
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      this.errorMessage.set('Veuillez sélectionner un fichier Excel (.xlsx ou .xls)');
      return;
    }

    this.selectedFile.set(file);
    this.fileName.set(file.name);
    this.errorMessage.set('');
    this.validationResult.set(null);
    this.isProcessing.set(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);
      
      // Lire la première feuille
      const worksheet = workbook.worksheets[0];
      const jsonData: any[][] = [];
      
      worksheet.eachRow((row, rowNumber) => {
        const rowData: any[] = [];
        row.eachCell({ includeEmpty: true }, (cell) => {
          rowData.push(cell.value);
        });
        jsonData.push(rowData);
      });
      
      // Parser les données
      const result = this.parseExcelData(jsonData);
      this.validationResult.set(result);
      this.isProcessing.set(false);
    } catch (error) {
      console.error('Error processing file:', error);
      this.errorMessage.set('Erreur lors de la lecture du fichier Excel');
      this.isProcessing.set(false);
    }
  }

  private parseExcelData(data: any[][]): ValidationResult {
    const questions: ParsedQuestion[] = [];
    let validCount = 0;
    let errorCount = 0;

    // Ignorer la première ligne (en-têtes)
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      // Ignorer les lignes vides
      if (!row || row.length === 0 || !row[0]) {
        continue;
      }

      try {
        const question = row[1]?.toString().trim();
        const type = this.normalizeType(row[0]);

        if (!question) {
          errorCount++;
          continue;
        }

        const parsedQuestion: ParsedQuestion = {
          type,
          question
        };

        // Pour les questions à choix multiples, ajouter les options
        if (type === 'multiple' || type === 'close') {
          parsedQuestion.option1 = row[2]?.toString().trim();
          parsedQuestion.option2 = row[3]?.toString().trim();
          parsedQuestion.option3 = row[4]?.toString().trim();
          parsedQuestion.option4 = row[5]?.toString().trim();

          // Vérifier qu'il y a au moins 2 options
          const optionsCount = [
            parsedQuestion.option1,
            parsedQuestion.option2,
            parsedQuestion.option3,
            parsedQuestion.option4
          ].filter(opt => opt && opt.length > 0).length;

          if (optionsCount < 2) {
            errorCount++;
            continue;
          }
        }

        questions.push(parsedQuestion);
        validCount++;
      } catch (err) {
        errorCount++;
      }
    }

    return {
      valid: validCount,
      errors: errorCount,
      questions
    };
  }

  private normalizeType(type: string): 'multiple' | 'close' | 'open' {
    const normalized = type.toString().toLowerCase().trim();
    
    if (normalized.includes('multiple') || normalized.includes('qcm')) {
      return 'multiple';
    } else if (normalized.includes('close') || normalized.includes('fermé')) {
      return 'close';
    } else {
      return 'open';
    }
  }

  onImport(): void {
    const result = this.validationResult();
    if (result && result.questions.length > 0) {
      this.import.emit(result.questions);
    }
  }

  onCancel(): void {
    this.close.emit();
  }

  async downloadTemplate(): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Questions');

    // Ajouter les en-têtes
    worksheet.columns = [
      { header: 'Type', key: 'type', width: 15 },
      { header: 'Question', key: 'question', width: 50 },
      { header: 'Option 1', key: 'option1', width: 30 },
      { header: 'Option 2', key: 'option2', width: 30 },
      { header: 'Option 3', key: 'option3', width: 30 },
      { header: 'Option 4', key: 'option4', width: 30 }
    ];

    // Ajouter des exemples
    worksheet.addRow({
      type: 'multiple',
      question: 'Quelle est la capitale de la France ?',
      option1: 'Paris',
      option2: 'Londres',
      option3: 'Berlin',
      option4: 'Madrid'
    });

    worksheet.addRow({
      type: 'close',
      question: 'Le soleil est une étoile',
      option1: 'Vrai',
      option2: 'Faux',
      option3: '',
      option4: ''
    });

    worksheet.addRow({
      type: 'open',
      question: 'Expliquez le concept de la photosynthèse',
      option1: '',
      option2: '',
      option3: '',
      option4: ''
    });

    worksheet.addRow({
      type: 'multiple',
      question: 'Quel langage est utilisé pour le web ?',
      option1: 'HTML',
      option2: 'Python',
      option3: 'Java',
      option4: 'C++'
    });

    // Télécharger le fichier
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'modele_questions.xlsx';
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
