import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { QuizListComponent } from './components/quiz-list/quiz-list.component';
import { QuizFiltersComponent } from './components/quiz-filters/quiz-filters.component';
import { ToastService } from '../../core/services/toast.service';

// Clean Architecture - Use Cases
import { GetAllQuizzesUseCase } from '../../core/domain/use-cases/quiz/get-all-quizzes.use-case';
import { DeleteQuizUseCase } from '../../core/domain/use-cases/quiz/delete-quiz.use-case';
import { PublishQuizUseCase } from '../../core/domain/use-cases/quiz/publish-quiz.use-case';
import { Quiz } from '../../core/domain/entities/quiz.entity';

@Component({
  selector: 'app-quiz-management',
  standalone: true,
  imports: [CommonModule, QuizListComponent, QuizFiltersComponent],
  templateUrl: './quiz-management.component.html',
  styleUrl: './quiz-management.component.scss'
})
export class QuizManagementComponent implements OnInit {
  // Clean Architecture - Inject Use Cases (not repositories)
  private getAllQuizzesUseCase = inject(GetAllQuizzesUseCase);
  private deleteQuizUseCase = inject(DeleteQuizUseCase);
  private publishQuizUseCase = inject(PublishQuizUseCase);
  private toastService = inject(ToastService);
  private router = inject(Router);
  
  quizzes = signal<Quiz[]>([]);
  filteredQuizzes = signal<Quiz[]>([]);
  isLoading = signal(true);

  ngOnInit(): void {
    this.loadQuizzes();
  }

  loadQuizzes(): void {
    this.isLoading.set(true);
    this.getAllQuizzesUseCase.execute().subscribe({
      next: (quizzes) => {
        this.quizzes.set(quizzes);
        this.filteredQuizzes.set(quizzes);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.toastService.error('Erreur lors du chargement des quiz');
        console.error('Error loading quizzes:', error);
        this.isLoading.set(false);
      }
    });
  }

  onFilterChange(filters: any): void {
    let filtered = this.quizzes();

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(q => 
        q.title.toLowerCase().includes(search) ||
        q.subject.toLowerCase().includes(search)
      );
    }

    if (filters.status) {
      filtered = filtered.filter(q => q.status === filters.status);
    }

    this.filteredQuizzes.set(filtered);
  }

  onCreateQuiz(): void {
    this.router.navigate(['/quiz/create']);
  }

  onEditQuiz(quizId: string): void {
    this.router.navigate(['/quiz/edit', quizId]);
  }

  onPublishQuiz(quizId: string): void {
    this.publishQuizUseCase.execute(quizId).subscribe({
      next: () => {
        this.toastService.success('Quiz publié avec succès');
        this.loadQuizzes();
      },
      error: (error) => {
        this.toastService.error(error.message || 'Erreur lors de la publication');
      }
    });
  }

  onDeleteQuiz(quizId: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce quiz ?')) {
      this.deleteQuizUseCase.execute(quizId).subscribe({
        next: () => {
          this.toastService.success('Quiz supprimé avec succès');
          this.loadQuizzes();
        },
        error: (error) => {
          this.toastService.error('Erreur lors de la suppression');
          console.error('Error deleting quiz:', error);
        }
      });
    }
  }
}
