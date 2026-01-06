import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

// Angular Material imports
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Domain entities and services
import { Evaluation } from '../../../core/domain/entities/evaluation.entity';
import { Question } from '../../../core/domain/entities/question.entity';
import { EvaluationUseCase } from '../../../core/usecases/evaluation.usecase';

@Component({
  selector: 'app-evaluation-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './evaluation-detail.component.html',
  styleUrls: ['./evaluation-detail.component.scss']
})
export class EvaluationDetailComponent implements OnInit {
  evaluation = signal<Evaluation | null>(null);
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  activeTab = signal<'info' | 'questions' | 'results'>('questions');
  
  // États pour le formulaire de question
  editingQuestion = signal<Question | null>(null);
  questions = signal<Question[]>([]);
  showQuestionForm = signal(false);
  showQuestionImport = signal(false);

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
        // Get questions from quizz or Quizz property
        const questions = evaluation.quizz?.questions || evaluation.quizz?.Questions || 
                         evaluation.Quizz?.questions || evaluation.Quizz?.Questions || [];
        this.questions.set(questions);
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

  setActiveTab(tab: 'info' | 'questions' | 'results'): void {
    this.activeTab.set(tab);
  }

  goToReport(): void {
    const evaluationId = this.evaluation()?.id;
    if (evaluationId) {
      this.router.navigate(['/reports', evaluationId]);
    }
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
    this.editingQuestion.set(null);
    this.showQuestionForm.set(false);
    this.successMessage.set('Question sauvegardée avec succès');
    setTimeout(() => this.successMessage.set(''), 3000);
  }

  async deleteQuestion(question: Question): Promise<void> {
    const confirmed = confirm(`Êtes-vous sûr de vouloir supprimer la question "${question.enonce}" ?`);
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

    const confirmed = confirm(`Êtes-vous sûr de vouloir publier l'évaluation "${evaluation.titre}" ?`);
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

  getStatusIcon(status: string): string {
    switch (status) {
      case 'BROUILLON': return 'edit';
      case 'PUBLIEE': return 'play_circle';
      case 'CLOTUREE': return 'check_circle';
      default: return 'help';
    }
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('fr-FR');
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

  openQuestionForm(): void {
    this.editingQuestion.set(null);
    this.showQuestionForm.set(true);
  }

  closeQuestionForm(): void {
    this.showQuestionForm.set(false);
    this.editingQuestion.set(null);
  }

  editQuestion(question: Question): void {
    this.editingQuestion.set(question);
    this.showQuestionForm.set(true);
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
    this.showQuestionImport.set(false);
    this.successMessage.set(`${questions.length} question(s) importée(s) avec succès`);
    setTimeout(() => this.successMessage.set(''), 3000);
  }

  // Additional methods for template compatibility
  selectedQuestion = signal<Question | null>(null);
  showImportModal = signal(false);

  addQuestion(): void {
    this.openQuestionForm();
  }

  editEvaluation(): void {
    const evaluation = this.evaluation();
    if (evaluation) {
      this.router.navigate(['/evaluations', evaluation.id, 'edit']);
    }
  }

  deleteQuestionById(questionId: string | number): void {
    const currentQuestions = this.questions();
    const question = currentQuestions.find(q => q.id === questionId);
    if (question) {
      this.deleteQuestion(question);
    }
  }

  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index); // A, B, C, D...
  }

  closeImportModal(): void {
    this.showImportModal.set(false);
  }

  // Helper methods for template
  getQuestionCount(): number {
    return this.questions().length;
  }

  getClassesCount(): number {
    const evaluation = this.evaluation();
    if (!evaluation) return 0;
    
    if (evaluation.Classes && Array.isArray(evaluation.Classes)) {
      return evaluation.Classes.length;
    }
    if (evaluation.classe) {
      return 1;
    }
    return 0;
  }

  getDuration(): string {
    const evaluation = this.evaluation();
    if (!evaluation) return 'N/A';
    
    const duration = evaluation.quizz?.duree || 
                    evaluation.Quizz?.duree || 
                    (evaluation as any).duree;
    
    return duration ? String(duration) : 'N/A';
  }

  getClasses(): Array<{id: string | number, nom: string}> {
    const evaluation = this.evaluation();
    if (!evaluation) return [];
    
    if (evaluation.Classes && Array.isArray(evaluation.Classes)) {
      return evaluation.Classes;
    }
    if (evaluation.classe) {
      return [evaluation.classe];
    }
    return [];
  }

  // Helper methods for question options
  isOptionCorrect(option: any): boolean {
    if (typeof option === 'string') return false;
    return option?.estCorrecte || option?.isCorrect || false;
  }

  getOptionText(option: any): string {
    if (typeof option === 'string') return option;
    return option?.texte || option?.text || String(option || '');
  }

  hasOptions(question: Question): boolean {
    return !!(question.options && Array.isArray(question.options) && question.options.length > 0);
  }
}