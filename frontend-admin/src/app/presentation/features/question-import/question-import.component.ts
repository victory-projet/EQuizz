import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EvaluationUseCase } from '../../../core/usecases/evaluation.usecase';
import { Question } from '../../../core/domain/entities/question.entity';
import * as ExcelJS from 'exceljs';

@Component({
  selector: 'app-question-import',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './question-import.component.html',
  styleUrls: ['./question-import.component.scss']
})
export class QuestionImportComponent {
  @Input() evaluationId!: string | number;
  @Input() quizzId!: string | number;
  @Output() imported = new EventEmitter<Question[]>();
  @Output() cancelled = new EventEmitter<void>();

  selectedFile = signal<File | null>(null);
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  previewQuestions = signal<any[]>([]);
  showPreview = signal(false);

  constructor(private evaluationUseCase: EvaluationUseCase) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Vérifier le type de fichier
      if (!this.isValidExcelFile(file)) {
        this.errorMessage.set('Veuillez sélectionner un fichier Excel (.xlsx ou .xls)');
        return;
      }
      
      console.log('📁 Fichier sélectionné:', file.name, file.type, file.size);
      this.selectedFile.set(file);
      this.errorMessage.set('');
      this.successMessage.set('');
    }
  }

  private isValidExcelFile(file: File): boolean {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel' // .xls
    ];
    return validTypes.includes(file.type) || 
           file.name.endsWith('.xlsx') || 
           file.name.endsWith('.xls');
  }

  async validateAndPreview(): Promise<void> {
    const file = this.selectedFile();
    if (!file) {
      this.errorMessage.set('Veuillez sélectionner un fichier');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const questions = await this.parseExcelFile(file);
      if (questions.length === 0) {
        this.errorMessage.set('Aucune question valide trouvée dans le fichier');
        this.isLoading.set(false);
        return;
      }

      this.previewQuestions.set(questions);
      this.showPreview.set(true);
      this.isLoading.set(false);
    } catch (error) {
      console.error('❌ Erreur lors du parsing Excel:', error);
      this.errorMessage.set('Erreur lors de la lecture du fichier Excel');
      this.isLoading.set(false);
    }
  }

  private async parseExcelFile(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(arrayBuffer);
          
          const worksheet = workbook.worksheets[0];
          if (!worksheet) {
            throw new Error('Aucune feuille de calcul trouvée');
          }

          const questions: any[] = [];

          worksheet.eachRow((row, rowNumber) => {
            // Skip header row
            if (rowNumber === 1) {
              return;
            }

            const enonce = row.getCell(1).value?.toString().trim();
            const type = row.getCell(2).value?.toString().trim().toUpperCase();
            const optionsRaw = row.getCell(3).value?.toString();

            if (!enonce || !type) {
              return;
            }

            // Validation du type
            if (!['CHOIX_MULTIPLE', 'REPONSE_OUVERTE'].includes(type)) {
              console.warn(`Ligne ${rowNumber}: Type de question invalide: ${type}`);
              return;
            }

            let options: string[] = [];
            if (type === 'CHOIX_MULTIPLE') {
              if (!optionsRaw) {
                console.warn(`Ligne ${rowNumber}: Options manquantes pour une question CHOIX_MULTIPLE`);
                return;
              }

              options = optionsRaw.split(';').map(opt => opt.trim()).filter(opt => opt.length > 0);
              if (options.length < 2) {
                console.warn(`Ligne ${rowNumber}: Au moins 2 options requises pour une question CHOIX_MULTIPLE`);
                return;
              }
            }

            questions.push({
              enonce,
              type,
              typeQuestion: type,
              options
            });
          });

          resolve(questions);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'));
      reader.readAsArrayBuffer(file);
    });
  }

  async importQuestions(): Promise<void> {
    const file = this.selectedFile();
    if (!file) {
      this.errorMessage.set('Veuillez sélectionner un fichier');
      return;
    }

    // Validation du quizzId
    if (!this.quizzId || this.quizzId === '') {
      this.errorMessage.set('ID du quiz manquant');
      return;
    }

    console.log('📤 Import de questions depuis:', file.name);
    console.log('🎯 QuizzId pour import:', this.quizzId);
    console.log('🎯 EvaluationId pour import:', this.evaluationId);

    this.isLoading.set(true);
    this.errorMessage.set('');

    // Utiliser le vrai service d'import
    this.evaluationUseCase.importQuestionsFromExcel(this.quizzId, file).subscribe({
      next: (result) => {
        console.log('✅ Questions importées:', result);
        this.isLoading.set(false);
        
        // Extract questions from QuestionImportData
        const questions = result.questions || [];
        const errors = result.errors || [];
        
        if (errors.length > 0) {
          console.warn('⚠️ Erreurs lors de l\'import:', errors);
          this.errorMessage.set(`Import réussi avec des avertissements: ${errors.join(', ')}`);
        } else {
          this.successMessage.set(`${questions.length} questions importées avec succès dans le quiz`);
        }
        
        // Émettre l'événement d'import réussi avec les questions
        this.imported.emit(questions);
        
        // Réinitialiser le formulaire après un délai
        setTimeout(() => {
          this.resetImport();
        }, 2000);
      },
      error: (error: any) => {
        console.error('❌ Erreur lors de l\'import:', error);
        console.error('❌ Status:', error.status);
        
        let errorMsg = 'Erreur lors de l\'import des questions';
        if (error.error?.message) {
          errorMsg = error.error.message;
        } else if (error.status === 400) {
          errorMsg = 'Format de fichier invalide ou données incorrectes';
        } else if (error.status === 404) {
          errorMsg = 'Quiz non trouvé';
        }
        
        this.errorMessage.set(errorMsg);
        this.isLoading.set(false);
      }
    });
  }

  resetImport(): void {
    this.selectedFile.set(null);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.previewQuestions.set([]);
    this.showPreview.set(false);
    
    // Réinitialiser l'input file
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  cancel(): void {
    this.resetImport();
    this.cancelled.emit();
  }

  onCancel(): void {
    this.cancel();
  }

  downloadTemplate(): void {
    const csvContent = `Énoncé,Type,Options
"Quelle est la capitale de la France ?","CHOIX_MULTIPLE","Paris;Londres;Berlin;Madrid"
"Expliquez le concept de programmation orientée objet","REPONSE_OUVERTE",""
"Qu'est-ce qu'une base de données relationnelle ?","CHOIX_MULTIPLE","Un système de gestion de fichiers;Un système de gestion de base de données;Un langage de programmation;Un protocole réseau"`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template-questions.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    this.successMessage.set('Template téléchargé avec succès');
  }

  getQuestionTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'CHOIX_MULTIPLE': 'Choix multiple',
      'REPONSE_OUVERTE': 'Réponse ouverte'
    };
    return labels[type] || type;
  }

  confirmImport(): void {
    this.importQuestions();
  }

  onImportQuestions(): void {
    this.importQuestions();
  }
}