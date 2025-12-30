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
    coursId: 0,
    classeIds: [] as (number | string)[]
  };

  // Modal
  showMethodModal = signal(false);
  createdEvaluationId = signal<string | number | null>(null);

  errorMessage = signal('');
  successMessage = signal('');

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
    return this.formData.titre.trim().length > 0;
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
        this.cours.set(cours);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des cours:', error);
      }
    });
  }

  loadClasses(): void {
    this.academicUseCase.getClasses().subscribe({
      next: (classes) => {
        console.log('📚 Classes chargées:', classes);
        console.log('📚 Types des IDs:', classes.map(c => ({ nom: c.nom, id: c.id, type: typeof c.id })));
        this.classes.set(classes);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des classes:', error);
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
    if (!this.formData.coursId) {
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
      
      // Si on a déjà un brouillon, le mettre à jour, sinon le créer
      if (this.draftEvaluationId()) {
        this.updateDraftAndProceed();
      } else {
        this.createDraftEvaluation();
      }
    }
  }

  updateDraftAndProceed(): void {
    this.isLoading.set(true);
    
    const evaluationData: EvaluationApiData = {
      titre: this.formData.titre,
      description: this.formData.description,
      dateDebut: new Date(this.formData.dateDebut).toISOString(),
      dateFin: new Date(this.formData.dateFin).toISOString(),
      cours_id: this.formData.coursId,
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
      cours_id: this.formData.coursId,
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
      this.currentStep.set(this.currentStep() - 1);
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
  }

  isClasseSelected(classeId: string | number): boolean {
    return this.formData.classeIds.some(id => 
      String(id) === String(classeId)
    );
  }
}
