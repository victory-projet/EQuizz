// src/app/features/evaluation/evaluation.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ModalComponent } from '../../shared/components/modal/modal.component';

interface QuizItem {
  id: string;
  title: string;
  subject: string;
  status: 'En cours' | 'Brouillon' | 'Clôturé';
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
  private router = inject(Router);
  private dialog = inject(MatDialog);

  // Stats
  totalQuizzes = signal(24);
  activeQuizzes = signal(8);
  participationRate = signal(76);
  drafts = signal(5);

  // Filters
  searchTerm = signal('');
  activeFilter = signal<'all' | 'active' | 'draft' | 'closed'>('all');

  // Quizzes
  quizzes = signal<QuizItem[]>([]);
  filteredQuizzes = signal<QuizItem[]>([]);
  isLoading = signal(true);

  // Modals
  showGenerateModal = signal(false);
  showImportModal = signal(false);
  showResultsModal = signal(false);
  showDeleteModal = signal(false);
  selectedQuiz = signal<QuizItem | null>(null);
  selectedFile: File | null = null;

  ngOnInit(): void {
    this.loadQuizzes();
  }

  loadQuizzes(): void {
    this.isLoading.set(true);

    const mockQuizzes: QuizItem[] = [
      {
        id: '1',
        title: 'Évaluation Mi-parcours - Algorithmique',
        subject: 'Algorithmique et Programmation',
        status: 'En cours',
        classes: ['L1 Info A', 'L1 Info B'],
        questions: 15,
        createdDate: '15 Sept 2025',
        endDate: '30 Sept 2025',
        participation: { current: 124, total: 150, percentage: 83 },
        type: 'Mi-parcours'
      },
      {
        id: '2',
        title: 'Évaluation Fin de Semestre - Base de Données',
        subject: 'Base de Données',
        status: 'En cours',
        classes: ['L2 Info'],
        questions: 20,
        createdDate: '10 Oct 2025',
        endDate: '25 Oct 2025',
        participation: { current: 45, total: 80, percentage: 56 },
        type: 'Fin de semestre'
      },
      {
        id: '3',
        title: 'Évaluation Mi-parcours - Réseaux',
        subject: 'Réseaux Informatiques',
        status: 'Brouillon',
        classes: ['L3 Info A', 'L3 Info B'],
        questions: 18,
        createdDate: '12 Oct 2025',
        participation: { current: 0, total: 0, percentage: 0 },
        type: 'Mi-parcours'
      }
    ];

    this.quizzes.set(mockQuizzes);
    this.filteredQuizzes.set(mockQuizzes);
    this.isLoading.set(false);
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
    import('../../components/modals/generate-quiz-modal/generate-quiz-modal.component').then(m => {
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
    import('../../components/modals/import-excel-modal/import-excel-modal.component').then(m => {
      const dialogRef = this.dialog.open(m.ImportExcelModalComponent, {
        width: '800px',
        maxWidth: '95vw',
        panelClass: 'import-excel-dialog'
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result?.success) {
          console.log(`Imported ${result.questionsCount} questions`);
          this.router.navigate(['/quiz/create']);
        }
      });
    });
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

  deleteQuiz(quiz: QuizItem): void {
    this.selectedQuiz.set(quiz);
    this.showDeleteModal.set(true);
  }

  confirmDelete(): void {
    if (this.selectedQuiz()) {
      const updated = this.quizzes().filter(q => q.id !== this.selectedQuiz()!.id);
      this.quizzes.set(updated);
      this.filteredQuizzes.set(updated);
      this.closeAllModals();
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