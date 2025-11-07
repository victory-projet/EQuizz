import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuizService } from '../../core/services/quiz.service';
import { Quiz } from '../../core/models/quiz.interface';
import { QuizListComponent } from './components/quiz-list/quiz-list.component';
import { QuizFiltersComponent } from './components/quiz-filters/quiz-filters.component';

@Component({
  selector: 'app-quiz-management',
  standalone: true,
  imports: [CommonModule, QuizListComponent, QuizFiltersComponent],
  templateUrl: './quiz-management.component.html',
  styleUrl: './quiz-management.component.scss'
})
export class QuizManagementComponent implements OnInit {
  private quizService = inject(QuizService);
  
  quizzes = signal<Quiz[]>([]);
  filteredQuizzes = signal<Quiz[]>([]);
  isLoading = signal(true);

  ngOnInit(): void {
    this.loadQuizzes();
  }

  loadQuizzes(): void {
    this.isLoading.set(true);
    this.quizService.getQuizzes().subscribe({
      next: (quizzes) => {
        this.quizzes.set(quizzes);
        this.filteredQuizzes.set(quizzes);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading quizzes:', error);
        this.isLoading.set(false);
      }
    });
  }

  onFilterChange(filters: any): void {
    let filtered = this.quizzes();

    if (filters.search) {
      filtered = filtered.filter(q => 
        q.title.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.status) {
      filtered = filtered.filter(q => q.status === filters.status);
    }

    this.filteredQuizzes.set(filtered);
  }

  onCreateQuiz(): void {
    // Navigation vers création de quiz
  }
}
