import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EvaluationUseCase } from '../../../core/usecases/evaluation.usecase';
import { AcademicUseCase } from '../../../core/usecases/academic.usecase';
import { Cours, Classe } from '../../../core/domain/entities/academic.entity';
import { EvaluationApiData } from '../../../core/domain/entities/evaluation.entity';

@Component({
  selector: 'app-evaluation-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './evaluation-create.component.html',
  styleUrls: ['./evaluation-create.component.scss']
})
export class EvaluationCreateComponent implements OnInit, OnDestroy {
  // Step management
  currentStep = signal(1);
  
  // Data
  cours = signal<Cours[]>([]);
  allCours = signal<Cours[]>([]); // Tous les cours
  filteredCours = signal<Cours[]>([]); // Cours filtrés par classe
  classes = signal<Classe[]>([]);
  isLoading = signal(false);
  
  // Draft management
  draftEvaluationId = signal<string | number | null>(null);
  autoSaveEnabled = signal(true);
  lastSaved = signal<Date | null>(null);
  
  // Form data
  formData = {
    titre: '',
    description: '',
    dateDebut: '',
    dateFin: '',
    coursId: null as number | null,
    classeIds: [] as (number | string)[]
  };

  // Modal
  showMethodModal = signal(false);
  createdEvaluationId = signal<string | number | null>(null);

  errorMessage = signal('');
  successMessage = signal('');

  // Step 3: Review & Publish
  publishMode = signal<'now' | 'schedule' | 'draft'>('now');
  scheduledDate = signal('');
  showSuccessModal = signal(false);

  // Step 2: Questions
  questionMode = signal<'manual' | 'import' | null>(null);
  selectedMode = signal<'manual' | 'import' | null>(null);
  
  // Import
  importFormat = signal<'csv' | 'json' | 'excel'>('excel');
  uploadedFile = signal<File | null>(null);
  isDragging = signal(false);
  detectedQuestions = signal(0);
  showFormatExample = signal(false);
  isProcessing = signal(false);
  
  // Manual creation
  questions = signal<any[]>([]);
  questionFilter = signal<'all' | 'CHOIX_MULTIPLE' | 'REPONSE_OUVERTE'>('all');
  expandedQuestion = signal<number | null>(null);
  showAddQuestionModal = signal(false);
  editingQuestion = signal<any | null>(null);
  
  newQuestion: any = {
    typeQuestion: 'CHOIX_MULTIPLE',
    enonce: '',
    ordre: 1,
    options: ['', ''],
    reponseCorrecteIndex: 0
  };

  private autoSaveInterval: any;

  constructor(
    private evaluationUseCase: EvaluationUseCase,
    private academicUseCase: AcademicUseCase,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCours();
    this.loadClasses();
    this.initializeAutoSave();
    
    // Données de test pour visualiser l'étape 3 (à supprimer en production)
    this.addTestData();
  }

  addTestData(): void {
    // Remplir le formulaire avec des données de test
    this.formData.titre = 'Examen Final de Mathématiques - Algèbre';
    this.formData.description = 'Évaluation portant sur les chapitres 1 à 5 du programme d\'algèbre.';
    this.formData.dateDebut = new Date().toISOString().slice(0, 16);
    this.formData.dateFin = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
    
    // Ajouter des questions de test
    this.questions.set([
      {
        id: 1,
        typeQuestion: 'CHOIX_MULTIPLE',
        enonce: 'Quelle est la solution de l\'équation 2x + 5 = 13 ?',
        ordre: 1,
        points: 2,
        options: ['x = 3', 'x = 4', 'x = 5', 'x = 6'],
        reponseCorrecteIndex: 1
      },
      {
        id: 2,
        typeQuestion: 'CHOIX_MULTIPLE',
        enonce: 'Quel est le résultat de (a + b)² ?',
        ordre: 2,
        points: 3,
        options: ['a² + b²', 'a² + 2ab + b²', 'a² - b²', '2a + 2b'],
        reponseCorrecteIndex: 1
      },
      {
        id: 3,
        typeQuestion: 'REPONSE_OUVERTE',
        enonce: 'Démontrez le théorème de Pythagore en utilisant une figure géométrique.',
        ordre: 3,
        points: 5,
        options: []
      },
      {
        id: 4,
        typeQuestion: 'CHOIX_MULTIPLE',
        enonce: 'Quelle est la forme factorisée de x² - 9 ?',
        ordre: 4,
        points: 2,
        options: ['(x - 3)(x - 3)', '(x + 3)(x + 3)', '(x - 3)(x + 3)', 'x(x - 9)'],
        reponseCorrecteIndex: 2
      },
      {
        id: 5,
        typeQuestion: 'REPONSE_OUVERTE',
        enonce: 'Résolvez le système d\'équations : 2x + y = 7 et x - y = 2',
        ordre: 5,
        points: 4,
        options: []
      },
      {
        id: 6,
        typeQuestion: 'CHOIX_MULTIPLE',
        enonce: 'Quelle est la valeur de √64 ?',
        ordre: 6,
        points: 1,
        options: ['6', '7', '8', '9'],
        reponseCorrecteIndex: 2
      }
    ]);
  }

