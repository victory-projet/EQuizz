import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EvaluationUseCase } from '../../../core/usecases/evaluation.usecase';
import { AcademicUseCase } from '../../../core/usecases/academic.usecase';
import { Cours, Classe } from '../../../core/domain/entities/academic.entity';

@Component({
  selector: 'app-evaluation-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './evaluation-create.component.html',
  styleUrls: ['./evaluation-create.component.scss']
})
export class EvaluationCreateComponent implements OnInit {
  // Step management
  currentStep = signal(1);
  
  // Data
  cours = signal<Cours[]>([]);
  classes = signal<Classe[]>([]);
  isLoading = signal(false);
  
  // Form data
  formData = {
    titre: '',
    description: '',
    dateDebut: '',
    dateFin: '',
    coursId: 0,
    classeIds: [] as (number | string)[]  // Peut être des nombres ou des UUIDs
  };

  // Modal
  showMethodModal = signal(false);
  createdEvaluationId = signal<string | number | null>(null);

  errorMessage = signal('');
  successMessage = signal('');

  constructor(
    private evaluationUseCase: EvaluationUseCase,
    private academicUseCase: AcademicUseCase,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCours();
    this.loadClasses();
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
      
      // Créer l'évaluation en mode brouillon
      this.createDraftEvaluation();
    }
  }

  createDraftEvaluation(): void {
    this.isLoading.set(true);
    
    console.log('📝 Création d\'évaluation - Données du formulaire:', this.formData);
    
    const evaluationData = {
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
    console.log('📤 JSON stringifié:', JSON.stringify(evaluationData, null, 2));
    console.log('📤 Type de cours_id:', typeof evaluationData.cours_id);
    console.log('📤 Type de classeIds:', typeof evaluationData.classeIds);
    console.log('📤 classeIds est un tableau?', Array.isArray(evaluationData.classeIds));
    console.log('📤 Contenu de classeIds:', evaluationData.classeIds);

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
        console.error('📋 Détails de l\'erreur:', error.error);
        if (error.error?.errors) {
          console.error('🔍 Erreurs de validation:', error.error.errors);
          console.error('🔍 Erreurs détaillées:', JSON.stringify(error.error.errors, null, 2));
          error.error.errors.forEach((err: any, index: number) => {
            console.error(`   Erreur ${index + 1}:`, err);
          });
        }
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
