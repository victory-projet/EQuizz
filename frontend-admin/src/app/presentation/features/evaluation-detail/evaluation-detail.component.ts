import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
<<<<<<< Updated upstream
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { EvaluationUseCase } from '../../../core/usecases/evaluation.usecase';
import { Evaluation } from '../../../core/domain/entities/evaluation.entity';
import { Question } from '../../../core/domain/entities/question.entity';
import { ConfirmationService } from '../../shared/services/confirmation.service';
import { QuestionFormComponent } from '../question-form/question-form.component';
import { QuestionImportComponent } from '../question-import/question-import.component';
import { SentimentAnalysisComponent } from '../../shared/components/sentiment-analysis/sentiment-analysis.component';
import { ReportExportComponent } from '../../shared/components/report-export/report-export.component';
=======
import { QuestionManagementComponent } from '../question-management/question-management.component';
import { Evaluation, Question } from '../../../core/domain/entities/evaluation.entity';
import { EvaluationUseCase } from '../../../core/usecases/evaluation.usecase';
>>>>>>> Stashed changes

@Component({
  selector: 'app-evaluation-detail',
  standalone: true,
  imports: [
    CommonModule, 
    QuestionManagementComponent
  ],
  templateUrl: './evaluation-detail.component.html',
  styleUrls: ['./evaluation-detail.component.scss']
})
export class EvaluationDetailComponent implements OnInit {
  evaluation = signal<Evaluation | null>(null);
  isLoading = signal(false);
  errorMessage = signal('');
  activeTab = signal<'info' | 'questions'>('questions');
  
  // États pour le formulaire de question
  editingQuestion = signal<Question | null>(null);
  questions = signal<Question[]>([]);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private evaluationUseCase: EvaluationUseCase
  ) {}

  ngOnInit(): void {
    const evaluationId = this.route.snapshot.paramMap.get('id');
    if (evaluationId) {
      this.loadEvaluation(evaluationId);
    }
  }

  loadEvaluation(id: string): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.evaluationUseCase.getEvaluation(id).subscribe({
      next: (evaluation) => {
        this.evaluation.set(evaluation);
        this.isLoading.set(false);
        console.log('✅ Évaluation chargée:', evaluation);
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement de l\'évaluation:', error);
        this.errorMessage.set('Erreur lors du chargement de l\'évaluation');
        this.isLoading.set(false);
      }
    });
  }

  setActiveTab(tab: 'info' | 'questions'): void {
    this.activeTab.set(tab);
  }

  goToReport(): void {
    const evaluationId = this.evaluation()?.id;
    if (evaluationId) {
      this.router.navigate(['/reports', evaluationId]);
    }
  }

  onQuestionSaved(question: Question): void {
<<<<<<< Updated upstream
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
    this.evaluationUseCase.deleteQuestion(question.id!).subscribe({
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
=======
    // Gérer la sauvegarde de la question
    console.log('Question sauvegardée:', question);
    this.editingQuestion.set(null);
>>>>>>> Stashed changes
  }

  goBack(): void {
    this.router.navigate(['/evaluations']);
  }
}