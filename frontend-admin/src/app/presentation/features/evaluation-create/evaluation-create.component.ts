import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EvaluationUseCase } from '../../../core/usecases/evaluation.usecase';
import { AcademicUseCase } from '../../../core/usecases/academic.usecase';
import { Cours, Classe } from '../../../core/domain/entities/academic.entity';
import { EvaluationApiData, Question } from '../../../core/domain/entities/evaluation.entity';
import { QuestionFormComponent } from '../question-form/question-form.component';
<<<<<<< Updated upstream
import { QuestionImportComponent } from '../question-import/question-import.component';
=======
>>>>>>> Stashed changes

@Component({
  selector: 'app-evaluation-create',
  standalone: true,
<<<<<<< Updated upstream
  imports: [CommonModule, FormsModule, QuestionFormComponent, QuestionImportComponent],
=======
  imports: [CommonModule, FormsModule, QuestionFormComponent],
>>>>>>> Stashed changes
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
  isLoading = signal(false);
  
  // Computed signals to ensure arrays are always valid
  validCours = computed(() => {
    const coursData = this.cours();
    return Array.isArray(coursData) ? coursData : [];
  });
  
  validClasses = computed(() => {
    const classesData = this.classes();
    return Array.isArray(classesData) ? classesData : [];
  });
  
  // Draft management
  draftEvaluationId = signal<string | number | null>(null);
  quizzId = signal<string | number | null>(null);
  autoSaveEnabled = signal(true);
  lastSaved = signal<Date | null>(null);
  
  // Questions management
  questions = signal<Question[]>([]);
  showQuestionForm = signal(false);
  editingQuestion = signal<Question | null>(null);
  
  // Form data
  formData = {
    titre: '',
    description: '',
    dateDebut: '',
    dateFin: '',
<<<<<<< Updated upstream
    coursId: '', // Changé pour gérer les UUIDs
    classeIds: [] as (number | string)[]
  };

  // Step 2 - Questions management
  showCreateForm = signal(false);
  showImportForm = signal(false);
  questionCreationMethod = signal<'manual' | 'import' | null>(null);

  // Step 3 - Review
  canPublish = signal(false);
=======
    coursId: '' as string | number, // Peut être string (UUID) ou number
    classeIds: [] as (number | string)[]
  };

  // Modal
  createdEvaluationId = signal<string | number | null>(null);
>>>>>>> Stashed changes

  errorMessage = signal('');
  successMessage = signal('');

  private autoSaveInterval: any;

  constructor(
    private evaluationUseCase: EvaluationUseCase,
    private academicUseCase: AcademicUseCase,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Ensure signals are properly initialized with empty arrays
    this.cours.set([]);
    this.classes.set([]);
    
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
           this.formData.coursId.trim().length > 0 && 
           this.formData.classeIds.length > 0;
  }

  autoSaveDraft(): void {
    if (!this.hasMinimalData()) return;

    // Ne pas sauvegarder automatiquement si les données essentielles manquent
<<<<<<< Updated upstream
    if (!this.formData.coursId.trim() || this.formData.classeIds.length === 0) {
      console.log('⚠️ Sauvegarde automatique ignorée: cours ou classes manquants');
=======
    if (!this.formData.coursId || this.formData.coursId === '' || this.formData.coursId === 0) {
      console.log('⚠️ Sauvegarde automatique ignorée - cours manquant');
      return;
    }

    if (!this.formData.classeIds || this.formData.classeIds.length === 0) {
      console.log('⚠️ Sauvegarde automatique ignorée - classes manquantes');
>>>>>>> Stashed changes
      return;
    }

    const draftData: EvaluationApiData = {
      titre: this.formData.titre || 'Brouillon sans titre',
      description: this.formData.description,
      dateDebut: this.formData.dateDebut ? new Date(this.formData.dateDebut).toISOString() : new Date().toISOString(),
      dateFin: this.formData.dateFin ? new Date(this.formData.dateFin).toISOString() : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
<<<<<<< Updated upstream
<<<<<<< Updated upstream
      coursId: this.formData.coursId || 1, // Add required coursId
      cours_id: this.formData.coursId || undefined,
      classeIds: this.formData.classeIds.length > 0 ? this.formData.classeIds : [1], // Classe par défaut
=======
      cours_id: this.formData.coursId,
      classeIds: this.formData.classeIds,
>>>>>>> Stashed changes
=======
      cours_id: this.formData.coursId,
      classeIds: this.formData.classeIds,
>>>>>>> Stashed changes
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
        this.draftEvaluationId.set(evaluation.id);
        this.lastSaved.set(new Date());
        console.log('💾 Brouillon créé automatiquement:', evaluation.id);
      },
      error: (error) => {
        console.warn('⚠️ Erreur lors de la sauvegarde automatique:', error);
      }
    });
  }

  updateAutoSaveDraft(draftData: EvaluationApiData): void {
    const draftId = this.draftEvaluationId();
    if (!draftId) return;

    this.evaluationUseCase.updateEvaluation(draftId.toString(), draftData as any).subscribe({
      next: (evaluation) => {
        this.lastSaved.set(new Date());
        console.log('💾 Brouillon mis à jour automatiquement:', evaluation.id);
      },
      error: (error) => {
        console.warn('⚠️ Erreur lors de la mise à jour automatique:', error);
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
      next: (cours) => {
        // Ensure we always set a valid array
        if (Array.isArray(cours)) {
          this.cours.set(cours);
        } else {
          console.warn('Cours data is not an array:', cours);
          this.cours.set([]);
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des cours:', error);
        this.cours.set([]); // Ensure we always have an array
      }
    });
  }

  loadClasses(): void {
    this.academicUseCase.getAllClasses().subscribe({
      next: (classes) => {
        console.log('📚 Classes chargées:', classes);
<<<<<<< Updated upstream
        console.log('📚 Types des IDs:', classes.map(c => ({ nom: c.nom, id: c.id, type: typeof c.id })));
        // Ensure we always set a valid array
        if (Array.isArray(classes)) {
          this.classes.set(classes);
        } else {
          console.warn('Classes data is not an array:', classes);
          this.classes.set([]);
        }
=======
        this.classes.set(classes);
>>>>>>> Stashed changes
      },
      error: (error) => {
        console.error('Erreur lors du chargement des classes:', error);
        this.classes.set([]); // Ensure we always have an array
      }
    });
  }

  validateStep1(): boolean {
    if (!this.formData.titre.trim()) {
      this.errorMessage.set('Le titre est requis');
      return false;
    }
    if (!this.formData.dateDebut) {
      this.errorMessage.set('La date de début est requise');
      return false;
    }
    if (!this.formData.dateFin) {
      this.errorMessage.set('La date de fin est requise');
      return false;
    }
    if (new Date(this.formData.dateDebut) >= new Date(this.formData.dateFin)) {
      this.errorMessage.set('La date de fin doit être après la date de début');
      return false;
    }
<<<<<<< Updated upstream
    if (!this.formData.coursId.trim()) {
=======
    if (!this.formData.coursId || this.formData.coursId === '' || this.formData.coursId === 0) {
>>>>>>> Stashed changes
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
    this.errorMessage.set('');
    
    if (this.currentStep() === 1) {
      if (!this.validateStep1()) {
        return;
      }
      
      if (this.draftEvaluationId()) {
        this.updateDraftAndProceed();
      } else {
        this.createDraftEvaluation();
      }
    } else if (this.currentStep() === 2) {
<<<<<<< Updated upstream
      this.currentStep.set(3);
      this.checkCanPublish();
    }
  }

  previousStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.set(this.currentStep() - 1);
=======
      // Passer à l'étape 3 (Publication)
      this.currentStep.set(3);
>>>>>>> Stashed changes
    }
  }

  updateDraftAndProceed(): void {
    this.isLoading.set(true);
    
    const evaluationData: EvaluationApiData = {
      titre: this.formData.titre,
      description: this.formData.description,
      dateDebut: new Date(this.formData.dateDebut).toISOString(),
      dateFin: new Date(this.formData.dateFin).toISOString(),
      coursId: this.formData.coursId, // Add required coursId
      cours_id: this.formData.coursId,
      classeIds: this.formData.classeIds,
      statut: 'BROUILLON' as const
    };

    const draftId = this.draftEvaluationId();
    if (!draftId) return;

    this.evaluationUseCase.updateEvaluation(draftId.toString(), evaluationData as any).subscribe({
      next: (evaluation) => {
        console.log('✅ Brouillon mis à jour:', evaluation);
<<<<<<< Updated upstream
        this.successMessage.set('Évaluation sauvegardée');
        this.isLoading.set(false);
        
        this.currentStep.set(2);
        this.loadQuestions();
=======
        console.log('🔍 Structure complète de l\'évaluation:', JSON.stringify(evaluation, null, 2));
        
        this.createdEvaluationId.set(evaluation.id);
        this.draftEvaluationId.set(evaluation.id);
        
        // Récupérer l'ID du quizz - maintenant mappé par le repository
        let quizzId = null;
        if ((evaluation as any).quizzId) {
          quizzId = (evaluation as any).quizzId;
          console.log('📋 Quizz ID trouvé via evaluation.quizzId:', quizzId);
        } else if (evaluation.quizz?.id) {
          quizzId = evaluation.quizz.id;
          console.log('📋 Quizz ID trouvé via evaluation.quizz.id:', quizzId);
        } else if ((evaluation as any).Quizz?.id) {
          quizzId = (evaluation as any).Quizz.id;
          console.log('📋 Quizz ID trouvé via evaluation.Quizz.id:', quizzId);
        } else {
          console.warn('⚠️ Aucun quizz ID trouvé dans la réponse');
          console.log('🔍 Propriétés disponibles:', Object.keys(evaluation));
          // Essayer de récupérer l'évaluation complète
          this.fetchEvaluationWithQuizz(evaluation.id);
          return;
        }
        
        this.quizzId.set(quizzId);
        this.loadQuestions();
        this.successMessage.set('Quiz sauvegardé');
        this.isLoading.set(false);
        // Passer à l'étape 2
        this.currentStep.set(2);
>>>>>>> Stashed changes
      },
      error: (error) => {
        console.error('❌ Erreur lors de la mise à jour:', error);
        this.errorMessage.set('Erreur lors de la sauvegarde');
        this.isLoading.set(false);
      }
    });
  }

  createDraftEvaluation(): void {
    this.isLoading.set(true);
    
    const evaluationData: EvaluationApiData = {
      titre: this.formData.titre,
      description: this.formData.description,
      dateDebut: new Date(this.formData.dateDebut).toISOString(),
      dateFin: new Date(this.formData.dateFin).toISOString(),
<<<<<<< Updated upstream
      coursId: this.formData.coursId, // Add required coursId
      // Le service attend snake_case pour cours_id
=======
>>>>>>> Stashed changes
      cours_id: this.formData.coursId,
      classeIds: this.formData.classeIds,
      statut: 'BROUILLON' as const
    };

    this.evaluationUseCase.createEvaluation(evaluationData as any).subscribe({
      next: (evaluation) => {
        console.log('✅ Évaluation créée avec succès:', evaluation);
<<<<<<< Updated upstream
        this.draftEvaluationId.set(evaluation.id);
        this.quizzId.set(evaluation.quizz?.id || null);
        this.successMessage.set('Évaluation créée en mode brouillon');
        this.isLoading.set(false);
        
        this.currentStep.set(2);
        this.loadQuestions();
=======
        console.log('🔍 Structure complète de l\'évaluation:', JSON.stringify(evaluation, null, 2));
        
        this.createdEvaluationId.set(evaluation.id);
        this.draftEvaluationId.set(evaluation.id);
        
        // Récupérer l'ID du quizz - maintenant mappé par le repository
        let quizzId = null;
        if ((evaluation as any).quizzId) {
          quizzId = (evaluation as any).quizzId;
          console.log('📋 Quizz ID trouvé via evaluation.quizzId:', quizzId);
        } else if (evaluation.quizz?.id) {
          quizzId = evaluation.quizz.id;
          console.log('📋 Quizz ID trouvé via evaluation.quizz.id:', quizzId);
        } else if ((evaluation as any).Quizz?.id) {
          quizzId = (evaluation as any).Quizz.id;
          console.log('📋 Quizz ID trouvé via evaluation.Quizz.id:', quizzId);
        } else {
          console.warn('⚠️ Aucun quizz ID trouvé dans la réponse');
          console.log('🔍 Propriétés disponibles:', Object.keys(evaluation));
          // Essayer de récupérer l'évaluation complète
          this.fetchEvaluationWithQuizz(evaluation.id);
          return;
        }
        
        this.quizzId.set(quizzId);
        this.loadQuestions();
        this.successMessage.set('Quiz créé en mode brouillon');
        this.isLoading.set(false);
        // Passer à l'étape 2
        this.currentStep.set(2);
>>>>>>> Stashed changes
      },
      error: (error) => {
        console.error('❌ Erreur lors de la création:', error);
        
        let errorMsg = 'Erreur lors de la création';
        
        if (error.error?.errors) {
          // Erreurs de validation Sequelize
          errorMsg = `Erreur de validation: ${error.error.errors.map((e: any) => e.message || e.msg || JSON.stringify(e)).join(', ')}`;
        } else if (error.error?.message) {
          // Message d'erreur du backend
          errorMsg = error.error.message;
        } else if (error.message) {
          // Message d'erreur générique
          errorMsg = error.message;
        }

        // Messages d'erreur spécifiques
        if (errorMsg.includes('Cours non trouvé')) {
          errorMsg = 'Le cours sélectionné n\'existe pas. Veuillez en choisir un autre.';
        } else if (errorMsg.includes('CLASSES_REQUIRED')) {
          errorMsg = 'Au moins une classe doit être sélectionnée.';
        } else if (errorMsg.includes('ADMIN_REQUIRED')) {
          errorMsg = 'Vous devez être administrateur pour créer une évaluation.';
        } else if (errorMsg.includes('USER_NOT_FOUND')) {
          errorMsg = 'Utilisateur non trouvé. Veuillez vous reconnecter.';
        }

        this.errorMessage.set(errorMsg);
        this.isLoading.set(false);
      }
    });
  }

  // Step 2 - Questions management methods
  loadQuestions(): void {
    const quizzId = this.quizzId();
    if (!quizzId) return;

    this.evaluationUseCase.getQuestionsByQuizz(quizzId).subscribe({
      next: (questions) => {
        this.questions.set(questions);
        this.checkCanPublish();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des questions:', error);
      }
    });
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

  onQuestionCreated(question: Question): void {
    const quizzId = this.quizzId();
    if (!quizzId) return;

    this.evaluationUseCase.createQuestion(quizzId, question).subscribe({
      next: (createdQuestion) => {
        const currentQuestions = this.questions();
        this.questions.set([...currentQuestions, createdQuestion]);
        this.showCreateForm.set(false);
        this.successMessage.set('Question créée avec succès');
        this.checkCanPublish();
        
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        console.error('Erreur lors de la création de la question:', error);
        this.errorMessage.set('Erreur lors de la création de la question');
      }
    });
  }

  onQuestionsImported(importedQuestions: Question[]): void {
    this.loadQuestions();
    this.showImportForm.set(false);
    this.successMessage.set(`${importedQuestions.length} question(s) importée(s) avec succès`);
    
    setTimeout(() => this.successMessage.set(''), 3000);
  }

  onFormCancelled(): void {
    this.showCreateForm.set(false);
    this.showImportForm.set(false);
    this.questionCreationMethod.set(null);
  }

  onDeleteQuestion(questionId: string | number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) {
      this.evaluationUseCase.deleteQuestion(questionId.toString()).subscribe({
        next: () => {
          const currentQuestions = this.questions();
          this.questions.set(currentQuestions.filter(q => q.id !== questionId));
          this.successMessage.set('Question supprimée avec succès');
          this.checkCanPublish();
          
          setTimeout(() => this.successMessage.set(''), 3000);
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.errorMessage.set('Erreur lors de la suppression de la question');
        }
      });
    }
  }

  // Step 3 - Review methods
  checkCanPublish(): void {
    const hasQuestions = this.questions().length > 0;
    const hasValidData = this.validateStep1();
    this.canPublish.set(hasQuestions && hasValidData);
  }

  publishEvaluation(): void {
    const evalId = this.draftEvaluationId();
    if (!evalId || !this.canPublish()) return;

    this.isLoading.set(true);
    
    const updateData = { statut: 'PUBLIEE' as const };
    
    this.evaluationUseCase.updateEvaluation(evalId.toString(), updateData as any).subscribe({
      next: (evaluation) => {
        this.successMessage.set('Évaluation publiée avec succès !');
        this.isLoading.set(false);
        
        setTimeout(() => {
          this.router.navigate(['/evaluations']);
        }, 2000);
      },
      error: (error) => {
        console.error('Erreur lors de la publication:', error);
        this.errorMessage.set('Erreur lors de la publication de l\'évaluation');
        this.isLoading.set(false);
      }
    });
  }

  saveDraft(): void {
    const evalId = this.draftEvaluationId();
    if (!evalId) return;

    const updateData = { statut: 'BROUILLON' as const };
    
    this.evaluationUseCase.updateEvaluation(evalId.toString(), updateData as any).subscribe({
      next: () => {
        this.successMessage.set('Brouillon sauvegardé');
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        console.error('Erreur lors de la sauvegarde:', error);
        this.errorMessage.set('Erreur lors de la sauvegarde');
      }
    });
  }

  cancel(): void {
    if (confirm('Êtes-vous sûr de vouloir annuler ? Les modifications seront perdues.')) {
      this.router.navigate(['/evaluations']);
    }
  }

<<<<<<< Updated upstream
  // Utility methods
  getQuestionTypeLabel(type: string | undefined): string {
    if (!type) return 'Type inconnu';
    const labels: { [key: string]: string } = {
      'CHOIX_MULTIPLE': 'Choix multiples',
      'REPONSE_OUVERTE': 'Réponse ouverte'
    };
    return labels[type] || type;
  }

<<<<<<< Updated upstream
=======
>>>>>>> Stashed changes
  selectManualCreation(): void {
    const evalId = this.createdEvaluationId();
    if (evalId) {
<<<<<<< Updated upstream
      // Navigate to manual creation interface
      this.router.navigate(['/evaluations', evalId, 'questions'], { 
=======
      // Rediriger directement vers l'éditeur de questions sans modal
      this.router.navigate(['/evaluations', evalId], { 
>>>>>>> Stashed changes
        queryParams: { mode: 'manual' } 
      });
    }
  }

<<<<<<< Updated upstream
  selectExcelImport(): void {
    this.showMethodModal.set(false);
    const evalId = this.createdEvaluationId();
    if (evalId) {
      // Navigate to Excel import interface
      this.router.navigate(['/evaluations', evalId, 'import'], { 
        queryParams: { mode: 'excel' } 
      });
    }
  }

  getCoursName(coursId: number): string {
    const cours = this.validCours().find(c => c.id === coursId);
    return cours?.nom || '';
  }

  getClassName(classeId: number): string {
    const classe = this.validClasses().find(c => c.id === classeId);
=======
  getQuestionTypeIcon(type: string | undefined): string {
    if (!type) return 'help_outline';
    const icons: { [key: string]: string } = {
      'CHOIX_MULTIPLE': 'radio_button_checked',
      'REPONSE_OUVERTE': 'edit'
    };
    return icons[type] || 'help_outline';
  }

  hasValidOptions(question: Question): boolean {
    return question.options !== undefined && Array.isArray(question.options) && question.options.length > 0;
  }

  getCharFromIndex(index: number): string {
    return String.fromCharCode(65 + index);
  }

  getCoursName(coursId: string): string {
    const cours = this.cours().find(c => c.id === coursId);
    return cours?.nom || '';
  }

  getClassName(classeId: string): string {
    const classe = this.classes().find(c => c.id === classeId);
>>>>>>> Stashed changes
=======
  getProgressPercentage(): number {
    return (this.currentStep() / 3) * 100;
  }

  getCoursName(coursId: string | number): string {
    const cours = this.cours().find(c => String(c.id) === String(coursId));
    return cours?.nom || '';
  }

  getClassName(classeId: string | number): string {
    const classe = this.classes().find(c => String(c.id) === String(classeId));
>>>>>>> Stashed changes
    return classe?.nom || '';
  }

  toggleClasse(classeId: string | number): void {
    const index = this.formData.classeIds.findIndex(id => 
      String(id) === String(classeId)
    );
    
    if (index > -1) {
      this.formData.classeIds.splice(index, 1);
    } else {
      this.formData.classeIds.push(classeId);
    }
  }

  isClasseSelected(classeId: string | number): boolean {
    return this.formData.classeIds.some(id => 
      String(id) === String(classeId)
    );
  }
<<<<<<< Updated upstream
=======

  continueEditing(): void {
    const evalId = this.createdEvaluationId();
    if (evalId) {
      this.router.navigate(['/evaluations', evalId], { 
        queryParams: { mode: 'edit' } 
      });
    }
  }

  previewQuiz(): void {
    const evalId = this.createdEvaluationId();
    if (evalId) {
      this.router.navigate(['/evaluations', evalId], { 
        queryParams: { mode: 'preview' } 
      });
    }
  }

  publishQuiz(): void {
    const evalId = this.createdEvaluationId();
    if (!evalId) {
      this.errorMessage.set('Aucune évaluation à publier');
      return;
    }

    this.isLoading.set(true);

    // Mettre à jour le statut à PUBLIE
    const publishData = {
      statut: 'PUBLIE' as const
    };

    this.evaluationUseCase.updateEvaluation(evalId.toString(), publishData as any).subscribe({
      next: (evaluation) => {
        console.log('✅ Quiz publié:', evaluation);
        this.successMessage.set('Quiz publié avec succès !');
        this.isLoading.set(false);
        
        // Rediriger vers la liste des évaluations après 2 secondes
        setTimeout(() => {
          this.router.navigate(['/evaluations']);
        }, 2000);
      },
      error: (error) => {
        console.error('❌ Erreur lors de la publication:', error);
        this.errorMessage.set('Erreur lors de la publication');
        this.isLoading.set(false);
      }
    });
  }

  // Méthodes pour la gestion des questions
  fetchEvaluationWithQuizz(evaluationId: string | number): void {
    console.log('🔄 Récupération de l\'évaluation complète avec quizz...');
    this.evaluationUseCase.getEvaluation(evaluationId).subscribe({
      next: (evaluation) => {
        console.log('✅ Évaluation complète récupérée:', evaluation);
        console.log('🔍 Structure complète:', JSON.stringify(evaluation, null, 2));
        
        let quizzId = null;
        if (evaluation.quizz?.id) {
          quizzId = evaluation.quizz.id;
          console.log('📋 Quizz ID trouvé via evaluation.quizz.id:', quizzId);
        } else if ((evaluation as any).Quizz?.id) {
          quizzId = (evaluation as any).Quizz.id;
          console.log('📋 Quizz ID trouvé via evaluation.Quizz.id:', quizzId);
        } else {
          console.error('❌ Impossible de trouver l\'ID du quizz même après récupération complète');
          this.errorMessage.set('Erreur: Impossible de récupérer l\'ID du quizz');
          this.isLoading.set(false);
          return;
        }
        
        this.quizzId.set(quizzId);
        this.loadQuestions();
        this.successMessage.set('Quiz créé en mode brouillon');
        this.isLoading.set(false);
        // Passer à l'étape 2
        this.currentStep.set(2);
      },
      error: (error) => {
        console.error('❌ Erreur lors de la récupération de l\'évaluation complète:', error);
        this.errorMessage.set('Erreur lors de la récupération des détails du quiz');
        this.isLoading.set(false);
      }
    });
  }

  loadQuestions(): void {
    const evalId = this.draftEvaluationId();
    if (!evalId) return;

    this.evaluationUseCase.getEvaluation(evalId).subscribe({
      next: (evaluation) => {
        if (evaluation.quizz?.questions) {
          this.questions.set(evaluation.quizz.questions);
        } else if ((evaluation as any).Quizz?.Questions) {
          this.questions.set((evaluation as any).Quizz.Questions);
        }
        console.log('📋 Questions chargées:', this.questions());
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des questions:', error);
      }
    });
  }

  addQuestion(): void {
    if (!this.quizzId()) {
      console.error('❌ Impossible d\'ajouter une question : quizzId est null');
      this.errorMessage.set('Erreur: Impossible d\'ajouter une question. L\'ID du quiz n\'est pas disponible.');
      
      // Essayer de récupérer l'évaluation complète
      const evalId = this.draftEvaluationId();
      if (evalId) {
        console.log('🔄 Tentative de récupération de l\'ID du quizz...');
        this.fetchEvaluationWithQuizz(evalId);
      }
      return;
    }
    
    this.editingQuestion.set(null);
    this.showQuestionForm.set(true);
  }

  editQuestion(question: Question): void {
    this.editingQuestion.set(question);
    this.showQuestionForm.set(true);
  }

  onQuestionSaved(question: Question): void {
    this.showQuestionForm.set(false);
    this.editingQuestion.set(null);
    this.loadQuestions(); // Recharger la liste des questions
    this.successMessage.set('Question sauvegardée avec succès');
    setTimeout(() => this.successMessage.set(''), 3000);
  }

  onQuestionCancelled(): void {
    this.showQuestionForm.set(false);
    this.editingQuestion.set(null);
  }

  deleteQuestion(question: Question): void {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer cette question ?`)) {
      return;
    }

    this.evaluationUseCase.deleteQuestion(question.id).subscribe({
      next: () => {
        this.loadQuestions();
        this.successMessage.set('Question supprimée avec succès');
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        console.error('❌ Erreur lors de la suppression:', error);
        this.errorMessage.set('Erreur lors de la suppression de la question');
        setTimeout(() => this.errorMessage.set(''), 5000);
      }
    });
  }

  getQuestionTypeLabel(type: string): string {
    switch (type) {
      case 'CHOIX_MULTIPLE': return 'QCM';
      case 'REPONSE_OUVERTE': return 'Réponse ouverte';
      default: return type;
    }
  }

  getQuestionType(question: Question): string {
    return question.type || (question as any).typeQuestion || 'INCONNU';
  }

  // Expose String for template
  String = String;
>>>>>>> Stashed changes
}