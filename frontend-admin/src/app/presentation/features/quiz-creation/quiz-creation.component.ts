import { Component, OnInit, OnDestroy, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AcademicService } from '../../../core/services/academic.service';
import { ModalService } from '../../../core/services/modal.service';
import { ToastService } from '../../../core/services/toast.service';
import { ExcelImportModalComponent } from './components/excel-import-modal/excel-import-modal.component';
import { CreationMethodModalComponent, CreationMethod } from './components/creation-method-modal/creation-method-modal.component';

// Clean Architecture - Use Cases
import { CreateQuizUseCase } from '../../../core/application/use-cases/quiz/create-quiz.use-case';
import { UpdateQuizUseCase } from '../../../core/application/use-cases/quiz/update-quiz.use-case';
import { GetQuizByIdUseCase } from '../../../core/application/use-cases/quiz/get-quiz-by-id.use-case';
import { Quiz, Question, QuestionOption, QuestionType } from '../../../core/domain/entities/quiz.entity';

interface LocalQuestion {
  id: string;
  type: 'multiple_choice' | 'short_answer';
  text: string;
  options?: LocalQuestionOption[];
  correctAnswer?: number | string;
  order: number;
}

interface LocalQuestionOption {
  text: string;
  isCorrect: boolean;
}

@Component({
  selector: 'app-quiz-creation',
  standalone: true,
  imports: [CommonModule, FormsModule, ExcelImportModalComponent, CreationMethodModalComponent],
  templateUrl: './quiz-creation.component.html',
  styleUrls: ['./quiz-creation.component.scss']
})
export class QuizCreationComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private createQuizUseCase = inject(CreateQuizUseCase);
  private updateQuizUseCase = inject(UpdateQuizUseCase);
  private getQuizByIdUseCase = inject(GetQuizByIdUseCase);
  private academicService = inject(AcademicService);
  private modalService = inject(ModalService);
  private toastService = inject(ToastService);

  // Mode édition
  isEditMode = signal(false);
  editingQuizId = signal<string | null>(null);

  // Quiz data
  quizTitle = signal('');
  quizDescription = signal('');
  selectedAcademicYear = signal('');
  selectedSubject = signal('');
  selectedSemester = signal('');
  selectedClasses = signal<string[]>([]);
  
  // Questions
  questions = signal<LocalQuestion[]>([]);
  currentStep = signal<'info' | 'questions' | 'preview'>('info');
  
  // Current question being edited
  questionText = signal('');
  questionType = signal<'multiple_choice' | 'short_answer'>('multiple_choice');
  questionOptions = signal<LocalQuestionOption[]>([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false }
  ]);

  // Data
  academicYears = signal<any[]>([]);
  subjects = signal<any[]>([]);
  classes = signal<any[]>([]);
  semesters = signal<any[]>([
    { id: 'semester-1', name: 'Semestre 1' },
    { id: 'semester-2', name: 'Semestre 2' }
  ]);
  isLoading = signal(false);
  isSaving = signal(false);

  // Auto-save
  private autoSaveTimer: any = null;
  private draftQuizId = signal<string | null>(null);
  private hasUnsavedChanges = signal(false);

  // Modals
  showCreationMethodModal = signal(false);
  showExcelImportModal = signal(false);

  constructor() {
    // Effet pour détecter les changements et déclencher l'auto-save
    effect(() => {
      // Observer les changements dans les données du quiz
      const title = this.quizTitle();
      const subject = this.selectedSubject();
      const year = this.selectedAcademicYear();
      const questionsCount = this.questions().length;

      // Si on a des données minimales, marquer comme ayant des changements non sauvegardés
      if (title || subject || year || questionsCount > 0) {
        this.hasUnsavedChanges.set(true);
        this.scheduleAutoSave();
      }
    });
  }

  questionTypes = [
    { value: 'multiple_choice', label: 'Choix Multiple (QCM)' },
    { value: 'short_answer', label: 'Réponse Courte (QRO)' }
  ];

  ngOnInit(): void {
    console.log('QuizCreationComponent initialized');
    
    // Vérifier si on est en mode édition
    const quizId = this.route.snapshot.params['id'];
    if (quizId) {
      this.isEditMode.set(true);
      this.editingQuizId.set(quizId);
      this.loadQuizForEdit(quizId);
    } else {
      this.loadAcademicYears();
      this.loadSubjects();
      this.loadCurrentAcademicYear();
      
      // Vérifier si des questions ont été importées via le state du router
      const state = window.history.state;
      if (state?.importedQuestions) {
        this.handleImportedQuestions(state.importedQuestions);
      } else {
        // Afficher le modal de sélection de méthode au démarrage
        this.showCreationMethodModal.set(true);
      }
    }
  }

  /**
   * Gère les questions importées depuis Excel
   */
  private handleImportedQuestions(importedQuestions: any[]): void {
    const localQuestions: LocalQuestion[] = importedQuestions.map((q, index) => ({
      id: `imported-${Date.now()}-${index}`,
      type: q.type === 'multiple' ? 'multiple_choice' : 'short_answer',
      text: q.question,
      order: index + 1,
      options: q.type === 'multiple' || q.type === 'close' ? [
        { text: q.option1 || '', isCorrect: false },
        { text: q.option2 || '', isCorrect: false },
        { text: q.option3 || '', isCorrect: false },
        { text: q.option4 || '', isCorrect: false }
      ].filter(opt => opt.text.trim() !== '') : undefined
    }));

    this.questions.set(localQuestions);
    
    // Passer directement à l'étape des questions
    this.currentStep.set('questions');
    
    this.toastService.success(`${localQuestions.length} question(s) importée(s) avec succès`);
  }

  /**
   * Charge un quiz existant pour l'édition
   */
  private loadQuizForEdit(id: string): void {
    this.isLoading.set(true);
    this.getQuizByIdUseCase.execute(id).subscribe({
      next: (quiz) => {
        console.log('Quiz chargé:', quiz);
        console.log('Nombre de questions:', quiz.questions.length);
        
        // Pré-remplir le formulaire avec les données du quiz
        this.quizTitle.set(quiz.title);
        this.quizDescription.set(quiz.description || '');
        this.selectedSubject.set(quiz.subject);
        this.selectedAcademicYear.set(quiz.academicYearId || '');
        this.selectedSemester.set(quiz.semesterId || '');
        this.selectedClasses.set(quiz.classIds || []);
        
        // Charger les questions
        const localQuestions: LocalQuestion[] = quiz.questions.map((q, index) => {
          // Déterminer le type local
          let localType: 'multiple_choice' | 'short_answer';
          if (q.type === 'QCM' || q.type === 'closed') {
            localType = 'multiple_choice';
          } else {
            localType = 'short_answer';
          }

          return {
            id: q.id,
            type: localType,
            text: q.text,
            order: index + 1,
            options: q.options && q.options.length > 0 ? q.options.map(opt => ({
              text: opt.text,
              isCorrect: opt.isCorrect
            })) : undefined
          };
        });
        
        console.log('Questions converties:', localQuestions);
        this.questions.set(localQuestions);
        
        // Charger les données nécessaires
        this.loadAcademicYears();
        this.loadSubjects();
        this.isLoading.set(false);
        
        this.toastService.info(`Quiz chargé avec ${localQuestions.length} question(s)`);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.toastService.error('Impossible de charger le quiz');
        console.error('Error loading quiz:', err);
        this.router.navigate(['/quiz-management']);
      }
    });
  }

  /**
   * Charge l'année académique en cours et la pré-sélectionne
   */
  loadCurrentAcademicYear(): void {
    this.academicService.getCurrentAcademicYear().subscribe({
      next: (currentYear) => {
        if (currentYear) {
          this.selectedAcademicYear.set(currentYear.id);
          // Charger les matières et classes pour l'année en cours
          this.onAcademicYearChange();
        }
      },
      error: (err) => console.error('Error loading current academic year:', err)
    });
  }

  ngOnDestroy(): void {
    // Nettoyer le timer d'auto-save
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }
  }

  /**
   * Planifie un auto-save après 3 secondes d'inactivité
   */
  private scheduleAutoSave(): void {
    // Annuler le timer précédent
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }

    // Planifier un nouveau save après 3 secondes
    this.autoSaveTimer = setTimeout(() => {
      this.performAutoSave();
    }, 3000);
  }

  /**
   * Effectue l'auto-save du brouillon
   */
  private performAutoSave(): void {
    // Ne pas auto-sauvegarder si on n'a pas au minimum un titre
    if (!this.quizTitle() || !this.hasUnsavedChanges()) {
      return;
    }

    // Convertir les questions locales en questions du domaine
    const domainQuestions = this.convertLocalQuestionsToQuestions();

    const draftId = this.draftQuizId() || this.editingQuizId();

    if (draftId) {
      // Mettre à jour le brouillon existant
      this.updateQuizUseCase.execute({
        id: draftId,
        title: this.quizTitle(),
        description: this.quizDescription(),
        subject: this.selectedSubject() || 'Non défini',
        questions: domainQuestions,
        classIds: ['class-1'] // TODO: Gérer les classes
      }).subscribe({
        next: () => {
          this.hasUnsavedChanges.set(false);
          console.log('Auto-save: brouillon mis à jour avec', domainQuestions.length, 'questions');
        },
        error: (err) => {
          console.error('Erreur lors de l\'auto-save:', err);
        }
      });
    } else {
      // Créer un nouveau brouillon
      const quiz = new Quiz(
        `quiz-${Date.now()}`,
        this.quizTitle(),
        this.selectedSubject() || 'Non défini',
        'draft',
        domainQuestions,
        this.selectedClasses().length > 0 ? this.selectedClasses() : ['class-1'],
        new Date(),
        undefined,
        'Évaluation',
        this.quizDescription(),
        this.selectedSemester(),
        this.selectedAcademicYear()
      );

      this.createQuizUseCase.execute(quiz).subscribe({
        next: (createdQuiz) => {
          this.draftQuizId.set(createdQuiz.id);
          this.hasUnsavedChanges.set(false);
          console.log('Auto-save: nouveau brouillon créé', createdQuiz.id, 'avec', domainQuestions.length, 'questions');
        },
        error: (err) => {
          console.error('Erreur lors de l\'auto-save:', err);
        }
      });
    }
  }

  loadAcademicYears(): void {
    console.log('Loading academic years...');
    this.isLoading.set(true);
    this.academicService.getAcademicYears().subscribe({
      next: (years) => {
        console.log('Academic years loaded:', years);
        this.academicYears.set(years);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading academic years:', err);
        this.isLoading.set(false);
      }
    });
  }

  loadSubjects(): void {
    console.log('Loading subjects...');
    this.academicService.getSubjects().subscribe({
      next: (subjects) => {
        console.log('Subjects loaded:', subjects);
        this.subjects.set(subjects);
      },
      error: (err) => console.error('Error loading subjects:', err)
    });
  }

  onAcademicYearChange(): void {
    const yearId = this.selectedAcademicYear();
    console.log('Academic year changed:', yearId);
    if (yearId) {
      // Charger les matières
      this.academicService.getSubjects(yearId).subscribe({
        next: (subjects) => {
          console.log('Subjects for year loaded:', subjects);
          this.subjects.set(subjects);
        },
        error: (err) => console.error('Error loading subjects:', err)
      });
      
      // Charger les classes
      this.academicService.getClassesByYear(yearId).subscribe({
        next: (classes) => {
          console.log('Classes for year loaded:', classes);
          this.classes.set(classes);
        },
        error: (err) => console.error('Error loading classes:', err)
      });
    }
  }

  addQuestion(): void {
    if (!this.questionText()) {
      this.modalService.alert('Erreur', 'Veuillez saisir le texte de la question');
      return;
    }

    const question: LocalQuestion = {
      id: Date.now().toString(),
      type: this.questionType(),
      text: this.questionText(),
      order: this.questions().length + 1,
      options: this.questionType() === 'multiple_choice' 
        ? this.questionOptions().filter(o => o.text.trim() !== '')
        : undefined
    };

    this.questions.update(q => [...q, question]);
    this.resetCurrentQuestion();
  }

  removeQuestion(index: number): void {
    this.questions.update(q => q.filter((_, i) => i !== index));
  }

  resetCurrentQuestion(): void {
    this.questionText.set('');
    this.questionType.set('multiple_choice');
    this.questionOptions.set([
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ]);
  }

  nextStep(): void {
    if (this.currentStep() === 'info') {
      if (!this.quizTitle() || !this.selectedSubject() || !this.selectedSemester() || this.selectedClasses().length === 0) {
        this.modalService.alert('Erreur', 'Veuillez remplir tous les champs obligatoires (titre, matière, semestre et au moins une classe)');
        return;
      }
      this.currentStep.set('questions');
    } else if (this.currentStep() === 'questions') {
      if (this.questions().length === 0) {
        this.modalService.alert('Erreur', 'Veuillez ajouter au moins une question');
        return;
      }
      this.currentStep.set('preview');
    }
  }

  previousStep(): void {
    if (this.currentStep() === 'questions') {
      this.currentStep.set('info');
    } else if (this.currentStep() === 'preview') {
      this.currentStep.set('questions');
    }
  }

  async saveAsDraft(): Promise<void> {
    // Forcer la sauvegarde immédiate du brouillon
    this.hasUnsavedChanges.set(true);
    this.performAutoSave();
    
    // Afficher un message de confirmation
    this.toastService.success('Quiz enregistré comme brouillon');
    
    // Naviguer vers la liste des quiz après un court délai
    setTimeout(() => {
      this.router.navigate(['/quiz-management']);
    }, 1000);
  }

  async publishQuiz(): Promise<void> {
    const confirmed = await this.modalService.confirm(
      'Publier le quiz',
      'Êtes-vous sûr de vouloir publier ce quiz ? Il sera visible par les étudiants.'
    );
    
    if (confirmed) {
      await this.saveQuiz('active');
    }
  }

  private async saveQuiz(status: 'draft' | 'active'): Promise<void> {
    this.isSaving.set(true);

    // Convertir les LocalQuestion en Question
    const domainQuestions = this.convertLocalQuestionsToQuestions();

    const draftId = this.draftQuizId() || this.editingQuizId();

    if (draftId) {
      // Mettre à jour le quiz existant
      const quiz = new Quiz(
        draftId,
        this.quizTitle(),
        this.selectedSubject(),
        status,
        domainQuestions,
        this.selectedClasses(),
        new Date(),
        undefined,
        'Évaluation',
        this.quizDescription(),
        this.selectedSemester(),
        this.selectedAcademicYear()
      );

      this.updateQuizUseCase.execute({
        id: draftId,
        title: quiz.title,
        description: quiz.description,
        subject: quiz.subject,
        status: status,
        questions: domainQuestions,
        classIds: quiz.classIds,
        semesterId: quiz.semesterId,
        academicYearId: quiz.academicYearId
      }).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.hasUnsavedChanges.set(false);
          const message = status === 'active' 
            ? 'Quiz publié avec succès !' 
            : 'Quiz mis à jour avec succès';
          
          this.toastService.success(message);
          
          setTimeout(() => {
            this.router.navigate(['/quiz-management']);
          }, 1500);
        },
        error: (err) => {
          this.isSaving.set(false);
          this.toastService.error('Impossible de sauvegarder le quiz');
          console.error('Error saving quiz:', err);
        }
      });
    } else {
      // Créer un nouveau quiz
      const quiz = new Quiz(
        `quiz-${Date.now()}`,
        this.quizTitle(),
        this.selectedSubject(),
        status,
        domainQuestions,
        this.selectedClasses(),
        new Date(),
        undefined,
        'Évaluation',
        this.quizDescription(),
        this.selectedSemester(),
        this.selectedAcademicYear()
      );

      this.createQuizUseCase.execute(quiz).subscribe({
        next: (createdQuiz) => {
          this.draftQuizId.set(createdQuiz.id);
          this.isSaving.set(false);
          this.hasUnsavedChanges.set(false);
          const message = status === 'active' 
            ? 'Quiz publié avec succès !' 
            : 'Quiz enregistré comme brouillon';
          
          this.toastService.success(message);
          
          setTimeout(() => {
            this.router.navigate(['/quiz-management']);
          }, 1500);
        },
        error: (err) => {
          this.isSaving.set(false);
          this.toastService.error('Impossible de sauvegarder le quiz');
          console.error('Error saving quiz:', err);
        }
      });
    }
  }

  /**
   * Convertit les LocalQuestion en Question (entité du domaine)
   */
  private convertLocalQuestionsToQuestions(): Question[] {
    return this.questions().map(localQ => {
      // Convertir les options locales en QuestionOption
      const options = (localQ.options || []).map((opt, index) => 
        new QuestionOption(
          `opt-${localQ.id}-${index}`,
          opt.text,
          opt.isCorrect
        )
      );

      // Déterminer le type de question
      let questionType: QuestionType;
      if (localQ.type === 'multiple_choice') {
        questionType = 'QCM';
      } else if (localQ.type === 'short_answer') {
        questionType = 'open';
      } else {
        questionType = 'open';
      }

      // Créer la question du domaine
      return new Question(
        localQ.id,
        localQ.text,
        questionType,
        1, // Points par défaut
        options,
        undefined, // correctAnswer sera défini plus tard
        undefined  // explanation
      );
    });
  }

  async cancel(): Promise<void> {
    // Si on a des changements non sauvegardés, demander confirmation
    if (this.hasUnsavedChanges()) {
      const confirmed = await this.modalService.confirm(
        'Quitter sans sauvegarder ?',
        'Voulez-vous enregistrer ce quiz comme brouillon avant de quitter ?'
      );
      
      if (confirmed) {
        // Sauvegarder comme brouillon avant de quitter
        this.performAutoSave();
        // Attendre un peu pour que la sauvegarde se termine
        setTimeout(() => {
          this.router.navigate(['/quiz-management']);
        }, 500);
      } else {
        this.router.navigate(['/quiz-management']);
      }
    } else {
      this.router.navigate(['/quiz-management']);
    }
  }

  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index); // A, B, C, D...
  }

  /**
   * Retourne le nom de l'année académique sélectionnée
   */
  getSelectedAcademicYearName(): string {
    const selectedId = this.selectedAcademicYear();
    if (!selectedId) {
      // Si pas d'ID, chercher l'année active
      const activeYear = this.academicYears().find((y: any) => y.isActive);
      return activeYear ? activeYear.name : '2025-2026';
    }
    const year = this.academicYears().find((y: any) => y.id === selectedId);
    return year ? year.name : '2025-2026';
  }

  /**
   * Gère la sélection de la méthode de création
   */
  onCreationMethodSelected(method: CreationMethod): void {
    this.showCreationMethodModal.set(false);
    
    if (method === 'excel') {
      // Ouvrir directement le modal d'import Excel
      this.showExcelImportModal.set(true);
    } else {
      // Continuer avec la création manuelle (ne rien faire, l'utilisateur est déjà sur le formulaire)
      this.toastService.info('Remplissez les informations du quiz');
    }
  }

  /**
   * Ferme le modal de sélection de méthode
   */
  closeCreationMethodModal(): void {
    this.showCreationMethodModal.set(false);
  }

  /**
   * Ouvre le modal d'import Excel
   */
  openExcelImport(): void {
    this.showExcelImportModal.set(true);
  }

  /**
   * Ferme le modal d'import Excel
   */
  closeExcelImport(): void {
    this.showExcelImportModal.set(false);
  }

  /**
   * Importe les questions depuis Excel
   */
  onExcelImport(parsedQuestions: any[]): void {
    const importedQuestions: LocalQuestion[] = parsedQuestions.map((q, index) => ({
      id: `imported-${Date.now()}-${index}`,
      type: q.type === 'multiple' ? 'multiple_choice' : 'short_answer',
      text: q.question,
      order: this.questions().length + index + 1,
      options: q.type === 'multiple' || q.type === 'close' ? [
        { text: q.option1 || '', isCorrect: false },
        { text: q.option2 || '', isCorrect: false },
        { text: q.option3 || '', isCorrect: false },
        { text: q.option4 || '', isCorrect: false }
      ].filter(opt => opt.text.trim() !== '') : undefined
    }));

    this.questions.update(q => [...q, ...importedQuestions]);
    this.showExcelImportModal.set(false);
    this.toastService.success(`${importedQuestions.length} question(s) importée(s) avec succès`);
  }
}
