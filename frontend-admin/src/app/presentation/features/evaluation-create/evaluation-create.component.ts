import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EvaluationUseCase } from '../../../core/usecases/evaluation.usecase';
import { AcademicUseCase } from '../../../core/usecases/academic.usecase';
import { Cours, Classe } from '../../../core/domain/entities/academic.entity';
import { EvaluationApiData, Question } from '../../../core/domain/entities/evaluation.entity';
import { QuestionFormComponent } from '../question-form/question-form.component';
import { QuestionImportComponent } from '../question-import/question-import.component';

@Component({
  selector: 'app-evaluation-create',
  standalone: true,
  imports: [CommonModule, FormsModule, QuestionFormComponent, QuestionImportComponent],
  templateUrl: './evaluation-create.component.html',
  styleUrls: ['./evaluation-create.component.scss']
})
export class EvaluationCreateComponent implements OnInit, OnDestroy {
  // Step management
  currentStep = signal(1);
  
  // Data
  cours = signal<Cours[]>([]);
  classes = signal<Classe[]>([]);
  questions = signal<Question[]>([]);
  
  // UI State
  isLoading = signal(false);
  
  // Draft management
  draftEvaluationId = signal<string | number | null>(null);
  quizzId = signal<string | number | null>(null);
  lastSaved = signal<Date | null>(null);
  
  // Auto-save
  autoSaveEnabled = signal(true);
  autoSaveInterval: any;
  
  // Question management
  showQuestionForm = signal(false);
  showQuestionImport = signal(false);
  editingQuestion = signal<Question | null>(null);
  
  // Computed signals to ensure arrays are always valid
  validCours = computed(() => {
    const coursArray = this.cours();
    return Array.isArray(coursArray) ? coursArray : [];
  });

  validClasses = computed(() => {
    const classesArray = this.classes();
    return Array.isArray(classesArray) ? classesArray : [];
  });

  validQuestions = computed(() => {
    const questionsArray = this.questions();
    return Array.isArray(questionsArray) ? questionsArray : [];
  });
  
  // Form data
  formData = {
    titre: '',
    description: '',
    dateDebut: '',
    dateFin: '',
    coursId: '' as string | number,
    classeIds: [] as (number | string)[]
  };

  // Modal
  createdEvaluationId = signal<string | number | null>(null);
  successMessage = signal('');
  errorMessage = signal('');

  constructor(
    private evaluationUseCase: EvaluationUseCase,
    private academicUseCase: AcademicUseCase,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCours();
    this.loadClasses();
    this.initializeAutoSave();
  }

  ngOnDestroy(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
  }

  initializeAutoSave(): void {
    this.autoSaveInterval = setInterval(() => {
      if (this.autoSaveEnabled() && this.hasMinimalData()) {
        this.autoSaveDraft();
      }
    }, 30000);
  }

  hasMinimalData(): boolean {
    return this.formData.titre.trim().length > 0 && 
           this.formData.coursId.toString().trim().length > 0 && 
           this.formData.classeIds.length > 0;
  }

  autoSaveDraft(): void {
    // Ne pas sauvegarder automatiquement si les données essentielles manquent
    if (!this.formData.coursId || this.formData.coursId === '' || this.formData.coursId === 0) {
      console.log('⚠️ Sauvegarde automatique ignorée - cours manquant');
      return;
    }

    if (!this.formData.classeIds || this.formData.classeIds.length === 0) {
      console.log('⚠️ Sauvegarde automatique ignorée - classes manquantes');
      return;
    }

    const draftData: EvaluationApiData = {
      titre: this.formData.titre || 'Brouillon sans titre',
      description: this.formData.description || '',
      dateDebut: this.formData.dateDebut ? new Date(this.formData.dateDebut).toISOString() : new Date().toISOString(),
      dateFin: this.formData.dateFin ? new Date(this.formData.dateFin).toISOString() : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      cours_id: this.formData.coursId,
      classeIds: this.formData.classeIds,
      statut: 'BROUILLON' as const
    };

    if (this.draftEvaluationId()) {
      this.updateAutoSaveDraft(draftData);
    } else {
      this.createAutoSaveDraft(draftData);
    }
  }

