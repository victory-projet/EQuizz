import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { EvaluationUseCase } from '../../../core/usecases/evaluation.usecase';
import { Evaluation, Question } from '../../../core/domain/entities/evaluation.entity';
import { ConfirmationService } from '../../shared/services/confirmation.service';
import { QuestionFormComponent } from '../question-form/question-form.component';
import { QuestionImportComponent } from '../question-import/question-import.component';
import { SentimentAnalysisComponent } from '../../shared/components/sentiment-analysis/sentiment-analysis.component';
import { ReportExportComponent } from '../../shared/components/report-export/report-export.component';

@Component({
  selector: 'app-evaluation-detail',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    QuestionFormComponent, 
    QuestionImportComponent,
    SentimentAnalysisComponent,
    ReportExportComponent
  ],
  templateUrl: './evaluation-detail.component.html',
  styleUrls: ['./evaluation-detail.component.scss']
})
export class EvaluationDetailComponent implements OnInit {
  evaluation = signal<Evaluation | null>(null);
  questions = signal<Question[]>([]);
  isLoading = signal(false);
  showQuestionForm = signal(false);
  showQuestionImport = signal(false);
  editingQuestion = signal<Question | null>(null);
  
  errorMessage = signal('');
  successMessage = signal('');

  private confirmationService = inject(ConfirmationService);
  private snackBar = inject(MatSnackBar);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private evaluationUseCase: EvaluationUseCase
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEvaluation(id);
    }
  }

  loadEvaluation(id: string): void {
    this.isLoading.set(true);
    this.evaluationUseCase.getEvaluation(id).subscribe({
      next: (evaluation) => {
        console.log('📥 Évaluation chargée:', evaluation);
        this.evaluation.set(evaluation);
        this.questions.set(evaluation.quizz?.questions || []);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement de l\'évaluation:', error);
        this.errorMessage.set('Erreur lors du chargement de l\'évaluation');
        this.isLoading.set(false);
      }
    });
  }

  openQuestionForm(): void {
    this.editingQuestion.set(null);
    this.showQuestionForm.set(true);
  }

  editQuestion(question: Question): void {
    this.editingQuestion.set(question);
    this.showQuestionForm.set(true);
  }

  closeQuestionForm(): void {
    this.showQuestionForm.set(false);
    this.editingQuestion.set(null);
  }

  openQuestionImport(): void {
    this.showQuestionImport.set(true);
  }

  closeQuestionImport(): void {
    this.showQuestionImport.set(false);
  }

  onQuestionsImported(questions: Question[]): void {
    const currentQuestions = this.questions();
    this.questions.set([...currentQuestions, ...questions]);
    this.closeQuestionImport();
    this.successMessage.set(`${questions.length} questions importées avec succès`);
    setTimeout(() => this.successMessage.set(''), 3000);
  }

  onQuestionSaved(question: Question): void {
    const currentQuestions = this.questions();
    const existingIndex = currentQuestions.findIndex(q => q.id === question.id);
    
    if (existingIndex >= 0) {
      // Update existing question
      currentQuestions[existingIndex] = question;
    } else {
      // Add new question
      currentQuestions.push(question);
    }
    
    this.questions.set([...currentQuestions]);
    this.closeQuestionForm();
    this.successMessage.set('Question sauvegardée avec succès');
    setTimeout(() => this.successMessage.set(''), 3000);
  }

  async deleteQuestion(question: Question): Promise<void> {
    const confirmed = await this.confirmationService.confirmDelete(`la question "${question.enonce}"`);
    if (!confirmed) return;

    this.isLoading.set(true);
    this.evaluationUseCase.deleteQuestion(question.id).subscribe({
      next: () => {
        const currentQuestions = this.questions();
        this.questions.set(currentQuestions.filter(q => q.id !== question.id));
        this.successMessage.set('Question supprimée avec succès');
        this.isLoading.set(false);
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message || 'Erreur lors de la suppression');
        this.isLoading.set(false);
      }
    });
  }

  async publishEvaluation(): Promise<void> {
    const evaluation = this.evaluation();
    if (!evaluation) return;

    if (this.questions().length === 0) {
      this.errorMessage.set('Impossible de publier une évaluation sans questions');
      return;
    }

    const confirmed = await this.confirmationService.confirmPublish(evaluation.titre);
    if (!confirmed) return;

    this.isLoading.set(true);
    this.evaluationUseCase.publishEvaluation(evaluation.id).subscribe({
      next: (updatedEvaluation) => {
        this.evaluation.set(updatedEvaluation);
        this.successMessage.set('Évaluation publiée avec succès');
        this.isLoading.set(false);
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message || 'Erreur lors de la publication');
        this.isLoading.set(false);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/evaluations']);
  }

  getQuestionTypeLabel(type: string): string {
    switch (type) {
      case 'CHOIX_MULTIPLE': return 'QCM';
      case 'REPONSE_OUVERTE': return 'Réponse libre';
      default: return type;
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'BROUILLON': return 'badge-draft';
      case 'PUBLIEE': return 'badge-active';
      case 'CLOTUREE': return 'badge-closed';
      default: return '';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'BROUILLON': return 'Brouillon';
      case 'PUBLIEE': return 'En cours';
      case 'CLOTUREE': return 'Clôturée';
      default: return status;
    }
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  getOptionText(option: any): string {
    if (typeof option === 'string') {
      return option;
    }
    if (option && typeof option === 'object') {
      return option.texte || option.text || String(option);
    }
    return String(option || '');
  }

  getStringFromCharCode(code: number): string {
    return String.fromCharCode(code);
  }

  getQuestionType(question: Question): string {
    return question.type || (question as any).typeQuestion || '';
  }

  isMultipleChoice(question: Question): boolean {
    const type = this.getQuestionType(question);
    return type === 'CHOIX_MULTIPLE';
  }

  getQuizzId(evaluation: Evaluation): string | number {
    return evaluation.quizz?.id || evaluation.quizzId || '';
  }
}