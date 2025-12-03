import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EvaluationUseCase } from '../../../core/usecases/evaluation.usecase';
import { Evaluation } from '../../../core/domain/entities/evaluation.entity';

@Component({
  selector: 'app-evaluations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './evaluations.component.html',
  styleUrls: ['./evaluations.component.scss']
})
export class EvaluationsComponent implements OnInit {
  evaluations = signal<Evaluation[]>([]);
  filteredEvaluations = signal<Evaluation[]>([]);
  isLoading = signal(false);
  searchQuery = signal('');
  filterStatus = signal<string>('ALL');
  
  // Stats
  totalQuiz = signal(0);
  activeQuiz = signal(0);
  draftQuiz = signal(0);
  closedQuiz = signal(0);

  errorMessage = signal('');
  successMessage = signal('');

  constructor(
    private evaluationUseCase: EvaluationUseCase,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEvaluations();
  }

  loadEvaluations(): void {
    this.isLoading.set(true);
    console.log('📥 Chargement des évaluations...');
    this.evaluationUseCase.getEvaluations().subscribe({
      next: (evaluations) => {
        console.log('✅ Évaluations reçues:', evaluations);
        // Log détaillé de la première évaluation pour debug
        if (evaluations.length > 0) {
          console.log('🔍 Détail première évaluation:', JSON.stringify(evaluations[0], null, 2));
        }
        this.evaluations.set(evaluations);
        this.updateStats();
        this.applyFilters();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des évaluations:', error);
        this.errorMessage.set('Erreur lors du chargement des évaluations');
        this.isLoading.set(false);
      }
    });
  }

  updateStats(): void {
    const evals = this.evaluations();
    this.totalQuiz.set(evals.length);
    this.activeQuiz.set(evals.filter(e => e.statut === 'PUBLIEE').length);
    this.draftQuiz.set(evals.filter(e => e.statut === 'BROUILLON').length);
    this.closedQuiz.set(evals.filter(e => e.statut === 'CLOTUREE').length);
  }

  applyFilters(): void {
    let filtered = this.evaluations();
    
    if (this.filterStatus() !== 'ALL') {
      filtered = filtered.filter(e => e.statut === this.filterStatus());
    }
    
    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      filtered = filtered.filter(e => 
        e.titre.toLowerCase().includes(query) ||
        (e.description && e.description.toLowerCase().includes(query))
      );
    }
    
    this.filteredEvaluations.set(filtered);
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    this.applyFilters();
  }

  onFilterStatus(status: string): void {
    this.filterStatus.set(status);
    this.applyFilters();
  }

  createEvaluation(): void {
    this.router.navigate(['/evaluations/create']);
  }

  viewEvaluation(id: number | string): void {
    this.router.navigate(['/evaluations', id]);
  }

  editEvaluation(evaluation: Evaluation): void {
    this.router.navigate(['/evaluations', evaluation.id]);
  }

  publishEvaluation(evaluation: Evaluation): void {
    if (confirm(`Êtes-vous sûr de vouloir publier l'évaluation "${evaluation.titre}" ?`)) {
      this.evaluationUseCase.publishEvaluation(evaluation.id as any).subscribe({
        next: () => {
          this.successMessage.set('Évaluation publiée avec succès');
          this.loadEvaluations();
          setTimeout(() => this.successMessage.set(''), 3000);
        },
        error: (error) => {
          this.errorMessage.set(error.error?.message || 'Erreur lors de la publication');
        }
      });
    }
  }

  closeEvaluation(evaluation: Evaluation): void {
    if (confirm(`Êtes-vous sûr de vouloir clôturer l'évaluation "${evaluation.titre}" ?`)) {
      this.evaluationUseCase.closeEvaluation(evaluation.id as any).subscribe({
        next: () => {
          this.successMessage.set('Évaluation clôturée avec succès');
          this.loadEvaluations();
          setTimeout(() => this.successMessage.set(''), 3000);
        },
        error: (error) => {
          this.errorMessage.set(error.error?.message || 'Erreur lors de la clôture');
        }
      });
    }
  }

  deleteEvaluation(evaluation: Evaluation): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'évaluation "${evaluation.titre}" ?`)) {
      this.evaluationUseCase.deleteEvaluation(evaluation.id as any).subscribe({
        next: () => {
          this.successMessage.set('Évaluation supprimée avec succès');
          this.loadEvaluations();
          setTimeout(() => this.successMessage.set(''), 3000);
        },
        error: (error) => {
          this.errorMessage.set(error.error?.message || 'Erreur lors de la suppression');
        }
      });
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

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  getQuestionCount(evaluation: Evaluation): number {
    const count = evaluation.quizz?.questions?.length || (evaluation as any).Quizz?.Questions?.length || 0;
    console.log('📊 Nombre de questions pour', evaluation.titre, ':', count);
    return count;
  }

  getCoursName(evaluation: Evaluation): string {
    // Le backend peut retourner 'Cour' (singulier), 'Cours' (pluriel) ou 'cours' (camelCase)
    const coursName = (evaluation as any).Cour?.nom || (evaluation as any).Cours?.nom || evaluation.cours?.nom || 'Cours non défini';
    console.log('📚 Cours pour', evaluation.titre, ':', coursName);
    console.log('📚 Objet évaluation:', evaluation);
    return coursName;
  }

  getClassesCount(evaluation: Evaluation): number {
    const count = (evaluation as any).Classes?.length || (evaluation as any).classe ? 1 : 0;
    console.log('👥 Nombre de classes pour', evaluation.titre, ':', count);
    return count;
  }
}
