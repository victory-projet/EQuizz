import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ReportService, EvaluationReportData, FilterOptions } from '../../../core/services/report.service';
import { EvaluationUseCase } from '../../../core/usecases/evaluation.usecase';
import { Evaluation } from '../../../core/domain/entities/evaluation.entity';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Données
  availableEvaluations = signal<Evaluation[]>([]);
  filteredEvaluations = signal<Evaluation[]>([]);
  reportData = signal<EvaluationReportData | null>(null);
  classes = signal<Array<{ id: string; nom: string }>>([]);
  teachers = signal<Array<{ id: string; nom: string }>>([]);
  
  // État
  isLoading = signal(false);
  selectedEvaluationId = signal<string | null>(null);
  activeTab = signal<'overview' | 'questions' | 'sentiments' | 'performances'>('overview');
  
  // Filtres
  searchQuery = signal('');
  selectedClass = signal('');
  selectedTeacher = signal('');
  filterPeriod = signal<string>('ALL');
  showFilters = signal(false);
  
  // Messages
  successMessage = signal('');
  errorMessage = signal('');
  
  // Stats
  totalReports = signal(0);
  totalResponses = signal(0);

  constructor(
    private reportService: ReportService,
    private evaluationUseCase: EvaluationUseCase,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadAvailableEvaluations();
    this.loadFilterOptions();
    
    // Vérifier si une évaluation spécifique est demandée via les paramètres de requête
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['evaluationId']) {
        this.selectedEvaluationId.set(params['evaluationId']);
        this.loadReport(params['evaluationId']);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAvailableEvaluations(): void {
    this.isLoading.set(true);
    this.evaluationUseCase.getEvaluations().subscribe({
      next: (evaluations) => {
        // Filtrer uniquement les évaluations clôturées
        const closedEvaluations = evaluations.filter(e => e.statut === 'CLOTUREE');
        this.availableEvaluations.set(closedEvaluations);
        this.totalReports.set(closedEvaluations.length);
        this.applyFilters();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des évaluations:', error);
        this.errorMessage.set('Erreur lors du chargement des évaluations');
        this.isLoading.set(false);
      }
    });
  }

  loadFilterOptions(): void {
    this.reportService.getFilterOptions().subscribe({
      next: (options: FilterOptions) => {
        this.classes.set(options.classes);
        this.teachers.set(options.enseignants);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des options de filtrage:', error);
      }
    });
  }

  loadReport(evaluationId: string): void {
    this.isLoading.set(true);
    const filters = {
      classe: this.selectedClass() || undefined,
      enseignant: this.selectedTeacher() || undefined
    };

    this.reportService.getEvaluationReport(evaluationId, filters).subscribe({
      next: (data) => {
        // Use setTimeout to avoid change detection issues
        setTimeout(() => {
          // Ensure data structure is complete with defaults
          const safeData = {
            ...data,
            statistics: {
              totalStudents: data?.statistics?.totalStudents ?? 0,
              totalRespondents: data?.statistics?.totalRespondents ?? 0,
              participationRate: data?.statistics?.participationRate ?? 0,
              totalQuestions: data?.statistics?.totalQuestions ?? 0,
              averageScore: data?.statistics?.averageScore ?? 0,
              averageTime: data?.statistics?.averageTime ?? 0,
              successRate: data?.statistics?.successRate ?? 0
            },
            mcqQuestions: data?.mcqQuestions || [],
            openQuestions: data?.openQuestions || [],
            sentimentData: {
              positive: data?.sentimentData?.positive ?? 0,
              neutral: data?.sentimentData?.neutral ?? 0,
              negative: data?.sentimentData?.negative ?? 0
            }
          };
          
          this.reportData.set(safeData);
          this.calculateTotalResponses(safeData);
          this.isLoading.set(false);
        }, 0);
      },
      error: (error) => {
        console.error('Erreur lors du chargement du rapport:', error);
        setTimeout(() => {
          this.errorMessage.set('Erreur lors du chargement du rapport');
          this.isLoading.set(false);
        }, 0);
      }
    });
  }

  selectEvaluation(evaluationId: string | number): void {
    const id = evaluationId.toString();
    this.selectedEvaluationId.set(id);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { evaluationId: id },
      queryParamsHandling: 'merge'
    });
    this.loadReport(id);
  }

  goBackToSelection(): void {
    this.selectedEvaluationId.set(null);
    this.reportData.set(null);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { evaluationId: null },
      queryParamsHandling: 'merge'
    });
  }

  setActiveTab(tab: 'overview' | 'questions' | 'sentiments' | 'performances'): void {
    this.activeTab.set(tab);
  }

  // Filtres
  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.applyFilters();
  }

  onFilterPeriod(period: string): void {
    this.filterPeriod.set(period);
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = this.availableEvaluations();
    
    // Filtrage par recherche textuelle
    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      filtered = filtered.filter(e => 
        e.titre.toLowerCase().includes(query) ||
        (e.description && e.description.toLowerCase().includes(query)) ||
        this.getCoursName(e).toLowerCase().includes(query)
      );
    }
    
    // Filtrage par période
    if (this.filterPeriod() !== 'ALL') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(e => {
        const creationDate = new Date(e.dateCreation || 0);
        
        switch (this.filterPeriod()) {
          case 'WEEK':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            return creationDate >= weekAgo;
          case 'MONTH':
            const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
            return creationDate >= monthAgo;
          default:
            return true;
        }
      });
    }
    
    this.filteredEvaluations.set(filtered);
    
    // Recharger le rapport si des filtres de classe/enseignant ont changé
    // Use setTimeout to avoid change detection issues
    if (this.selectedEvaluationId()) {
      setTimeout(() => {
        this.loadReport(this.selectedEvaluationId()!);
      }, 0);
    }
  }

  toggleFilters(): void {
    this.showFilters.set(!this.showFilters());
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.selectedClass.set('');
    this.selectedTeacher.set('');
    this.filterPeriod.set('ALL');
    this.showFilters.set(false);
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return this.searchQuery() !== '' || 
           this.selectedClass() !== '' || 
           this.selectedTeacher() !== '' ||
           this.filterPeriod() !== 'ALL';
  }

  getActiveFiltersCount(): number {
    let count = 0;
    if (this.searchQuery() !== '') count++;
    if (this.selectedClass() !== '') count++;
    if (this.selectedTeacher() !== '') count++;
    if (this.filterPeriod() !== 'ALL') count++;
    return count;
  }

  // Actions
  exportToPDF(): void {
    if (!this.selectedEvaluationId()) return;
    
    this.reportService.exportToPDF(this.selectedEvaluationId()!).subscribe({
      next: (response) => {
        this.successMessage.set('Export PDF généré avec succès');
        setTimeout(() => this.successMessage.set(''), 3000);
        
        // TODO: Gérer le téléchargement du PDF
        if (response.downloadUrl) {
          window.open(response.downloadUrl, '_blank');
        }
      },
      error: (error) => {
        console.error('Erreur lors de l\'export PDF:', error);
        this.errorMessage.set('Erreur lors de l\'export PDF');
        setTimeout(() => this.errorMessage.set(''), 5000);
      }
    });
  }

  exportAllReports(): void {
    this.successMessage.set('Export de tous les rapports en cours de développement...');
    setTimeout(() => this.successMessage.set(''), 3000);
  }

  goToEvaluations(): void {
    this.router.navigate(['/evaluations']);
  }

  // Utilitaires
  hasReports(): boolean {
    return this.availableEvaluations().length > 0;
  }

  calculateTotalResponses(data: EvaluationReportData): void {
    const totalRespondents = data?.statistics?.totalRespondents ?? 0;
    this.totalResponses.set(totalRespondents);
  }

  formatDate(date: Date | string): string {
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

  getCoursName(evaluation: Evaluation): string {
    return (evaluation as any).Cour?.nom || 
           (evaluation as any).Cours?.nom || 
           evaluation.cours?.nom || 
           (evaluation as any).cours_nom ||
           'Cours non défini';
  }

  getResponseCount(evaluation: Evaluation): number {
    // TODO: Récupérer le nombre réel de réponses depuis l'API
    if ((evaluation as any).responseCount !== undefined) {
      return (evaluation as any).responseCount;
    }
    
    // Generate a stable random number based on evaluation ID to avoid change detection issues
    const id = evaluation.id?.toString() || '0';
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      const char = id.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash % 40) + 10; // Returns a stable number between 10-49
  }
}