  createAutoSaveDraft(draftData: EvaluationApiData): void {
    this.evaluationUseCase.createEvaluation(draftData as any).subscribe({
      next: (evaluation) => {
        console.log('✅ Brouillon créé automatiquement:', evaluation);
        this.draftEvaluationId.set(evaluation.id);
        this.quizzId.set(evaluation.quizz?.id || null);
        this.lastSaved.set(new Date());
      },
      error: (error) => {
        console.error('❌ Erreur lors de la création du brouillon:', error);
      }
    });
  }

  updateAutoSaveDraft(draftData: EvaluationApiData): void {
    const draftId = this.draftEvaluationId();
    if (!draftId) return;

    this.evaluationUseCase.updateEvaluation(draftId, draftData as any).subscribe({
      next: (evaluation) => {
        console.log('✅ Brouillon mis à jour automatiquement:', evaluation);
        this.lastSaved.set(new Date());
      },
      error: (error) => {
        console.error('❌ Erreur lors de la mise à jour du brouillon:', error);
      }
    });
  }

  onFormChange(): void {
    if (this.autoSaveEnabled() && this.hasMinimalData()) {
      setTimeout(() => {
        this.autoSaveDraft();
      }, 3000);
    }
  }

  loadCours(): void {
    this.academicUseCase.getCours().subscribe({
      next: (cours: any) => {
        console.log('📚 Cours chargés:', cours);
        this.cours.set(cours);
      },
      error: (error: any) => {
        console.error('❌ Erreur lors du chargement des cours:', error);
        this.cours.set([]);
      }
    });
  }

  loadClasses(): void {
    this.academicUseCase.getAllClasses().subscribe({
      next: (classes) => {
        console.log('📚 Classes chargées:', classes);
        this.classes.set(classes);
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des classes:', error);
        this.classes.set([]);
      }
    });
  }

  validateStep1(): boolean {
    if (!this.formData.titre.trim()) {
      this.errorMessage.set('Le titre est requis');
      return false;
    }

    if (!this.formData.coursId || this.formData.coursId === '' || this.formData.coursId === 0) {
      this.errorMessage.set('Le cours est requis');
      return false;
    }

    if (!this.formData.classeIds || this.formData.classeIds.length === 0) {
      this.errorMessage.set('Au moins une classe est requise');
      return false;
    }

    return true;
  }

  nextStep(): void {
    if (this.currentStep() === 1) {
      if (!this.validateStep1()) return;
      
      // Si on a déjà un brouillon, le mettre à jour, sinon le créer
      if (this.draftEvaluationId()) {
        this.updateDraft();
      } else {
        this.createDraft();
      }
    } else if (this.currentStep() === 2) {
      // Passer à l'étape 3 (Publication)
      this.currentStep.set(3);
    }
  }

  prevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.set(this.currentStep() - 1);
    }
  }

  createDraft(): void {
    console.log('📝 Création d\'évaluation - Données du formulaire:', this.formData);
    
    const evaluationData: EvaluationApiData = {
      titre: this.formData.titre,
      description: this.formData.description,
      dateDebut: new Date(this.formData.dateDebut).toISOString(),
      dateFin: new Date(this.formData.dateFin).toISOString(),
      cours_id: this.formData.coursId,
      classeIds: this.formData.classeIds,
      statut: 'BROUILLON' as const
    };

    console.log('📤 Envoi au backend:', evaluationData);

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.evaluationUseCase.createEvaluation(evaluationData as any).subscribe({
      next: (evaluation) => {
        console.log('✅ Évaluation créée avec succès:', evaluation);
        console.log('🔍 Structure complète de l\'évaluation:', JSON.stringify(evaluation, null, 2));
        
        this.draftEvaluationId.set(evaluation.id);
        this.quizzId.set(evaluation.quizz?.id || null);
        
        console.log('🎯 ID de l\'évaluation créée:', evaluation.id);
        console.log('🎯 ID du quiz associé:', evaluation.quizz?.id);
        
        this.isLoading.set(false);
        this.successMessage.set('Évaluation sauvegardée');
        
        // Passer à l'étape 2
        this.currentStep.set(2);
        this.loadQuestions();
      },
      error: (error) => {
        console.error('❌ Erreur lors de la création:', error);
        this.isLoading.set(false);
        
        let errorMsg = 'Erreur lors de la création';
        if (error.error?.errors && Array.isArray(error.error.errors)) {
          errorMsg = `Erreur de validation: ${error.error.errors.map((e: any) => e.message || e.msg || JSON.stringify(e)).join(', ')}`;
        } else if (error.error?.message) {
          errorMsg = error.error.message;
        }
        
        this.errorMessage.set(errorMsg);
      }
    });
  }

  updateDraft(): void {
    const draftId = this.draftEvaluationId();
    if (!draftId) return;

    const evaluationData: EvaluationApiData = {
      titre: this.formData.titre,
      description: this.formData.description,
      dateDebut: new Date(this.formData.dateDebut).toISOString(),
      dateFin: new Date(this.formData.dateFin).toISOString(),
      cours_id: this.formData.coursId,
      classeIds: this.formData.classeIds,
      statut: 'BROUILLON' as const
    };

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.evaluationUseCase.updateEvaluation(draftId, evaluationData as any).subscribe({
      next: (evaluation) => {
        console.log('✅ Brouillon mis à jour:', evaluation);
        this.isLoading.set(false);
        this.successMessage.set('Évaluation sauvegardée');
        
        // Passer à l'étape 2
        this.currentStep.set(2);
        this.loadQuestions();
      },
      error: (error) => {
        console.error('❌ Erreur lors de la mise à jour:', error);
        this.isLoading.set(false);
        this.errorMessage.set('Erreur lors de la sauvegarde');
      }
    });
  }

  loadQuestions(): void {
    const quizzId = this.quizzId();
    if (!quizzId) {
      console.warn('⚠️ Pas de quizzId disponible pour charger les questions');
      return;
    }

    console.log('📋 Chargement des questions pour le quiz:', quizzId);
    
    this.evaluationUseCase.getQuestionsByQuizz(quizzId).subscribe({
      next: (questions: any) => {
        console.log('✅ Questions chargées:', questions);
        this.questions.set(questions || []);
      },
      error: (error: any) => {
        console.error('❌ Erreur lors du chargement des questions:', error);
        this.questions.set([]);
      }
    });
  }

  // Question management
  openQuestionForm(): void {
    this.editingQuestion.set(null);
    this.showQuestionForm.set(true);
  }

  openQuestionImport(): void {
    this.showQuestionImport.set(true);
  }

  editQuestion(question: Question): void {
    this.editingQuestion.set(question);
    this.showQuestionForm.set(true);
  }

  onQuestionSaved(question: Question): void {
    this.showQuestionForm.set(false);
    this.loadQuestions(); // Recharger les questions
  }

  onQuestionsImported(questions: Question[]): void {
    this.showQuestionImport.set(false);
    this.loadQuestions(); // Recharger les questions
  }

  onQuestionFormCancelled(): void {
    this.showQuestionForm.set(false);
    this.editingQuestion.set(null);
  }

  onQuestionImportCancelled(): void {
    this.showQuestionImport.set(false);
  }

  deleteQuestion(question: Question): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer cette question ?`)) {
      if (!question.id) {
        this.errorMessage.set('ID de question manquant');
        return;
      }
      this.evaluationUseCase.deleteQuestion(question.id).subscribe({
        next: () => {
          this.successMessage.set('Question supprimée avec succès');
          this.loadQuestions();
        },
        error: (error) => {
          console.error('❌ Erreur lors de la suppression:', error);
          this.errorMessage.set('Erreur lors de la suppression de la question');
        }
      });
    }
  }

  duplicateQuestion(question: Question): void {
    const duplicateData = {
      ...question,
      enonce: `${question.enonce} (Copie)`
    };
    delete (duplicateData as any).id;

    const quizzId = this.quizzId();
    if (!quizzId) return;

    this.evaluationUseCase.createQuestion(quizzId, duplicateData).subscribe({
      next: (createdQuestion: any) => {
        this.successMessage.set('Question dupliquée avec succès');
        this.loadQuestions();
      },
      error: (error: any) => {
        console.error('❌ Erreur lors de la duplication:', error);
        this.errorMessage.set('Erreur lors de la duplication de la question');
      }
    });
  }

  // Publication
  publishEvaluation(): void {
    const evaluationId = this.draftEvaluationId();
    if (!evaluationId) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.evaluationUseCase.publishEvaluation(evaluationId).subscribe({
      next: (evaluation) => {
        console.log('✅ Évaluation publiée:', evaluation);
        this.isLoading.set(false);
        this.createdEvaluationId.set(evaluation.id);
        this.successMessage.set('Évaluation publiée avec succès !');
      },
      error: (error) => {
        console.error('❌ Erreur lors de la publication:', error);
        this.isLoading.set(false);
        this.errorMessage.set('Erreur lors de la publication');
      }
    });
  }

  // Missing methods for template
  showCreateForm = computed(() => this.showQuestionForm());
  showImportForm = computed(() => this.showQuestionImport());

  cancel(): void {
    this.router.navigate(['/evaluations']);
  }

  getProgressPercentage(): number {
    const step = this.currentStep();
    return (step / 3) * 100;
  }

  isClasseSelected(classeId: string | number): boolean {
    return this.formData.classeIds.includes(classeId);
  }

  toggleClasse(classeId: string | number): void {
    const index = this.formData.classeIds.indexOf(classeId);
    if (index > -1) {
      this.formData.classeIds.splice(index, 1);
    } else {
      this.formData.classeIds.push(classeId);
    }
    this.onFormChange();
  }

  onShowCreateForm(): void {
    this.openQuestionForm();
  }

  onShowImportForm(): void {
    this.openQuestionImport();
  }

  onQuestionCreated(question: Question): void {
    this.onQuestionSaved(question);
  }

  onFormCancelled(): void {
    this.onQuestionFormCancelled();
  }

  onDeleteQuestion(questionId: string | number): void {
    const question = this.validQuestions().find(q => q.id === questionId);
    if (question) {
      this.deleteQuestion(question);
    }
  }

  getQuestionTypeIcon(type: string): string {
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

  getCoursName(coursId: string | number): string {
    const cours = this.validCours().find(c => c.id === coursId);
    return cours?.nom || 'Cours inconnu';
  }

  getClassName(classeId: string): string {
    const classe = this.validClasses().find(c => c.id?.toString() === classeId);
    return classe?.nom || 'Classe inconnue';
  }

  getQuestionTypeLabel(type: string): string {
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

  getCharFromIndex(index: number): string {
    return String.fromCharCode(65 + index); // A, B, C, D...
  }

  hasValidOptions(question: Question): boolean {
    return !!(question.options && question.options.length > 0);
  }

  canPublish(): boolean {
    return this.validQuestions().length > 0 && this.draftEvaluationId() !== null;
  }

  previousStep(): void {
    this.prevStep();
  }

  saveDraft(): void {
    if (this.draftEvaluationId()) {
      this.updateDraft();
    } else {
      this.createDraft();
    }
  }

  // Navigation
  goToEvaluations(): void {
    this.router.navigate(['/evaluations']);
  }

  goToEvaluationDetail(): void {
    const evaluationId = this.createdEvaluationId();
    if (evaluationId) {
      this.router.navigate(['/evaluations', evaluationId]);
    }
  }
}