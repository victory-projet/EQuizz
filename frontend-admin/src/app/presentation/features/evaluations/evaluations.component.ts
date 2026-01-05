import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { EvaluationUseCase } from '../../../core/usecases/evaluation.usecase';
import { Evaluation } from '../../../core/domain/entities/evaluation.entity';
import { ConfirmationService } from '../../shared/services/confirmation.service';
import { GlobalSearchService } from '../../shared/services/global-search.service';

@Component({
  selector: 'app-evaluations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './evaluations.component.html',
  styleUrls: ['./evaluations.component.scss']
})
export class EvaluationsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  evaluations = signal<Evaluation[]>([]);
  filteredEvaluations = signal<Evaluation[]>([]);
  isLoading = signal(false);
  searchQuery = signal('');
  filterStatus = signal<string>('ALL');
  filterPeriod = signal<string>('ALL');
  filterQuestions = signal<string>('ALL');
  sortBy = signal<string>('dateCreation');
  sortOrder = signal<'asc' | 'desc'>('desc');
  showFilters = signal(false);
  showSortMenu = signal(false);
  
  // Stats
  totalQuiz = signal(0);
  activeQuiz = signal(0);
  draftQuiz = signal(0);
  closedQuiz = signal(0);

  errorMessage = signal('');
  successMessage = signal('');
  showCardMenu = signal<number | string | null>(null);
  showDuplicateMenuId = signal<number | string | null>(null);

  private confirmationService = inject(ConfirmationService);

  constructor(
    private evaluationUseCase: EvaluationUseCase,
    private router: Router,
    private globalSearchService: GlobalSearchService
  ) {}

  ngOnInit(): void {
    this.loadEvaluations();
    this.setupGlobalSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupGlobalSearch(): void {
    // Setup global search if available
    // This would need to be implemented based on your actual GlobalSearchService
    console.log('Global search setup - implement based on your service structure');
  }

  loadEvaluations(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.evaluationUseCase.getEvaluations().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (evaluations: Evaluation[]) => {
        this.evaluations.set(evaluations);
        this.applyFilters();
        this.updateStats();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des évaluations:', error);
        this.errorMessage.set('Erreur lors du chargement des évaluations');
        this.isLoading.set(false);
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.evaluations()];

    // Filter by search query
    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      filtered = filtered.filter(evaluation => 
        evaluation.titre.toLowerCase().includes(query) ||
        evaluation.description?.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (this.filterStatus() !== 'ALL') {
      filtered = filtered.filter(evaluation => evaluation.statut === this.filterStatus());
    }

    // Filter by period
    if (this.filterPeriod() !== 'ALL') {
      const now = new Date();
      filtered = filtered.filter(evaluation => {
        const dateDebut = new Date(evaluation.dateDebut);
        const dateFin = new Date(evaluation.dateFin);
        
        switch (this.filterPeriod()) {
          case 'COMING':
            return dateDebut > now;
          case 'ACTIVE':
            return dateDebut <= now && dateFin >= now;
          case 'FINISHED':
            return dateFin < now;
          default:
            return true;
        }
      });
    }

    // Sort
    filtered = this.sortEvaluations(filtered);
    
    this.filteredEvaluations.set(filtered);
  }

  private sortEvaluations(evaluations: Evaluation[]): Evaluation[] {
    return evaluations.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (this.sortBy()) {
        case 'titre':
          aValue = a.titre.toLowerCase();
          bValue = b.titre.toLowerCase();
          break;
        case 'dateCreation':
          aValue = new Date(a.dateCreation || '');
          bValue = new Date(b.dateCreation || '');
          break;
        case 'dateDebut':
          aValue = new Date(a.dateDebut);
          bValue = new Date(b.dateDebut);
          break;
        case 'dateFin':
          aValue = new Date(a.dateFin);
          bValue = new Date(b.dateFin);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return this.sortOrder() === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortOrder() === 'asc' ? 1 : -1;
      return 0;
    });
  }

  private updateStats(): void {
    const evaluations = this.evaluations();
    this.totalQuiz.set(evaluations.length);
    this.activeQuiz.set(evaluations.filter(e => e.statut === 'ACTIVE').length);
    this.draftQuiz.set(evaluations.filter(e => e.statut === 'BROUILLON').length);
    this.closedQuiz.set(evaluations.filter(e => e.statut === 'TERMINEE').length);
  }

  // Navigation methods
  createEvaluation(): void {
    this.router.navigate(['/evaluations/create']);
  }

  editEvaluation(evaluation: Evaluation): void {
    this.router.navigate(['/evaluations', evaluation.id, 'edit']);
  }

  viewEvaluation(evaluationId: string | number): void {
    this.router.navigate(['/evaluations', evaluationId]);
  }

  // Action methods
  async publishEvaluation(evaluation: Evaluation): Promise<void> {
    const confirmed = await this.confirmationService.confirmPublish(evaluation.titre);

    if (confirmed) {
      this.isLoading.set(true);
      this.evaluationUseCase.publishEvaluation(evaluation.id).subscribe({
        next: (result) => {
          console.log('✅ Évaluation publiée:', result);
          this.successMessage.set(`Évaluation "${evaluation.titre}" publiée avec succès`);
          this.loadEvaluations();
        },
        error: (error) => {
          console.error('❌ Erreur lors de la publication:', error);
          this.errorMessage.set('Erreur lors de la publication de l\'évaluation');
          this.isLoading.set(false);
        }
      });
    }
  }

  async deleteEvaluation(evaluation: Evaluation): Promise<void> {
    const confirmed = await this.confirmationService.confirmDelete(evaluation.titre);

    if (confirmed) {
      this.isLoading.set(true);
      this.evaluationUseCase.deleteEvaluation(evaluation.id).subscribe({
        next: () => {
          this.successMessage.set(`Évaluation "${evaluation.titre}" supprimée avec succès`);
          this.loadEvaluations();
        },
        error: (error) => {
          console.error('❌ Erreur lors de la suppression:', error);
          let errorMsg = 'Erreur lors de la suppression de l\'évaluation';
          if (error.error?.message) {
            errorMsg = error.error.message;
          }
          this.errorMessage.set(errorMsg);
          this.isLoading.set(false);
        }
      });
    }
  }

  duplicateEvaluation(evaluation: Evaluation): void {
    this.isLoading.set(true);
    this.evaluationUseCase.duplicateEvaluation(evaluation.id).subscribe({
      next: (duplicatedEvaluation) => {
        this.successMessage.set(`Évaluation "${evaluation.titre}" dupliquée avec succès`);
        this.loadEvaluations();
      },
      error: (error) => {
        console.error('❌ Erreur lors de la duplication:', error);
        this.errorMessage.set('Erreur lors de la duplication de l\'évaluation');
        this.isLoading.set(false);
      }
    });
  }

  // Menu methods
  toggleCardMenu(evaluationId: string | number): void {
    if (this.showCardMenu() === evaluationId) {
      this.showCardMenu.set(null);
    } else {
      this.showCardMenu.set(evaluationId);
    }
  }

  hideCardMenu(): void {
    this.showCardMenu.set(null);
  }

  showDuplicateMenu(evaluationId: string | number): void {
    this.showDuplicateMenuId.set(evaluationId);
  }

  hideDuplicateMenu(): void {
    this.showDuplicateMenuId.set(null);
  }

  onDuplicateAction(evaluation: Evaluation, action: string): void {
    this.hideDuplicateMenu();
    
    if (action === 'duplicate') {
      this.duplicateEvaluation(evaluation);
    }
  }

  // Results methods
  viewResults(evaluation: Evaluation): void {
    this.router.navigate(['/evaluations', evaluation.id, 'results']);
  }

  exportResults(evaluation: Evaluation): void {
    this.router.navigate(['/evaluations', evaluation.id, 'export']);
  }

  // Utility methods
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'BROUILLON':
        return 'brouillon';
      case 'ACTIVE':
        return 'active';
      case 'TERMINEE':
        return 'terminee';
      case 'ARCHIVEE':
        return 'archivee';
      default:
        return '';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'BROUILLON':
        return 'Brouillon';
      case 'ACTIVE':
        return 'Active';
      case 'TERMINEE':
        return 'Terminée';
      case 'ARCHIVEE':
        return 'Archivée';
      default:
        return status;
    }
  }

  formatDate(date: string | Date): string {
    if (!date) return 'Non définie';
    return new Date(date).toLocaleDateString('fr-FR');
  }

  getCoursName(evaluation: Evaluation): string {
    return evaluation.cours?.nom || 'Non spécifié';
  }

  getClassesNames(evaluation: Evaluation): string {
    // Note: Adjust property name based on actual Evaluation entity structure
    const classes = (evaluation as any).classes || (evaluation as any).Classes || [];
    if (!classes || classes.length === 0) {
      return 'Aucune classe';
    }
    if (classes.length === 1) {
      return classes[0].nom;
    }
    return `${classes.length} classes`;
  }

  // Filter and sort methods
  toggleFilters(): void {
    this.showFilters.set(!this.showFilters());
  }

  toggleSortMenu(): void {
    this.showSortMenu.set(!this.showSortMenu());
  }

  setSortBy(field: string): void {
    if (this.sortBy() === field) {
      this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(field);
      this.sortOrder.set('asc');
    }
    this.showSortMenu.set(false);
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.filterStatus.set('ALL');
    this.filterPeriod.set('ALL');
    this.filterQuestions.set('ALL');
    this.applyFilters();
  }

  // Missing methods for template
  searchTerm = this.searchQuery;
  selectedStatus = this.filterStatus;
  selectedCours = signal<string>('ALL');
  cours = signal<any[]>([]);

  onSearchChange(): void {
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  resetFilters(): void {
    this.clearFilters();
  }

  hasActiveFilters(): boolean {
    return this.searchQuery() !== '' || 
           this.filterStatus() !== 'ALL' || 
           this.filterPeriod() !== 'ALL' ||
           this.selectedCours() !== 'ALL';
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'BROUILLON':
        return 'edit';
      case 'ACTIVE':
        return 'play_circle';
      case 'TERMINEE':
        return 'check_circle';
      case 'ARCHIVEE':
        return 'archive';
      default:
        return 'help_outline';
    }
  }

  viewSubmissions(evaluation: Evaluation): void {
    this.router.navigate(['/evaluations', evaluation.id, 'submissions']);
  }

  viewEvaluationDetails(evaluation: Evaluation): void {
    this.viewEvaluation(evaluation.id);
  }

  getQuestionCount(evaluation: Evaluation): number {
    return evaluation.quizz?.questions?.length || 
           evaluation.quizz?.Questions?.length || 
           (evaluation as any).Quizz?.Questions?.length || 0;
  }

  getClassesCount(evaluation: Evaluation): number {
    const classes = (evaluation as any).classes || (evaluation as any).Classes || [];
    return classes.length;
  }

  closeEvaluation(evaluation: Evaluation): void {
    this.evaluationUseCase.closeEvaluation(evaluation.id).subscribe({
      next: () => {
        this.successMessage.set(`Évaluation "${evaluation.titre}" fermée avec succès`);
        this.loadEvaluations();
      },
      error: (error) => {
        console.error('❌ Erreur lors de la fermeture:', error);
        this.errorMessage.set('Erreur lors de la fermeture de l\'évaluation');
      }
    });
  }
}