  ngOnDestroy(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
  }

  initializeAutoSave(): void {
    // Sauvegarde automatique toutes les 30 secondes
    this.autoSaveInterval = setInterval(() => {
      if (this.autoSaveEnabled() && this.hasMinimalData()) {
        this.saveDraft();
      }
    }, 30000);
  }

  hasMinimalData(): boolean {
    // Pour la sauvegarde automatique, on a besoin au minimum d'un titre, d'un cours et d'une classe
    return this.formData.titre.trim().length > 0 && 
           this.formData.coursId !== null && 
           this.formData.coursId !== 0 &&
           this.formData.classeIds.length > 0;
  }

  saveDraft(): void {
    if (!this.hasMinimalData()) return;

    const draftData: EvaluationApiData = {
      titre: this.formData.titre || 'Brouillon sans titre',
      description: this.formData.description,
      dateDebut: this.formData.dateDebut ? new Date(this.formData.dateDebut).toISOString() : new Date().toISOString(),
      dateFin: this.formData.dateFin ? new Date(this.formData.dateFin).toISOString() : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      cours_id: this.formData.coursId || undefined,
      classeIds: this.formData.classeIds.length > 0 ? this.formData.classeIds : [1], // Classe par défaut
      statut: 'BROUILLON' as const
    };

    if (this.draftEvaluationId()) {
      // Mettre à jour le brouillon existant
      this.updateDraft(draftData);
    } else {
      // Créer un nouveau brouillon
      this.createDraft(draftData);
    }
  }

