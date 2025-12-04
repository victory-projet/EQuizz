import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EvaluationUseCase } from '../../../core/usecases/evaluation.usecase';
import { Evaluation } from '../../../core/domain/entities/evaluation.entity';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  evaluations = signal<Evaluation[]>([]);
  filteredEvaluations = signal<Evaluation[]>([]);
  isLoading = signal(false);
  searchTerm = signal('');
  selectedStatus = signal<string>('all');

  constructor(
    private evaluationUseCase: EvaluationUseCase,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEvaluations();
  }

  loadEvaluations(): void {
    this.isLoading.set(true);
    this.evaluationUseCase.getEvaluations().subscribe({
      next: (evaluations) => {
        // Filtrer uniquement les évaluations publiées ou clôturées
        const reportableEvaluations = evaluations.filter(
          e => e.statut === 'PUBLIEE' || e.statut === 'CLOTUREE'
        );
        this.evaluations.set(reportableEvaluations);
        this.applyFilters();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading evaluations:', error);
        this.isLoading.set(false);
      }
    });
  }

  applyFilters(): void {
    let filtered = this.evaluations();

    // Filter by status
    if (this.selectedStatus() !== 'all') {
      filtered = filtered.filter(e => e.statut === this.selectedStatus());
    }

    // Filter by search term
    const search = this.searchTerm().toLowerCase();
    if (search) {
      filtered = filtered.filter(e =>
        e.titre.toLowerCase().includes(search) ||
        e.cours?.nom?.toLowerCase().includes(search) ||
        e.classe?.nom?.toLowerCase().includes(search)
      );
    }

    this.filteredEvaluations.set(filtered);
  }

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    this.applyFilters();
  }

  onStatusChange(status: string): void {
    this.selectedStatus.set(status);
    this.applyFilters();
  }

  viewReport(evaluation: Evaluation): void {
    this.router.navigate(['/reports', evaluation.id]);
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  getStatusBadgeClass(statut: string): string {
    return `badge-${statut.toLowerCase()}`;
  }

  getQuestionCount(evaluation: Evaluation): number {
    return evaluation.quizz?.questions?.length || 0;
  }
}
