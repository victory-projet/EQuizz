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
    this.globalSearchService.clearConfig();
  }

  private setupGlobalSearch(): void {
    // Configurer la recherche pour cette page
    this.globalSearchService.setSearchConfig({
      placeholder: 'Rechercher un quiz par titre, UE ou classe...',
      suggestions: ['Programmation Web', 'Mathématiques', 'ING4ISI', 'BROUILLON', 'PUBLIEE'],
      onSearch: (query: string) => {
        this.searchQuery.set(query);
        this.applyFilters();
      },
      onClear: () => {
        this.searchQuery.set('');
        this.applyFilters();
      }
    });

    // Écouter les recherches depuis la navbar
    this.globalSearchService.search$
      .pipe(takeUntil(this.destroy$))
      .subscribe(query => {
        this.searchQuery.set(query);
        this.applyFilters();
      });
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
    
    // Filtrage par statut
    if (this.filterStatus() !== 'ALL') {
      filtered = filtered.filter(e => e.statut === this.filterStatus());
    }
    
    // Filtrage par période
    if (this.filterPeriod() !== 'ALL') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(e => {
        const creationDate = new Date(e.dateCreation || 0);
        
        switch (this.filterPeriod()) {
          case 'TODAY':
            return creationDate >= today;
          case 'WEEK':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            return creationDate >= weekAgo;
          case 'MONTH':
            const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
            return creationDate >= monthAgo;
          case 'SEMESTER':
            const semesterAgo = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate());
            return creationDate >= semesterAgo;
          default:
            return true;
        }
      });
    }
    
    // Filtrage par nombre de questions
    if (this.filterQuestions() !== 'ALL') {
      filtered = filtered.filter(e => {
        const questionCount = this.getQuestionCount(e);
        
        switch (this.filterQuestions()) {
          case 'EMPTY':
            return questionCount === 0;
          case 'FEW':
            return questionCount >= 1 && questionCount <= 5;
          case 'MEDIUM':
            return questionCount >= 6 && questionCount <= 15;
          case 'MANY':
            return questionCount >= 16;
          default:
            return true;
        }
      });
    }
    
    // Recherche textuelle
    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      filtered = filtered.filter(e => 
        e.titre.toLowerCase().includes(query) ||
        (e.description && e.description.toLowerCase().includes(query)) ||
        this.getCoursName(e).toLowerCase().includes(query)
      );
    }
    
    // Tri
    filtered = this.sortEvaluations(filtered);
    
    this.filteredEvaluations.set(filtered);
  }

  private sortEvaluations(evaluations: Evaluation[]): Evaluation[] {
    const sortBy = this.sortBy();
    const order = this.sortOrder();
    
    return [...evaluations].sort((a, b) => {
      let valueA: any;
      let valueB: any;
      
      switch (sortBy) {
        case 'titre':
          valueA = a.titre.toLowerCase();
          valueB = b.titre.toLowerCase();
          break;
        case 'dateCreation':
          valueA = new Date(a.dateCreation || 0);
          valueB = new Date(b.dateCreation || 0);
          break;
        case 'dateDebut':
          valueA = new Date(a.dateDebut);
          valueB = new Date(b.dateDebut);
          break;
        case 'dateFin':
          valueA = new Date(a.dateFin);
          valueB = new Date(b.dateFin);
          break;
        case 'statut':
          valueA = a.statut;
          valueB = b.statut;
          break;
        case 'cours':
          valueA = this.getCoursName(a).toLowerCase();
          valueB = this.getCoursName(b).toLowerCase();
          break;
        case 'questions':
          valueA = this.getQuestionCount(a);
          valueB = this.getQuestionCount(b);
          break;
        default:
          return 0;
      }
      
      if (valueA < valueB) {
        return order === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    });
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

  onFilterPeriod(period: string): void {
    this.filterPeriod.set(period);
    this.applyFilters();
  }

  onFilterQuestions(questions: string): void {
    this.filterQuestions.set(questions);
    this.applyFilters();
  }

  onSort(sortBy: string): void {
    if (this.sortBy() === sortBy) {
      // Si on clique sur le même critère, on inverse l'ordre
      this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      // Nouveau critère, on commence par ordre décroissant
      this.sortBy.set(sortBy);
      this.sortOrder.set('desc');
    }
    this.showSortMenu.set(false);
    this.applyFilters();
  }

  toggleFilters(): void {
    this.showFilters.set(!this.showFilters());
  }

  toggleSortMenu(): void {
    this.showSortMenu.set(!this.showSortMenu());
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.applyFilters();
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.filterStatus.set('ALL');
    this.filterPeriod.set('ALL');
    this.filterQuestions.set('ALL');
    this.sortBy.set('dateCreation');
    this.sortOrder.set('desc');
    this.showFilters.set(false);
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return this.filterStatus() !== 'ALL' || 
           this.filterPeriod() !== 'ALL' || 
           this.filterQuestions() !== 'ALL' ||
           this.searchQuery() !== '';
  }

  getActiveFiltersCount(): number {
    let count = 0;
    if (this.filterStatus() !== 'ALL') count++;
    if (this.filterPeriod() !== 'ALL') count++;
    if (this.filterQuestions() !== 'ALL') count++;
    if (this.searchQuery() !== '') count++;
    return count;
  }

  getSortLabel(sortBy: string): string {
    const labels: { [key: string]: string } = {
      'titre': 'Titre',
      'dateCreation': 'Date de création',
      'dateDebut': 'Date de début',
      'dateFin': 'Date de fin',
      'statut': 'Statut',
      'cours': 'Cours',
      'questions': 'Nombre de questions'
    };
    return labels[sortBy] || sortBy;
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

  // Actions avec confirmation
  async publishEvaluation(evaluation: Evaluation): Promise<void> {
    const confirmed = await this.confirmationService.confirmPublish(evaluation.titre);
    if (!confirmed) return;

    this.isLoading.set(true);
    this.evaluationUseCase.publishEvaluation(evaluation.id as any).subscribe({
      next: () => {
        this.successMessage.set('Évaluation publiée avec succès');
        this.loadEvaluations();
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message || 'Erreur lors de la publication');
        this.isLoading.set(false);
      }
    });
  }

  async closeEvaluation(evaluation: Evaluation): Promise<void> {
    const confirmed = await this.confirmationService.confirmClose(evaluation.titre);
    if (!confirmed) return;

    this.isLoading.set(true);
    this.evaluationUseCase.closeEvaluation(evaluation.id as any).subscribe({
      next: () => {
        this.successMessage.set('Évaluation clôturée avec succès');
        this.loadEvaluations();
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message || 'Erreur lors de la clôture');
        this.isLoading.set(false);
      }
    });
  }

  async deleteEvaluation(evaluation: Evaluation): Promise<void> {
    const confirmed = await this.confirmationService.confirmDelete(evaluation.titre);
    if (!confirmed) return;

    this.isLoading.set(true);
    this.evaluationUseCase.deleteEvaluation(evaluation.id as any).subscribe({
      next: () => {
        this.successMessage.set('Évaluation supprimée avec succès');
        this.loadEvaluations();
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        console.error('❌ Erreur suppression:', error);
        let errorMsg = 'Erreur lors de la suppression';
        
        if (error.error?.message) {
          errorMsg = error.error.message;
        } else if (error.message) {
          errorMsg = error.message;
        }
        
        // Messages d'erreur spécifiques
        if (errorMsg.includes('non trouvée')) {
          errorMsg = 'Cette évaluation n\'existe plus ou a déjà été supprimée.';
        } else if (errorMsg.includes('soumissions')) {
          errorMsg = 'Impossible de supprimer une évaluation qui a des soumissions d\'étudiants.';
        }
        
        this.errorMessage.set(errorMsg);
        this.isLoading.set(false);
        setTimeout(() => this.errorMessage.set(''), 5000);
      }
    });
  }

  async duplicateEvaluation(evaluation: Evaluation): Promise<void> {
    const confirmed = await this.confirmationService.confirmDuplicate(evaluation.titre);
    if (!confirmed) return;

    this.isLoading.set(true);
    this.evaluationUseCase.duplicateEvaluation(evaluation.id as any).subscribe({
      next: () => {
        this.successMessage.set('Évaluation dupliquée avec succès');
        this.loadEvaluations();
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        console.error('❌ Erreur duplication:', error);
        let errorMsg = 'Erreur lors de la duplication';
        
        if (error.error?.message) {
          errorMsg = error.error.message;
        } else if (error.message) {
          errorMsg = error.message;
        }
        
        this.errorMessage.set(errorMsg);
        this.isLoading.set(false);
        setTimeout(() => this.errorMessage.set(''), 5000);
      }
    });
  }

  // Nouvelles méthodes pour l'interface améliorée
  toggleCardMenu(evaluationId: number | string): void {
    if (this.showCardMenu() === evaluationId) {
      this.showCardMenu.set(null);
    } else {
      this.showCardMenu.set(evaluationId);
    }
  }

  hideCardMenu(): void {
    this.showCardMenu.set(null);
  }

  viewSubmissions(evaluation: Evaluation): void {
    this.router.navigate(['/evaluations', evaluation.id, 'submissions']);
  }

  viewResults(evaluation: Evaluation): void {
    this.router.navigate(['/evaluations', evaluation.id, 'results']);
  }

  exportResults(evaluation: Evaluation): void {
    // TODO: Implémenter l'export des résultats
    this.successMessage.set('Export des résultats en cours de développement...');
    setTimeout(() => this.successMessage.set(''), 3000);
  }

  getSubmissionsCount(evaluation: Evaluation): number {
    // TODO: Récupérer le nombre réel de soumissions depuis l'API
    return (evaluation as any).submissionsCount || 0;
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
      case 'BROUILLON': return 'edit_note';
      case 'PUBLIEE': return 'play_circle';
      case 'CLOTUREE': return 'lock';
      default: return 'help_outline';
    }
  }

  formatDate(date: Date): string {
    if (!date) return 'Date non définie';
    
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return 'Date invalide';
      }
      return dateObj.toLocaleDateString('fr-FR');
    } catch (error) {
      console.error('Erreur formatage date:', error);
      return 'Date invalide';
    }
  }

  getQuestionCount(evaluation: Evaluation): number {
    const count = evaluation.quizz?.questions?.length || (evaluation as any).Quizz?.Questions?.length || 0;
    console.log('📊 Nombre de questions pour', evaluation.titre, ':', count);
    return count;
  }

  getCoursName(evaluation: Evaluation): string {
    // Le backend peut retourner 'Cour' (singulier), 'Cours' (pluriel) ou 'cours' (camelCase)
    const coursName = (evaluation as any).Cour?.nom || 
                     (evaluation as any).Cours?.nom || 
                     evaluation.cours?.nom || 
                     (evaluation as any).cours_nom ||
                     'Cours non défini';
    console.log('📚 Cours pour', evaluation.titre, ':', coursName);
    if (coursName === 'Cours non défini') {
      console.log('📚 Objet évaluation complet:', JSON.stringify(evaluation, null, 2));
    }
    return coursName;
  }

  getClassesCount(evaluation: Evaluation): number {
    const count = (evaluation as any).Classes?.length || (evaluation as any).classe ? 1 : 0;
    console.log('👥 Nombre de classes pour', evaluation.titre, ':', count);
    return count;
  }
}