  createDraft(draftData: EvaluationApiData): void {
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

  updateDraft(draftData: EvaluationApiData): void {
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
    // Déclencher une sauvegarde après 3 secondes d'inactivité
    if (this.autoSaveEnabled() && this.hasMinimalData()) {
      setTimeout(() => {
        this.saveDraft();
      }, 3000);
    }
  }

  loadCours(): void {
    this.academicUseCase.getCours().subscribe({
      next: (cours) => {
        // Filtrer les cours archivés
        const coursActifs = cours.filter(c => !c.estArchive);
        this.allCours.set(coursActifs);
        this.cours.set(coursActifs);
        this.filteredCours.set(coursActifs);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des cours:', error);
      }
    });
  }

  loadClasses(): void {
    this.academicUseCase.getClasses().subscribe({
      next: (classes) => {
        // Filtrer les classes archivées
        const classesActives = classes.filter(c => !c.estArchive);
        console.log('📚 Classes actives chargées:', classesActives);
        console.log('📚 Types des IDs:', classesActives.map(c => ({ nom: c.nom, id: c.id, type: typeof c.id })));
        this.classes.set(classesActives);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des classes:', error);
      }
    });
  }

  /**
   * Filtre les cours en fonction des classes sélectionnées
   */
  filterCoursByClasses(): void {
    if (this.formData.classeIds.length === 0) {
      // Si aucune classe n'est sélectionnée, afficher tous les cours
      this.filteredCours.set(this.allCours());
      return;
    }

    // Récupérer les classes sélectionnées avec leurs cours
    const selectedClasses = this.classes().filter(c => 
      this.formData.classeIds.some(id => String(id) === String(c.id))
    );

    // Extraire tous les cours des classes sélectionnées
    const coursIds = new Set<string | number>();
    selectedClasses.forEach(classe => {
      if (classe.cours && classe.cours.length > 0) {
        classe.cours.forEach(cours => {
          coursIds.add(String(cours.id));
        });
      }
    });

    // Si aucun cours n'est associé aux classes, afficher tous les cours
    if (coursIds.size === 0) {
      console.warn('⚠️ Aucun cours associé aux classes sélectionnées, affichage de tous les cours');
      this.filteredCours.set(this.allCours());
      return;
    }

    // Filtrer les cours
    const filtered = this.allCours().filter(c => 
      coursIds.has(String(c.id))
    );

    console.log('📚 Cours filtrés:', filtered.map(c => c.nom));
    this.filteredCours.set(filtered);

    // Si le cours actuellement sélectionné n'est plus dans la liste filtrée, le désélectionner
    if (this.formData.coursId && !filtered.some(c => String(c.id) === String(this.formData.coursId))) {
      console.log('⚠️ Le cours sélectionné n\'est pas disponible pour les classes choisies');
      this.formData.coursId = null;
    }
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
    if (!this.formData.coursId || this.formData.coursId === 0) {
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
      
      // Passer directement à l'étape 2 (choix du mode)
      this.currentStep.set(2);
      this.questionMode.set(null);
      this.selectedMode.set(null);
    } else if (this.currentStep() === 2) {
      // Passer à l'étape 3 (révision)
      if (this.questions().length === 0) {
        this.errorMessage.set('Veuillez ajouter au moins une question');
        return;
      }
      this.currentStep.set(3);
    }
  }

  updateDraftAndProceed(): void {
    this.isLoading.set(true);
    
    const evaluationData: EvaluationApiData = {
      titre: this.formData.titre,
      description: this.formData.description,
      dateDebut: new Date(this.formData.dateDebut).toISOString(),
      dateFin: new Date(this.formData.dateFin).toISOString(),
      cours_id: this.formData.coursId ?? undefined,
      classeIds: this.formData.classeIds,
      statut: 'BROUILLON' as const
    };

    const draftId = this.draftEvaluationId();
    if (!draftId) return;

    this.evaluationUseCase.updateEvaluation(draftId.toString(), evaluationData as any).subscribe({
      next: (evaluation) => {
        console.log('✅ Brouillon mis à jour:', evaluation);
        this.createdEvaluationId.set(evaluation.id);
        this.successMessage.set('Évaluation sauvegardée');
        this.isLoading.set(false);
        this.showMethodModal.set(true);
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
    
    console.log('📝 Création d\'évaluation - Données du formulaire:', this.formData);
    
    const evaluationData: EvaluationApiData = {
      titre: this.formData.titre,
      description: this.formData.description,
      // Le modèle Sequelize attend camelCase
      dateDebut: new Date(this.formData.dateDebut).toISOString(),
      dateFin: new Date(this.formData.dateFin).toISOString(),
      // Le service attend snake_case pour cours_id
      cours_id: this.formData.coursId ?? undefined,
      classeIds: this.formData.classeIds,
      statut: 'BROUILLON' as const
    };

    console.log('📤 Envoi au backend:', evaluationData);

    this.evaluationUseCase.createEvaluation(evaluationData as any).subscribe({
      next: (evaluation) => {
        console.log('✅ Évaluation créée avec succès:', evaluation);
        this.createdEvaluationId.set(evaluation.id);
        this.successMessage.set('Évaluation créée en mode brouillon');
        this.isLoading.set(false);
        this.showMethodModal.set(true);
      },
      error: (error) => {
        console.error('❌ Erreur lors de la création:', error);
        const errorMsg = error.error?.errors 
          ? `Erreur de validation: ${error.error.errors.map((e: any) => e.message || e.msg || JSON.stringify(e)).join(', ')}`
          : error.error?.message || 'Erreur lors de la création';
        this.errorMessage.set(errorMsg);
        this.isLoading.set(false);
      }
    });
  }

  previousStep(): void {
    if (this.currentStep() > 1) {
      if (this.currentStep() === 2 && this.questionMode()) {
        // Si on est dans un mode de question, revenir au choix du mode
        this.backToModeSelection();
      } else {
        // Sinon, revenir à l'étape précédente
        this.currentStep.set(this.currentStep() - 1);
      }
    }
  }

  cancel(): void {
    if (confirm('Êtes-vous sûr de vouloir annuler ? Les modifications seront perdues.')) {
      this.router.navigate(['/evaluations']);
    }
  }

  closeMethodModal(): void {
    this.showMethodModal.set(false);
  }

  selectManualCreation(): void {
    this.showMethodModal.set(false);
    const evalId = this.createdEvaluationId();
    if (evalId) {
      this.router.navigate(['/evaluations', evalId], { 
        queryParams: { mode: 'manual' } 
      });
    }
  }

  selectExcelImport(): void {
    this.showMethodModal.set(false);
    const evalId = this.createdEvaluationId();
    if (evalId) {
      this.router.navigate(['/evaluations', evalId], { 
        queryParams: { mode: 'import' } 
      });
    }
  }

  getCoursName(coursId: number): string {
    const cours = this.cours().find(c => c.id === coursId);
    return cours?.nom || '';
  }

  getClassName(classeId: number): string {
    const classe = this.classes().find(c => c.id === classeId);
    return classe?.nom || '';
  }

  toggleClasse(classeId: string | number): void {
    // Garder l'ID tel quel (string ou number)
    const index = this.formData.classeIds.findIndex(id => 
      String(id) === String(classeId)
    );
    
    if (index > -1) {
      this.formData.classeIds.splice(index, 1);
    } else {
      this.formData.classeIds.push(classeId);
    }
    console.log('📋 Classes sélectionnées:', this.formData.classeIds);
    console.log('📋 Types:', this.formData.classeIds.map(id => typeof id));
    
    // Filtrer les cours en fonction des classes sélectionnées
    this.filterCoursByClasses();
  }

  isClasseSelected(classeId: string | number): boolean {
    return this.formData.classeIds.some(id => 
      String(id) === String(classeId)
    );
  }

  // ============================================
  // STEP 2: QUESTIONS METHODS
  // ============================================

  // Mode Selection
  selectMode(mode: 'manual' | 'import'): void {
    this.selectedMode.set(mode);
  }

  confirmMode(): void {
    this.questionMode.set(this.selectedMode());
    this.currentStep.set(2);
  }

  backToModeSelection(): void {
    this.questionMode.set(null);
    this.selectedMode.set(null);
    this.uploadedFile.set(null);
    this.detectedQuestions.set(0);
  }

  // Import Methods
  setImportFormat(format: 'csv' | 'json' | 'excel'): void {
    this.importFormat.set(format);
    this.uploadedFile.set(null);
    this.detectedQuestions.set(0);
  }

  getAcceptedFileTypes(): string {
    const format = this.importFormat();
    if (format === 'csv') return '.csv';
    if (format === 'json') return '.json';
    if (format === 'excel') return '.xlsx,.xls';
    return '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.handleFile(file);
    }
  }

  handleFile(file: File): void {
    const format = this.importFormat();
    const validExtensions: { [key: string]: string[] } = {
      csv: ['.csv'],
      json: ['.json'],
      excel: ['.xlsx', '.xls']
    };

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!validExtensions[format].includes(fileExtension)) {
      this.errorMessage.set(`Format de fichier invalide. Attendu: ${format.toUpperCase()}`);
      return;
    }

    this.uploadedFile.set(file);
    this.errorMessage.set('');
    
    // Simuler la détection de questions (à remplacer par une vraie logique)
    setTimeout(() => {
      this.detectedQuestions.set(Math.floor(Math.random() * 20) + 5);
    }, 500);
  }

  removeFile(event: Event): void {
    event.stopPropagation();
    this.uploadedFile.set(null);
    this.detectedQuestions.set(0);
  }

  formatFileSize(bytes: number | undefined): string {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  toggleFormatExample(): void {
    this.showFormatExample.set(!this.showFormatExample());
  }

  getFormatExample(): string {
    const format = this.importFormat();
    if (format === 'excel') {
      return `Colonnes Excel requises:
Colonne A: Enonce (texte de la question)
Colonne B: Type (CHOIX_MULTIPLE ou REPONSE_OUVERTE)
Colonne C: Options (séparées par ; pour CHOIX_MULTIPLE)

Exemple:
Enonce                                    | Type              | Options
Quelle est la capitale de la France?     | CHOIX_MULTIPLE    | Paris;Lyon;Marseille;Bordeaux
Expliquez le théorème de Pythagore       | REPONSE_OUVERTE   |`;
    } else if (format === 'csv') {
      return `enonce,typeQuestion,options
"Quelle est la capitale de la France?",CHOIX_MULTIPLE,"Paris;Lyon;Marseille;Bordeaux"
"Expliquez le théorème de Pythagore",REPONSE_OUVERTE,""`;
    } else if (format === 'json') {
      return `[
  {
    "enonce": "Quelle est la capitale de la France?",
    "typeQuestion": "CHOIX_MULTIPLE",
    "options": ["Paris", "Lyon", "Marseille", "Bordeaux"]
  },
  {
    "enonce": "Expliquez le théorème de Pythagore",
    "typeQuestion": "REPONSE_OUVERTE",
    "options": []
  }
]`;
    }
    return '';
  }

  processImport(): void {
    this.isProcessing.set(true);
    
    // Simuler le traitement (à remplacer par une vraie logique)
    setTimeout(() => {
      this.successMessage.set(`${this.detectedQuestions()} questions importées avec succès`);
      this.isProcessing.set(false);
      this.questionMode.set('manual'); // Passer en mode manuel pour voir les questions
    }, 2000);
  }

  // Manual Creation Methods
  setQuestionFilter(filter: 'all' | 'CHOIX_MULTIPLE' | 'REPONSE_OUVERTE'): void {
    this.questionFilter.set(filter);
  }

  filteredQuestions(): any[] {
    const filter = this.questionFilter();
    if (filter === 'all') return this.questions();
    return this.questions().filter(q => q.typeQuestion === filter);
  }

  countByType(type: string): number {
    return this.questions().filter(q => q.typeQuestion === type).length;
  }

  toggleQuestion(id: number): void {
    if (this.expandedQuestion() === id) {
      this.expandedQuestion.set(null);
    } else {
      this.expandedQuestion.set(id);
    }
  }

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'CHOIX_MULTIPLE': 'Choix multiple',
      'REPONSE_OUVERTE': 'Réponse ouverte'
    };
    return labels[type] || type;
  }

  openAddQuestionModal(): void {
    this.editingQuestion.set(null);
    this.resetNewQuestion();
    this.showAddQuestionModal.set(true);
  }

  closeAddQuestionModal(): void {
    this.showAddQuestionModal.set(false);
    this.editingQuestion.set(null);
  }

  resetNewQuestion(): void {
    this.newQuestion = {
      typeQuestion: 'CHOIX_MULTIPLE',
      enonce: '',
      ordre: this.questions().length + 1,
      options: ['', ''],
      reponseCorrecteIndex: 0
    };
  }

  onQuestionTypeChange(): void {
    if (this.newQuestion.typeQuestion === 'CHOIX_MULTIPLE' && (!this.newQuestion.options || this.newQuestion.options.length === 0)) {
      this.newQuestion.options = ['', ''];
      this.newQuestion.reponseCorrecteIndex = 0;
    } else if (this.newQuestion.typeQuestion === 'REPONSE_OUVERTE') {
      this.newQuestion.options = [];
      delete this.newQuestion.reponseCorrecteIndex;
    }
  }

  addOption(): void {
    if (!this.newQuestion.options) {
      this.newQuestion.options = [];
    }
    this.newQuestion.options.push('');
  }

  removeOption(index: number): void {
    if (this.newQuestion.options && this.newQuestion.options.length > 2) {
      this.newQuestion.options.splice(index, 1);
      // Ajuster l'index de la réponse correcte si nécessaire
      if (this.newQuestion.reponseCorrecteIndex >= this.newQuestion.options.length) {
        this.newQuestion.reponseCorrecteIndex = this.newQuestion.options.length - 1;
      }
    }
  }

  setCorrectOption(index: number): void {
    this.newQuestion.reponseCorrecteIndex = index;
  }

  isQuestionValid(): boolean {
    if (!this.newQuestion.enonce || !this.newQuestion.enonce.trim()) return false;

    if (this.newQuestion.typeQuestion === 'CHOIX_MULTIPLE') {
      if (!this.newQuestion.options || this.newQuestion.options.length < 2) return false;
      if (this.newQuestion.options.some((opt: string) => !opt.trim())) return false;
      if (this.newQuestion.reponseCorrecteIndex === undefined || this.newQuestion.reponseCorrecteIndex < 0) return false;
    }

    return true;
  }

  saveQuestion(): void {
    if (!this.isQuestionValid()) return;

    const question = {
      id: this.editingQuestion() ? this.editingQuestion().id : Date.now(),
      ...this.newQuestion
    };

    if (this.editingQuestion()) {
      // Modifier une question existante
      const index = this.questions().findIndex(q => q.id === this.editingQuestion().id);
      if (index > -1) {
        const updatedQuestions = [...this.questions()];
        updatedQuestions[index] = question;
        this.questions.set(updatedQuestions);
        this.successMessage.set('Question modifiée avec succès');
      }
    } else {
      // Ajouter une nouvelle question
      this.questions.set([...this.questions(), question]);
      this.successMessage.set('Question ajoutée avec succès');
    }

    this.closeAddQuestionModal();
  }

  editQuestion(question: any, event: Event): void {
    event.stopPropagation();
    this.editingQuestion.set(question);
    this.newQuestion = { ...question };
    if (question.options) {
      this.newQuestion.options = [...question.options];
    }
    this.showAddQuestionModal.set(true);
  }

  duplicateQuestion(question: any, event: Event): void {
    event.stopPropagation();
    const duplicate = {
      ...question,
      id: Date.now(),
      enonce: question.enonce + ' (copie)',
      ordre: this.questions().length + 1
    };
    if (question.options) {
      duplicate.options = [...question.options];
    }
    this.questions.set([...this.questions(), duplicate]);
    this.successMessage.set('Question dupliquée avec succès');
  }

  deleteQuestion(id: number, event: Event): void {
    event.stopPropagation();
    if (confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) {
      this.questions.set(this.questions().filter(q => q.id !== id));
      this.successMessage.set('Question supprimée avec succès');
      if (this.expandedQuestion() === id) {
        this.expandedQuestion.set(null);
      }
    }
  }

  // ============================================
  // STEP 3: REVIEW & PUBLISH METHODS
  // ============================================

  setPublishMode(mode: 'now' | 'schedule' | 'draft'): void {
    this.publishMode.set(mode);
  }

  getValidationChecks(): Array<{label: string, valid: boolean, warning?: boolean}> {
    return [
      { label: 'Titre défini', valid: !!this.formData.titre.trim() },
      { label: 'Dates configurées', valid: !!this.formData.dateDebut && !!this.formData.dateFin },
      { label: 'Classes sélectionnées', valid: this.formData.classeIds.length > 0 },
      { label: 'Questions ajoutées', valid: this.questions().length > 0, warning: this.questions().length < 5 },
      { label: 'Cours assigné', valid: !!this.formData.coursId }
    ];
  }

  getTotalPoints(): number {
    return this.questions().reduce((sum, q) => sum + (q.points || 0), 0);
  }

  publishEvaluation(): void {
    this.isLoading.set(true);
    
    const statut = this.publishMode() === 'draft' ? 'BROUILLON' : 'PUBLIE';
    
    const evaluationData: EvaluationApiData = {
      titre: this.formData.titre,
      description: this.formData.description,
      dateDebut: this.publishMode() === 'schedule' && this.scheduledDate() 
        ? new Date(this.scheduledDate()).toISOString()
        : new Date(this.formData.dateDebut).toISOString(),
      dateFin: new Date(this.formData.dateFin).toISOString(),
      cours_id: this.formData.coursId ?? undefined,
      classeIds: this.formData.classeIds,
      statut: statut as any
    };

    // Simuler la publication (à remplacer par un vrai appel API)
    setTimeout(() => {
      this.isLoading.set(false);
      this.showSuccessModal.set(true);
    }, 1500);
  }

  viewEvaluation(): void {
    this.showSuccessModal.set(false);
    const evalId = this.createdEvaluationId();
    if (evalId) {
      this.router.navigate(['/evaluations', evalId]);
    }
  }

  createNewEvaluation(): void {
    this.showSuccessModal.set(false);
    window.location.reload();
  }

  goToDashboard(): void {
    this.showSuccessModal.set(false);
    this.router.navigate(['/evaluations']);
  }

  goToStep(step: number): void {
    if (step >= 1 && step <= 3) {
      this.currentStep.set(step);
    }
  }
}
