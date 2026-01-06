import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EvaluationUseCase } from '../../../core/usecases/evaluation.usecase';
import { AcademicUseCase } from '../../../core/usecases/academic.usecase';
import { Cours, Classe } from '../../../core/domain/entities/academic.entity';
import { EvaluationApiData } from '../../../core/domain/entities/evaluation.entity';
import { Question } from '../../../core/domain/entities/question.entity';

@Component({
  selector: 'app-evaluation-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './evaluation-create.component.html',
  styleUrls: ['./evaluation-create.component.scss']
})
export class EvaluationCreateComponent implements OnInit, OnDestroy {
  // Gestion des étapes
  currentStep = signal(1);
  
  // Formulaire réactif
  evaluationForm!: FormGroup;
  
  // Données
  cours = signal<Cours[]>([]);
  classes = signal<Classe[]>([]);
  questions = signal<Question[]>([]);
  
  // États
  isLoading = signal(false);
  isPublishing = signal(false);
  
  // Gestion des brouillons
  draftEvaluationId = signal<string | number | null>(null);
  quizzId = signal<string | number | null>(null);
  autoSaveEnabled = signal(true);
  autoSaveStatus = signal('');

  // Messages
  errorMessage = signal('');
  successMessage = signal('');

  // Modales
  showQuestionForm = signal(false);
  showImportModal = signal(false);
  showCreationMethodModal = signal(false);
  showTemplateImport = signal(false);
  showManualCreation = signal(false);
  editingQuestion = signal<Question | null>(null);
  selectedCreationMethod = signal<'manual' | 'template' | null>(null);

  // Auto-save timer
  private autoSaveTimer: any;

  constructor(
    private fb: FormBuilder,
    private evaluationUseCase: EvaluationUseCase,
    private academicUseCase: AcademicUseCase,
    private router: Router
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadCours();
    this.loadClasses();
    this.startAutoSave();
    this.setupFormValidation();
  }

