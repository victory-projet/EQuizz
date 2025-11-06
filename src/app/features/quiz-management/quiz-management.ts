import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';

// Composants enfants
import { QuizStatsComponent } from './components/quiz-stats/quiz-stats';
import { QuizFiltersComponent } from './components/quiz-filters/quiz-filters';
import { QuizListComponent } from './components/quiz-list/quiz-list';
import { SearchBar } from '../../shared/components/search-bar/search-bar';

@Component({
  selector: 'app-quiz-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    QuizStatsComponent,
    QuizFiltersComponent,
    QuizListComponent,
    SearchBar
  ],
  templateUrl: './quiz-management.html',
  styleUrls: ['./quiz-management.scss']
})
export class QuizManagementComponent implements OnInit {
  isLoading = false;
  searchTerm = '';
  selectedFilter = 'all';
  quizzes: any[] = [];
  filteredQuizzes: any[] = [];

  filters = [
    { value: 'all', label: 'Tous les quiz', count: 0 },
    { value: 'active', label: 'En cours', count: 0 },
    { value: 'draft', label: 'Brouillons', count: 0 },
    { value: 'closed', label: 'Clôturés', count: 0 }
  ];

  constructor(
    private quizService: QuizService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadQuizzes();
  }

  loadQuizzes(): void {
    this.isLoading = true;
    // Charger les quiz depuis le service
    setTimeout(() => {
      this.quizzes = this.quizService.getQuizzes();
      this.filteredQuizzes = [...this.quizzes];
      this.updateFilterCounts();
      this.applyFilter();
      this.isLoading = false;
    }, 500);
  }

  updateFilterCounts(): void {
    this.filters[0].count = this.quizzes.length;
    this.filters[1].count = this.quizzes.filter(q => q.status === 'active').length;
    this.filters[2].count = this.quizzes.filter(q => q.status === 'draft').length;
    this.filters[3].count = this.quizzes.filter(q => q.status === 'closed').length;
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.applyFilter();
  }

  onFilterChange(filter: string): void {
    this.selectedFilter = filter;
    this.applyFilter();
  }

  applyFilter(): void {
    let filtered = [...this.quizzes];

    // Filtrer par statut
    if (this.selectedFilter !== 'all') {
      filtered = filtered.filter(q => q.status === this.selectedFilter);
    }

    // Filtrer par recherche
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(q =>
        q.title.toLowerCase().includes(term) ||
        q.ue.toLowerCase().includes(term) ||
        q.classes.some((c: string) => c.toLowerCase().includes(term))
      );
    }

    this.filteredQuizzes = filtered;
  }

  onCreateQuiz(): void {
    this.router.navigate(['/quiz-management/create']);
  }
}

// Import nécessaires
import { QuizService } from '../../core/services/quiz';
import { Router } from '@angular/router';
