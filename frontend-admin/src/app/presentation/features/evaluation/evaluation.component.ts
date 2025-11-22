// src/app/presentation/features/evaluation/evaluation.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ToastService } from '../../../core/services/toast.service';

// Clean Architecture - Use Cases
import { GetAllQuizzesUseCase } from '../../../core/application/use-cases/quiz/get-all-quizzes.use-case';
import { DeleteQuizUseCase } from '../../../core/application/use-cases/quiz/delete-quiz.use-case';
import { Quiz } from '../../../core/domain/entities/quiz.entity';

interface QuizDisplay {
  id: string;
  title: string;
  subject: string;
  status: string;
  classes: string[];
  questions: number;
  createdDate: string;
  endDate?: string;
  participation: {
    current: number;
    total: number;
    percentage: number;
  };
  type: string;
}

function mapQuizToDisplay(quiz: Quiz): QuizDisplay {
  const statusMap: Record<string, string> = {
    'draft': 'Brouillon',
    'active': 'En cours',
    'closed': 'Clôturé'
  };

  return {
    id: quiz.id,
    title: quiz.title,
    subject: quiz.subject,
    status: statusMap[quiz.status] || quiz.status,
    classes: quiz.classIds,
    questions: quiz.questions.length,
    createdDate: quiz.createdDate.toLocaleDateString('fr-FR'),
    endDate: quiz.endDate?.toLocaleDateString('fr-FR'),
    participation: {
      current: 0,
      total: 0,
      percentage: 0
    },
    type: quiz.type || 'Standard'
  };
}

@Component({
  selector: 'app-evaluation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    ModalComponent
  ],
  templateUrl: './evaluation.component.html',
  styleUrl: './evaluation.component.scss'
})
export class EvaluationComponent implements OnInit {
  // Clean Architecture - Inject Use Cases
  private getAllQuizzesUseCase = inject(GetAllQuizzesUseCase);
  private deleteQuizUseCase = inject(DeleteQuizUseCase);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  // Stats
  totalQuizzes = signal(0);
  activeQuizzes = signal(0);
  participationRate = signal(76);
  drafts = signal(0);

  // Filters
  searchTerm = signal('');
  activeFilter = signal<'all' | 'active' | 'draft' | 'closed'>('all');

  // Quizzes
  quizzes = signal<QuizDisplay[]>([]);
  filteredQuizzes = signal<QuizDisplay[]>([]);
  isLoading = signal(true);

  // Modals
  showGenerateModal = signal(false);
  showImportModal = signal(false);
  showResultsModal = signal(false);
  showDeleteModal = signal(false);
  selectedQuiz = signal<QuizDisplay | null>(null);
  selectedFile: File | null = null;

  ngOnInit(): void {
    this.loadQuizzes();
  }

  loadQuizzes(): void {
    this.isLoading.set(true);

    this.getAllQuizzesUseCase.execute().subscribe({
      next: (quizzes) => {
        const displayQuizzes = quizzes.map(mapQuizToDisplay);
        this.quizzes.set(displayQuizzes);
        this.filteredQuizzes.set(displayQuizzes);
        this.updateStats(displayQuizzes);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.toastService.error('Erreur lors du chargement des quiz');
        console.error('Error loading quizzes:', error);
        this.isLoading.set(false);
      }
    });
  }

  private updateStats(quizzes: QuizDisplay[]): void {
    this.totalQuizzes.set(quizzes.length);
    this.activeQuizzes.set(quizzes.filter(q => q.status === 'En cours').length);
    this.drafts.set(quizzes.filter(q => q.status === 'Brouillon').length);
  }

  setFilter(filter: 'all' | 'active' | 'draft' | 'closed'): void {
    this.activeFilter.set(filter);
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = this.quizzes();

    if (this.activeFilter() !== 'all') {
      const statusMap: Record<string, string> = {
        active: 'En cours',
        draft: 'Brouillon',
        closed: 'Clôturé'
      };
      filtered = filtered.filter(q => q.status === statusMap[this.activeFilter()]);
    }

    const search = this.searchTerm().toLowerCase();
    if (search) {
      filtered = filtered.filter(q =>
        q.title.toLowerCase().includes(search) ||
        q.subject.toLowerCase().includes(search) ||
        q.classes.some(c => c.toLowerCase().includes(search))
      );
    }

    this.filteredQuizzes.set(filtered);
  }

  getFilterCount(filter: 'all' | 'active' | 'draft' | 'closed'): number {
    if (filter === 'all') return this.quizzes().length;
    const statusMap: Record<string, string> = {
      active: 'En cours',
      draft: 'Brouillon',
      closed: 'Clôturé'
    };
    return this.quizzes().filter(q => q.status === statusMap[filter]).length;
  }

  createQuiz(): void {
    // Ouvrir le modal de génération de quiz
    import('../../shared/components/modals/generate-quiz-modal/generate-quiz-modal.component').then(m => {
      const dialogRef = this.dialog.open(m.GenerateQuizModalComponent, {
        width: '900px',
        maxWidth: '95vw',
        panelClass: 'generate-quiz-dialog'
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          if (result.type === 'manual') {
            this.router.navigate(['/quiz/create']);
          } else if (result.type === 'import') {
            this.openImportModal();
          }
        }
      });
    });
  }

  openImportModal(): void {
    // Fonctionnalité d'import désactivée
    console.log('Import non disponible');
  }

  selectGenerateOption(option: 'manual' | 'import' | 'ai'): void {
    this.showGenerateModal.set(false);
    if (option === 'manual') {
      this.router.navigate(['/quiz/create']);
    } else if (option === 'import') {
      this.openImportModal();
    } else if (option === 'ai') {
      this.router.navigate(['/quiz/create'], { queryParams: { ai: true } });
    }
  }

  viewResults(quizId: string): void {
    const quiz = this.quizzes().find(q => q.id === quizId);
    if (quiz) {
      this.selectedQuiz.set(quiz);
      this.showResultsModal.set(true);
    }
  }

  continueQuiz(quizId: string): void {
    this.router.navigate(['/quiz/create', quizId]);
  }

  deleteQuiz(quiz: QuizDisplay): void {
    this.selectedQuiz.set(quiz);
    this.showDeleteModal.set(true);
  }

  confirmDelete(): void {
    const selected = this.selectedQuiz();
    if (selected) {
      this.deleteQuizUseCase.execute(selected.id).subscribe({
        next: () => {
          this.toastService.success('Quiz supprimé avec succès');
          this.loadQuizzes();
          this.closeAllModals();
        },
        error: (error) => {
          this.toastService.error(error.message || 'Erreur lors de la suppression');
        }
      });
    }
  }

  closeAllModals(): void {
    this.showGenerateModal.set(false);
    this.showImportModal.set(false);
    this.showResultsModal.set(false);
    this.showDeleteModal.set(false);
    this.selectedQuiz.set(null);
    this.selectedFile = null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer?.files.length) {
      this.selectedFile = event.dataTransfer.files[0];
    }
  }

  removeFile(event: MouseEvent): void {
    event.stopPropagation();
    this.selectedFile = null;
  }

  importQuiz(): void {
    if (this.selectedFile) {
      console.log('Import quiz from', this.selectedFile.name);
      this.closeAllModals();
      this.router.navigate(['/quiz/create']);
    }
  }

  exportResults(): void {
    console.log('Export PDF');
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'En cours': 'status-active',
      'Brouillon': 'status-draft',
      'Clôturé': 'status-closed'
    };
    return classes[status] || '';
  }
}