import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Question, QuestionImportData } from '../../../core/domain/entities/question.entity';
import { EvaluationUseCase } from '../../../core/usecases/evaluation.usecase';

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

  onCancel(): void {
    this.resetForm();
    this.cancelled.emit();
  }

  onImportQuestions(): void {
    const file = this.selectedFile();
    if (!file) {
      this.errorMessage.set('Veuillez sélectionner un fichier');
      return;
    }

    // Validation du quizzId
    if (!this.quizzId || this.quizzId === 'null' || this.quizzId === 'undefined') {
      this.errorMessage.set('Erreur: ID du quiz manquant. Veuillez rafraîchir la page.');
      return;
    }

    console.log('📤 Import de questions depuis le fichier:', file.name);
    console.log('🎯 QuizzId pour import:', this.quizzId);
    console.log('🎯 EvaluationId pour import:', this.evaluationId);

    this.isLoading.set(true);
    this.errorMessage.set('');

    // Utiliser le vrai service d'import du backend
    this.evaluationUseCase.importQuestions(this.quizzId, file).subscribe({
      next: (result: QuestionImportData) => {
        console.log('✅ Import réussi:', result);
        console.log('📊 Nombre de questions importées:', result.questions?.length || 0);
        console.log('🎯 Questions importées dans le quizzId:', this.quizzId);
        
        this.isLoading.set(false);
        const questionsCount = result.questions?.length || 0;
        this.successMessage.set(`${questionsCount} question(s) importée(s) avec succès dans le quizz ${this.quizzId}`);
        this.imported.emit(result.questions || []);
        
        // Réinitialiser le formulaire après un délai
        setTimeout(() => {
          this.resetForm();
        }, 2000);
      },
      error: (error) => {
        console.error('❌ Erreur lors de l\'import:', error);
        console.error('❌ Status:', error.status);
        console.error('❌ Error details:', error.error);
        
        let errorMsg = 'Erreur lors de l\'import des questions';
        if (error.error?.message) {
          errorMsg = error.error.message;
        } else if (error.status === 400) {
          errorMsg = 'Format de fichier invalide. Vérifiez que votre fichier Excel respecte le format attendu.';
        } else if (error.status === 413) {
          errorMsg = 'Fichier trop volumineux. Veuillez réduire la taille du fichier.';
        }
        
        this.errorMessage.set(errorMsg);
        this.isLoading.set(false);
      }
    });
  }

  public resetForm(): void {
    this.selectedFile.set(null);
    this.errorMessage.set('');
    this.successMessage.set('');
    
    // Réinitialiser l'input file
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  downloadTemplate(): void {
    // Créer un template Excel à télécharger
    const csvContent = `Énoncé,Type de question,Options (séparées par ;)
"Quelle est la capitale de la France ?","CHOIX_MULTIPLE","Paris;Lyon;Marseille;Toulouse"
"Expliquez le concept de programmation orientée objet","REPONSE_OUVERTE",""
"Qu'est-ce qu'une base de données relationnelle ?","CHOIX_MULTIPLE","Un système de gestion de fichiers;Un système de stockage de données structurées;Un logiciel de traitement de texte;Un navigateur web"`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_questions.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    this.successMessage.set('Template téléchargé ! Utilisez ce format pour vos questions.');
    setTimeout(() => this.successMessage.set(''), 3000);
  }

  getQuestionTypeLabel(type: string | undefined): string {
    if (!type) return 'Type inconnu';
    const labels: { [key: string]: string } = {
      'CHOIX_MULTIPLE': 'Choix multiples',
      'REPONSE_OUVERTE': 'Réponse ouverte'
    };
    return labels[type] || type;
  }
}