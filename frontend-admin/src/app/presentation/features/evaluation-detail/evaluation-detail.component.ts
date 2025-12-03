import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EvaluationUseCase } from '../../../core/usecases/evaluation.usecase';
import { Evaluation, Question } from '../../../core/domain/entities/evaluation.entity';
import { QuestionFormComponent } from '../question-form/question-form.component';
import { QuestionImportComponent } from '../question-import/question-import.component';
import { EvaluationPublishComponent } from '../evaluation-publish/evaluation-publish.component';

@Component({
  selector: 'app-evaluation-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, QuestionFormComponent, QuestionImportComponent, EvaluationPublishComponent],
  templateUrl: './evaluation-detail.component.html',
  styleUrls: ['./evaluation-detail.component.scss']
})
export class EvaluationDetailComponent implements OnInit {
  evaluation = signal<Evaluation | null>(null);
  questions = signal<Question[]>([]);
  isLoading = signal(false);
  
  // Mode: 'view', 'manual', 'import'
  mode = signal<string>('view');
  
  // Question editing
  editingQuestion = signal<Question | null>(null);
  showQuestionForm = signal(false);
  showImportForm = signal(false);
  showPublishModal = signal(false);

  errorMessage = signal('');
  successMessage = signal('');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private evaluationUseCase: EvaluationUseCase
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const mode = this.route.snapshot.queryParamMap.get('mode');
    
    if (id) {
      // L'ID peut être un nombre ou un UUID, on le passe tel quel
      this.loadEvaluation(id);
      
      if (mode === 'manual') {
        this.mode.set('manual');
        this.showQuestionForm.set(true);
      } else if (mode === 'import') {
        this.mode.set('import');
        this.showImportForm.set(true);
      }
    }
  }

  loadEvaluation(id: number | string): void {
    this.isLoading.set(true);
    this.evaluationUseCase.getEvaluation(id as any).subscribe({
      next: (evaluation) => {
        this.evaluation.set(evaluation);
        this.questions.set(evaluation.quizz?.questions || []);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement de l\'évaluation:', error);
        if (error.status === 404) {
          this.errorMessage.set('Cette évaluation n\'existe pas ou a été supprimée.');
          // Rediriger vers la liste après 2 secondes
          setTimeout(() => {
            this.router.navigate(['/evaluations']);
          }, 2000);
        } else {
          this.errorMessage.set('Erreur lors du chargement de l\'évaluation');
        }
        this.isLoading.set(false);
      }
    });
  }

  addQuestion(): void {
    this.editingQuestion.set(null);
    this.showQuestionForm.set(true);
  }

  editQuestion(question: Question): void {
    this.editingQuestion.set(question);
    this.showQuestionForm.set(true);
  }

  deleteQuestion(question: Question): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer cette question ?`)) {
      this.evaluationUseCase.deleteQuestion(question.id as any).subscribe({
        next: () => {
          this.successMessage.set('Question supprimée avec succès');
          const evalId = this.evaluation()?.id;
          if (evalId) {
            this.loadEvaluation(evalId);
          }
          setTimeout(() => this.successMessage.set(''), 3000);
        },
        error: (error) => {
          this.errorMessage.set(error.error?.message || 'Erreur lors de la suppression');
        }
      });
    }
  }

  onQuestionSaved(question: Question): void {
    this.showQuestionForm.set(false);
    this.editingQuestion.set(null);
    this.successMessage.set('Question enregistrée avec succès');
    const evalId = this.evaluation()?.id;
    if (evalId) {
      this.loadEvaluation(evalId);
    }
    setTimeout(() => this.successMessage.set(''), 3000);
  }

  onQuestionFormCancelled(): void {
    this.showQuestionForm.set(false);
    this.editingQuestion.set(null);
  }

  openImport(): void {
    this.showImportForm.set(true);
  }

  onQuestionsImported(questions: Question[]): void {
    this.showImportForm.set(false);
    this.successMessage.set(`${questions.length} questions importées avec succès`);
    const evalId = this.evaluation()?.id;
    if (evalId) {
      this.loadEvaluation(evalId);
    }
    setTimeout(() => this.successMessage.set(''), 3000);
  }

  onImportCancelled(): void {
    this.showImportForm.set(false);
  }

  openPublishModal(): void {
    this.showPublishModal.set(true);
  }

  publishEvaluation(): void {
    const evaluation = this.evaluation();
    if (!evaluation) return;

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    console.log('📤 Publishing evaluation:', evaluation.id);

    this.evaluationUseCase.publishEvaluation(evaluation.id).subscribe({
      next: (response: any) => {
        console.log('✅ Evaluation published:', response);
        this.isLoading.set(false);
        this.showPublishModal.set(false);
        this.successMessage.set('Évaluation publiée avec succès ! Les notifications ont été envoyées.');
        this.loadEvaluation(evaluation.id);
        setTimeout(() => this.successMessage.set(''), 5000);
      },
      error: (error) => {
        console.error('❌ Error publishing evaluation:', error);
        this.isLoading.set(false);
        this.showPublishModal.set(false);
        this.errorMessage.set(error.error?.message || 'Erreur lors de la publication');
      }
    });
  }

  cancelPublish(): void {
    this.showPublishModal.set(false);
  }

  backToList(): void {
    this.router.navigate(['/evaluations']);
  }

  previewEvaluation(): void {
    const evaluation = this.evaluation();
    if (evaluation) {
      this.router.navigate(['/evaluations', evaluation.id, 'preview']);
    }
  }

  getQuestionTypeLabel(type: string): string {
    switch (type) {
      case 'CHOIX_MULTIPLE': return 'QCM';
      case 'REPONSE_OUVERTE': return 'Réponse Ouverte';
      case 'QCM': return 'QCM';  // Fallback pour ancien format
      case 'TEXTE_LIBRE': return 'Réponse Ouverte';  // Fallback pour ancien format
      default: return type;
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  moveQuestionUp(index: number): void {
    if (index > 0) {
      const questions = [...this.questions()];
      [questions[index - 1], questions[index]] = [questions[index], questions[index - 1]];
      this.questions.set(questions);
      this.updateQuestionsOrder();
    }
  }

  moveQuestionDown(index: number): void {
    const questions = this.questions();
    if (index < questions.length - 1) {
      const newQuestions = [...questions];
      [newQuestions[index], newQuestions[index + 1]] = [newQuestions[index + 1], newQuestions[index]];
      this.questions.set(newQuestions);
      this.updateQuestionsOrder();
    }
  }

  updateQuestionsOrder(): void {
    // Update ordre for each question
    const questions = this.questions();
    questions.forEach((q, index) => {
      if (q.ordre !== index + 1) {
        this.evaluationUseCase.updateQuestion(q.id as any, { ordre: index + 1 }).subscribe();
      }
    });
  }

  // Expose String for template
  String = String;
}
