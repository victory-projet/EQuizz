import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

import { Quiz } from '../../shared/interfaces/dashboard.interface';
import { ModalService } from '../../core/services/modal.service';
import { QuizService } from '../../core/services/quiz.service';

@Component({
  selector: 'app-evaluation',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule
  ],
  templateUrl: './evaluation.html',
  styleUrls: ['./evaluation.scss'],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(50, [
            animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('scaleIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class EvaluationComponent implements OnInit {
  quizzes: Quiz[] = [];
  filteredQuizzes: Quiz[] = [];
  searchQuery: string = '';
  selectedFilter: string = 'all';

  stats = {
    total: 0,
    active: 0,
    participationRate: '+12%',
    drafts: 0
  };

  constructor(
    private modalService: ModalService,
    private quizService: QuizService
  ) {}

  ngOnInit(): void {
    this.loadQuizzes();
  }

  loadQuizzes(): void {
    this.quizService.getQuizzes().subscribe(quizzes => {
      this.quizzes = quizzes;
      this.filteredQuizzes = quizzes;
      this.updateStats();
    });
  }

  updateStats(): void {
    this.stats.total = this.quizzes.length;
    this.stats.active = this.quizzes.filter(q => q.status === 'En cours').length;
    this.stats.drafts = this.quizzes.filter(q => q.status === 'Brouillon').length;
  }

  onSearch(): void {
    this.applyFilters();
  }

  setFilter(filter: string): void {
    this.selectedFilter = filter;
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = this.quizzes;

    // Filtre par recherche
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(quiz =>
        quiz.title.toLowerCase().includes(query) ||
        quiz.ue.toLowerCase().includes(query) ||
        quiz.classes.some(c => c.toLowerCase().includes(query))
      );
    }

    // Filtre par statut
    if (this.selectedFilter !== 'all') {
      const statusMap: { [key: string]: string } = {
        'active': 'En cours',
        'draft': 'Brouillon',
        'closed': 'Clôturé'
      };
      filtered = filtered.filter(quiz => quiz.status === statusMap[this.selectedFilter]);
    }

    this.filteredQuizzes = filtered;
  }

  getFilterCount(filter: string): number {
    if (filter === 'all') return this.quizzes.length;
    const statusMap: { [key: string]: string } = {
      'active': 'En cours',
      'draft': 'Brouillon',
      'closed': 'Clôturé'
    };
    return this.quizzes.filter(q => q.status === statusMap[filter]).length;
  }

  onGenerateQuiz(): void {
    this.modalService.openGenerateQuiz().subscribe(result => {
      if (result) {
        if (result.type === 'manual') {
          // Ouvrir le modal de création manuelle
          this.modalService.openCreate().subscribe(createResult => {
            if (createResult) {
              this.quizService.createQuiz(createResult).subscribe(() => {
                this.loadQuizzes();
              });
            }
          });
        } else if (result.type === 'import') {
          // Ouvrir le modal d'import Excel
          this.modalService.openImportExcel().subscribe(importResult => {
            if (importResult && importResult.questions) {
              console.log('Questions importées:', importResult.questions);
              // Créer le quiz avec les questions importées
              this.loadQuizzes();
            }
          });
        }
      }
    });
  }

  onCreateQuiz(): void {
    this.modalService.openCreate().subscribe(result => {
      if (result) {
        this.quizService.createQuiz(result).subscribe(() => {
          this.loadQuizzes();
        });
      }
    });
  }

  onViewQuiz(quiz: Quiz): void {
    this.modalService.openPreview(quiz).subscribe();
  }

  onEditQuiz(quiz: Quiz): void {
    this.modalService.openEdit(quiz).subscribe(result => {
      if (result) {
        this.quizService.updateQuiz(quiz.id, result).subscribe(() => {
          this.loadQuizzes();
        });
      }
    });
  }

  onPublishQuiz(quiz: Quiz): void {
    this.modalService.openPublish(quiz).subscribe(result => {
      if (result?.confirmed) {
        this.quizService.publishQuiz(quiz.id).subscribe(() => {
          this.loadQuizzes();
        });
      }
    });
  }

  onDeleteQuiz(quiz: Quiz): void {
    this.modalService.openDelete(quiz).subscribe(result => {
      if (result?.confirmed) {
        this.quizService.deleteQuiz(quiz.id).subscribe(() => {
          this.loadQuizzes();
        });
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'En cours':
        return 'primary';
      case 'Brouillon':
        return 'accent';
      case 'Clôturé':
        return 'warn';
      default:
        return 'primary';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'En cours':
        return 'status-active';
      case 'Brouillon':
        return 'status-draft';
      case 'Clôturé':
        return 'status-closed';
      default:
        return '';
    }
  }
}
