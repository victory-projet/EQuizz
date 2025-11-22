import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SvgIconComponent } from '../../shared/components/svg-icon/svg-icon';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { QuizListComponent } from './components/quiz-list/quiz-list.component';
import { CreationMethodModalComponent, CreationMethod } from '../quiz-creation/components/creation-method-modal/creation-method-modal.component';
import { ExcelImportModalComponent } from '../quiz-creation/components/excel-import-modal/excel-import-modal.component';
import { ToastService } from '../../../core/services/toast.service';
import { ModalService } from '../../../core/services/modal.service';

// Clean Architecture - Use Cases
import { GetAllQuizzesUseCase } from '../../../core/application/use-cases/quiz/get-all-quizzes.use-case';
import { DeleteQuizUseCase } from '../../../core/application/use-cases/quiz/delete-quiz.use-case';
import { PublishQuizUseCase } from '../../../core/application/use-cases/quiz/publish-quiz.use-case';
import { Quiz } from '../../../core/domain/entities/quiz.entity';

@Component({
  selector: 'app-quiz-management',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    SvgIconComponent,
    LoadingSpinnerComponent,
    QuizListComponent, 
    CreationMethodModalComponent, 
    ExcelImportModalComponent
  ],
  templateUrl: './quiz-management.component.html',
  styleUrl: './quiz-management.component.scss'
})
export class QuizManagementComponent implements OnInit {
  // Clean Architecture - Inject Use Cases (not repositories)
  private getAllQuizzesUseCase = inject(GetAllQuizzesUseCase);
  private deleteQuizUseCase = inject(DeleteQuizUseCase);
  private publishQuizUseCase = inject(PublishQuizUseCase);
  private toastService = inject(ToastService);
  private modalService = inject(ModalService);
  private router = inject(Router);
  
  quizzes = signal<Quiz[]>([]);
  filteredQuizzes = signal<Quiz[]>([]);
  isLoading = signal(true);
  searchTerm = '';
  currentFilter = signal<'all' | 'active' | 'draft' | 'closed'>('all');
  showMethodModal = signal(false);
  showExcelImportModal = signal(false);

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
    // Ouvrir le modal de choix de méthode
    this.showMethodModal.set(true);
  }

  onMethodSelected(method: CreationMethod): void {
    this.showMethodModal.set(false);
    
    if (method === 'manual') {
      // Création manuelle : rediriger vers la page de création
      this.router.navigate(['/quiz/create']);
    } else if (method === 'excel') {
      // Import Excel : ouvrir le modal d'import
      this.showExcelImportModal.set(true);
    }
  }

  closeMethodModal(): void {
    this.showMethodModal.set(false);
  }

  closeExcelImportModal(): void {
    this.showExcelImportModal.set(false);
  }

  onExcelImport(parsedQuestions: any[]): void {
    this.showExcelImportModal.set(false);
    
    // Rediriger vers la page de création avec les questions importées
    // On peut passer les questions via le state du router
    this.router.navigate(['/quiz/create'], {
      state: { importedQuestions: parsedQuestions }
    });
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

  onQuizDeleted(quizId: string): void {
    // Recharger la liste après suppression
    this.loadQuizzes();
  }

  getTotalQuizzes(): number {
    return this.quizzes().length;
  }

  getActiveQuizzes(): number {
    return this.quizzes().filter(q => q.status === 'active').length;
  }

  getDraftQuizzes(): number {
    return this.quizzes().filter(q => q.status === 'draft').length;
  }

  getCompletedQuizzes(): number {
    return this.quizzes().filter(q => q.status === 'closed').length;
  }

  setFilter(filter: 'all' | 'active' | 'draft' | 'closed'): void {
    this.currentFilter.set(filter);
    this.applyFilters();
  }

  onSearch(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = this.quizzes();

    // Filtre par statut
    if (this.currentFilter() !== 'all') {
      filtered = filtered.filter(q => q.status === this.currentFilter());
    }

    // Filtre par recherche
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(q => 
        q.title.toLowerCase().includes(search) ||
        q.subject.toLowerCase().includes(search)
      );
    }

    this.filteredQuizzes.set(filtered);
  }
}