  ngOnDestroy(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }
  }

  private initializeForm(): void {
    this.evaluationForm = this.fb.group({
      titre: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      dateDebut: ['', [Validators.required, this.futureDateValidator]],
      dateFin: ['', [Validators.required]],
      duree: [60, [Validators.required, Validators.min(5), Validators.max(480)]],
      coursId: ['', [Validators.required]],
      classeIds: [[], [Validators.required, this.minArrayLengthValidator(1)]]
    }, { validators: this.dateRangeValidator });
  }

  private setupFormValidation(): void {
    this.evaluationForm.valueChanges.subscribe(() => {
      this.scheduleAutoSave();
    });
  }

  private startAutoSave(): void {
    this.autoSaveTimer = setInterval(() => {
      if (this.autoSaveEnabled() && this.canSaveDraft()) {
        this.autoSave();
      }
    }, 30000); // Auto-save every 30 seconds
  }

  private scheduleAutoSave(): void {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }
    this.autoSaveTimer = setTimeout(() => {
      if (this.autoSaveEnabled() && this.canSaveDraft()) {
        this.autoSave();
      }
    }, 3000); // Auto-save after 3 seconds of inactivity
  }

  // Validators
  private futureDateValidator(control: any) {
    if (!control.value) return null;
    const selectedDate = new Date(control.value);
    const now = new Date();
    return selectedDate > now ? null : { pastDate: true };
  }

  private dateRangeValidator(form: FormGroup) {
    const startDate = form.get('dateDebut')?.value;
    const endDate = form.get('dateFin')?.value;
    
    if (!startDate || !endDate) return null;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return start < end ? null : { invalidRange: true };
  }

  private minArrayLengthValidator(minLength: number) {
    return (control: any) => {
      if (!control.value || !Array.isArray(control.value)) {
        return { required: true };
      }
      return control.value.length >= minLength ? null : { minLength: true };
    };
  }

  // Form validation helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.evaluationForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.evaluationForm.get(fieldName);
    if (!field || !field.errors) return '';

    const errors = field.errors;
    
    if (errors['required']) return `Ce champ est requis`;
    if (errors['minlength']) return `Minimum ${errors['minlength'].requiredLength} caractères`;
    if (errors['maxlength']) return `Maximum ${errors['maxlength'].requiredLength} caractères`;
    if (errors['min']) return `Valeur minimum: ${errors['min'].min}`;
    if (errors['max']) return `Valeur maximum: ${errors['max'].max}`;
    if (errors['pastDate']) return `La date doit être dans le futur`;
    if (errors['invalidRange']) return `La date de fin doit être après la date de début`;
    if (errors['minLength']) return `Sélectionnez au moins une classe`;

    return 'Valeur invalide';
  }

  // Computed properties
  get formData() {
    return this.evaluationForm.value;
  }

  loadCours(): void {
    this.academicUseCase.getCours().subscribe({
      next: (cours) => {
        console.log('📚 Cours chargés:', cours);
        this.cours.set(cours);
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des cours:', error);
        this.errorMessage.set('Erreur lors du chargement des cours');
      }
    });
  }

  loadClasses(): void {
    this.academicUseCase.getClasses().subscribe({
      next: (classes) => {
        console.log('📚 Classes chargées:', classes);
        this.classes.set(classes.classes || classes);
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des classes:', error);
        this.errorMessage.set('Erreur lors du chargement des classes');
      }
    });
  }

  // Navigation methods
  canNavigateToStep(step: number): boolean {
    switch (step) {
      case 1: return true;
      case 2: return this.validateStep1();
      case 3: return this.validateStep1();
      default: return false;
    }
  }

  goToStep(step: number): void {
    if (this.canNavigateToStep(step)) {
      // Si on va à l'étape 2 et qu'aucune méthode n'est sélectionnée, afficher le modal
      if (step === 2 && !this.selectedCreationMethod()) {
        this.showCreationMethodModal.set(true);
      }
      this.currentStep.set(step);
    }
  }

  nextStep(): void {
    const current = this.currentStep();
    if (current === 1 && this.validateStep1()) {
      this.createOrUpdateEvaluation();
    } else if (current === 2) {
      this.currentStep.set(3);
    }
  }

  previousStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.set(this.currentStep() - 1);
    }
  }

  // Méthodes pour le modal de sélection de méthode
  selectCreationMethod(method: 'manual' | 'template'): void {
    this.selectedCreationMethod.set(method);
    this.showCreationMethodModal.set(false);
    
    if (method === 'template') {
      this.showTemplateImport.set(true);
    } else {
      this.showManualCreation.set(true);
    }
  }

  closeCreationMethodModal(): void {
    this.showCreationMethodModal.set(false);
    // Si aucune méthode n'est sélectionnée, retourner à l'étape 1
    if (!this.selectedCreationMethod()) {
      this.currentStep.set(1);
    }
  }

  changeCreationMethod(): void {
    this.selectedCreationMethod.set(null);
    this.showTemplateImport.set(false);
    this.showManualCreation.set(false);
    this.showCreationMethodModal.set(true);
  }

  // Méthodes pour l'import de template
  closeTemplateImport(): void {
    this.showTemplateImport.set(false);
  }

  onTemplateImported(questions: Question[]): void {
    this.questions.set(questions);
    this.showTemplateImport.set(false);
    this.successMessage.set(`${questions.length} question(s) importée(s) avec succès`);
  }

  // Méthodes pour la création manuelle
  closeManualCreation(): void {
    this.showManualCreation.set(false);
  }

  onManualQuestionCreated(question: Question): void {
    const currentQuestions = this.questions();
    this.questions.set([...currentQuestions, question]);
    this.successMessage.set('Question ajoutée avec succès');
  }

  canProceedToNextStep(): boolean {
    switch (this.currentStep()) {
      case 1: return this.validateStep1();
      case 2: return true; // Can proceed without questions
      default: return false;
    }
  }

  // Step descriptions
  getStepDescription(): string {
    switch (this.currentStep()) {
      case 1: return 'Configurez les paramètres de base de votre évaluation';
      case 2: return 'Ajoutez et organisez les questions de votre évaluation';
      case 3: return 'Vérifiez et publiez votre évaluation';
      default: return '';
    }
  }

  getStepName(): string {
    switch (this.currentStep()) {
      case 1: return 'Configuration';
      case 2: return 'Questions';
      case 3: return 'Publication';
      default: return '';
    }
  }

  getStepIcon(): string {
    switch (this.currentStep()) {
      case 1: return 'settings';
      case 2: return 'quiz';
      case 3: return 'publish';
      default: return 'help';
    }
  }

  // Validation methods
  validateStep1(): boolean {
    return this.evaluationForm.valid;
  }

  canSaveDraft(): boolean {
    const titre = this.evaluationForm.get('titre')?.value;
    return !!(titre && titre.trim().length > 0);
  }

  canPublishEvaluation(): boolean {
    return this.validateStep1() && this.questions().length > 0;
  }

  // Auto-save functionality
  private autoSave(): void {
    if (!this.canSaveDraft()) return;

    const formValue = this.evaluationForm.value;
    const evaluationData: EvaluationApiData = {
      titre: formValue.titre || 'Évaluation sans titre',
      description: formValue.description || '',
      dateDebut: formValue.dateDebut ? new Date(formValue.dateDebut).toISOString() : new Date().toISOString(),
      dateFin: formValue.dateFin ? new Date(formValue.dateFin).toISOString() : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      coursId: formValue.coursId,
      cours_id: formValue.coursId,
      classeIds: formValue.classeIds || [],
      statut: 'BROUILLON' as const
    };

    if (this.draftEvaluationId()) {
      this.updateDraft(evaluationData);
    } else {
      this.createDraft(evaluationData);
    }
  }

  saveDraft(): void {
    this.autoSave();
  }

  // Class selection methods
  isClassSelected(classeId: string | number): boolean {
    const selectedIds = this.evaluationForm.get('classeIds')?.value || [];
    return selectedIds.includes(classeId);
  }

  toggleClass(classeId: string | number): void {
    const currentIds = this.evaluationForm.get('classeIds')?.value || [];
    const index = currentIds.indexOf(classeId);
    
    let newIds;
    if (index > -1) {
      newIds = currentIds.filter((id: any) => id !== classeId);
    } else {
      newIds = [...currentIds, classeId];
    }
    
    this.evaluationForm.patchValue({ classeIds: newIds });
  }

  getTotalStudents(): number {
    const selectedIds = this.evaluationForm.get('classeIds')?.value || [];
    return this.classes()
      .filter(classe => selectedIds.includes(classe.id))
      .reduce((total, classe) => total + (classe.effectif || 0), 0);
  }

  // CRUD operations
  private updateDraft(evaluationData: EvaluationApiData): void {
    const draftId = this.draftEvaluationId();
    if (!draftId) return;

    this.evaluationUseCase.updateEvaluation(draftId, evaluationData).subscribe({
      next: (evaluation) => {
        this.handleEvaluationResponse(evaluation);
        this.autoSaveStatus.set(`Sauvegardé à ${new Date().toLocaleTimeString()}`);
        setTimeout(() => this.autoSaveStatus.set(''), 3000);
      },
      error: (error) => {
        console.error('❌ Erreur lors de la mise à jour du brouillon:', error);
        this.errorMessage.set('Erreur lors de la sauvegarde');
      }
    });
  }

  private createDraft(evaluationData: EvaluationApiData): void {
    this.evaluationUseCase.createEvaluation(evaluationData).subscribe({
      next: (evaluation) => {
        this.handleEvaluationResponse(evaluation);
        this.autoSaveStatus.set(`Brouillon créé à ${new Date().toLocaleTimeString()}`);
        setTimeout(() => this.autoSaveStatus.set(''), 3000);
      },
      error: (error) => {
        console.error('❌ Erreur lors de la création du brouillon:', error);
        this.errorMessage.set('Erreur lors de la création du brouillon');
      }
    });
  }

  private handleEvaluationResponse(evaluation: any): void {
    this.draftEvaluationId.set(evaluation.id);
    
    // Extract quizzId from different possible locations
    let quizzId = null;
    if (evaluation.quizz?.id) {
      quizzId = evaluation.quizz.id;
    } else if (evaluation.Quizz?.id) {
      quizzId = evaluation.Quizz.id;
    } else if (evaluation.quizzId) {
      quizzId = evaluation.quizzId;
    }

    if (quizzId) {
      this.quizzId.set(quizzId);
      this.loadQuestions();
    }
  }

  createOrUpdateEvaluation(): void {
    if (!this.validateStep1()) return;

    const formValue = this.evaluationForm.value;
    const evaluationData: EvaluationApiData = {
      titre: formValue.titre,
      description: formValue.description,
      dateDebut: new Date(formValue.dateDebut).toISOString(),
      dateFin: new Date(formValue.dateFin).toISOString(),
      coursId: formValue.coursId,
      cours_id: formValue.coursId,
      classeIds: formValue.classeIds,
      statut: 'BROUILLON' as const
    };

    this.isLoading.set(true);
    
    if (this.draftEvaluationId()) {
      this.updateDraft(evaluationData);
    } else {
      this.createDraft(evaluationData);
    }

    // Move to next step after successful creation/update
    setTimeout(() => {
      this.currentStep.set(2);
      this.isLoading.set(false);
    }, 1000);
  }

  // Question management
  loadQuestions(): void {
    const quizzId = this.quizzId();
    if (!quizzId) return;

    this.evaluationUseCase.getQuestionsByQuizz(quizzId).subscribe({
      next: (questions: Question[]) => {
        this.questions.set(questions);
      },
      error: (error: any) => {
        console.error('❌ Erreur lors du chargement des questions:', error);
        this.errorMessage.set('Erreur lors du chargement des questions');
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

  openImportModal(): void {
    this.showImportModal.set(true);
  }

  closeImportModal(): void {
    this.showImportModal.set(false);
  }

  onQuestionSaved(question: Question): void {
    const quizzId = this.quizzId();
    if (!quizzId) {
      this.errorMessage.set('Erreur: ID du quiz non disponible');
      return;
    }

    if (this.editingQuestion()) {
      // Update existing question
      this.evaluationUseCase.updateQuestion(question.id!, question).subscribe({
        next: (updatedQuestion: Question) => {
          const currentQuestions = this.questions();
          const index = currentQuestions.findIndex(q => q.id === question.id);
          if (index > -1) {
            currentQuestions[index] = updatedQuestion;
            this.questions.set([...currentQuestions]);
          }
          this.successMessage.set('Question mise à jour avec succès !');
          this.closeQuestionForm();
        },
        error: (error: any) => {
          console.error('❌ Erreur lors de la mise à jour de la question:', error);
          this.errorMessage.set('Erreur lors de la mise à jour de la question');
        }
      });
    } else {
      // Create new question
      this.evaluationUseCase.createQuestion(quizzId, question).subscribe({
        next: (createdQuestion: Question) => {
          const currentQuestions = this.questions();
          this.questions.set([...currentQuestions, createdQuestion]);
          this.successMessage.set('Question créée avec succès !');
          this.closeQuestionForm();
        },
        error: (error: any) => {
          console.error('❌ Erreur lors de la création de la question:', error);
          this.errorMessage.set('Erreur lors de la création de la question');
        }
      });
    }
  }

  confirmDeleteQuestion(questionId: string | number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) {
      this.deleteQuestion(questionId);
    }
  }

  deleteQuestion(questionId: string | number): void {
    this.evaluationUseCase.deleteQuestion(questionId).subscribe({
      next: () => {
        const currentQuestions = this.questions();
        const updatedQuestions = currentQuestions.filter(q => q.id !== questionId);
        this.questions.set(updatedQuestions);
        this.successMessage.set('Question supprimée avec succès');
      },
      error: (error: any) => {
        console.error('❌ Erreur lors de la suppression de la question:', error);
        this.errorMessage.set('Erreur lors de la suppression de la question');
      }
    });
  }

  onQuestionsImported(questions: Question[]): void {
    this.loadQuestions();
    this.successMessage.set(`${questions.length} question(s) importée(s) avec succès !`);
    this.closeImportModal();
  }

  reorderQuestions(): void {
    // TODO: Implement drag & drop reordering
    console.log('Réorganisation des questions - À implémenter');
  }

  // Publication
  publishEvaluation(): void {
    if (!this.canPublishEvaluation()) {
      this.errorMessage.set('Impossible de publier une évaluation incomplète');
      return;
    }

    const evaluationId = this.draftEvaluationId();
    if (!evaluationId) {
      this.errorMessage.set('Aucune évaluation à publier');
      return;
    }

    this.isPublishing.set(true);
    this.evaluationUseCase.publishEvaluation(evaluationId).subscribe({
      next: (evaluation) => {
        this.successMessage.set('Évaluation publiée avec succès !');
        this.isPublishing.set(false);
        
        setTimeout(() => {
          this.router.navigate(['/evaluations']);
        }, 2000);
      },
      error: (error) => {
        console.error('❌ Erreur lors de la publication:', error);
        this.errorMessage.set('Erreur lors de la publication de l\'évaluation');
        this.isPublishing.set(false);
      }
    });
  }

  schedulePublication(): void {
    // TODO: Implement scheduled publication
    console.log('Publication programmée - À implémenter');
  }

  previewEvaluation(): void {
    // TODO: Implement student preview
    console.log('Aperçu étudiant - À implémenter');
  }

  // Utility methods
  getQuestionTypeLabel(type: string | undefined): string {
    if (!type) return 'Type inconnu';
    const labels: { [key: string]: string } = {
      'QCM': 'QCM',
      'VRAI_FAUX': 'Vrai/Faux',
      'TEXTE_LIBRE': 'Texte libre',
      'NUMERIQUE': 'Numérique',
      'OUI_NON': 'Oui/Non',
      'ECHELLE': 'Échelle'
    };
    return labels[type] || type;
  }

  getQuestionTypeIcon(type: string | undefined): string {
    if (!type) return 'help_outline';
    const icons: { [key: string]: string } = {
      'QCM': 'radio_button_checked',
      'VRAI_FAUX': 'check_box',
      'TEXTE_LIBRE': 'text_fields',
      'NUMERIQUE': 'pin',
      'OUI_NON': 'toggle_on',
      'ECHELLE': 'linear_scale'
    };
    return icons[type] || 'help_outline';
  }

  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index); // A, B, C, D...
  }

  getCoursName(coursId: string | number): string {
    const cours = this.cours().find(c => String(c.id) === String(coursId));
    return cours?.nom || '';
  }

  getClassName(classeId: string | number): string {
    const classe = this.classes().find(c => String(c.id) === String(classeId));
    return classe?.nom || '';
  }

  formatDateTime(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR');
  }

  getProgressPercentage(): number {
    return (this.currentStep() / 3) * 100;
  }

  // Question statistics
  getQCMCount(): number {
    return this.questions().filter(q => q.typeQuestion === 'QCM').length;
  }

  getOpenCount(): number {
    return this.questions().filter(q => q.typeQuestion !== 'QCM').length;
  }

  getEstimatedDuration(): number {
    const questions = this.questions();
    // Estimate 2 minutes per QCM, 3 minutes per open question
    const qcmTime = this.getQCMCount() * 2;
    const openTime = this.getOpenCount() * 3;
    return qcmTime + openTime;
  }

  // Navigation and cleanup
  goBack(): void {
    this.router.navigate(['/evaluations']);
  }

  confirmCancel(): void {
    if (this.evaluationForm.dirty) {
      if (confirm('Vous avez des modifications non sauvegardées. Voulez-vous vraiment quitter ?')) {
        this.goBack();
      }
    } else {
      this.goBack();
    }
  }

  clearMessages(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  // Legacy compatibility methods (to be removed)
  onFormChange(): void {
    // Legacy method for template compatibility
  }

  // Properties for template compatibility
  showCreateForm = signal(false);
  showImportForm = signal(false);
  canPublish = signal(false);
  createdEvaluationId = signal<string | number | null>(null);
  showMethodModal = signal(false);
  questionCreationMethod = signal<'manual' | 'import' | null>(null);

  checkCanPublish(): void {
    this.canPublish.set(this.canPublishEvaluation());
  }

  onShowCreateForm(): void {
    this.showCreateForm.set(true);
    this.showImportForm.set(false);
    this.questionCreationMethod.set('manual');
  }

  onShowImportForm(): void {
    this.showImportForm.set(true);
    this.showCreateForm.set(false);
    this.questionCreationMethod.set('import');
  }

  onFormCancelled(): void {
    this.showCreateForm.set(false);
    this.showImportForm.set(false);
    this.questionCreationMethod.set(null);
  }

  selectManualCreation(): void {
    const evalId = this.createdEvaluationId();
    if (evalId) {
      this.router.navigate(['/evaluations', evalId], { 
        queryParams: { mode: 'manual' } 
      });
    }
  }

  selectExcelImport(): void {
    this.showMethodModal.set(false);
  }

  getSelectedClassesNames(): string {
    const selectedIds = this.evaluationForm.get('classeIds')?.value || [];
    const selectedClasses = this.classes().filter(c => 
      selectedIds.includes(c.id)
    );
    return selectedClasses.map(c => c.nom).join(', ');
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  }
}