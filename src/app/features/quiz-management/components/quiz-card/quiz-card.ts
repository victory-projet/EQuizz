// src/app/features/quiz-management/components/quiz-card/quiz-card.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { Quiz } from '../../../../shared/interfaces/quiz.interface';
import { QuizService } from '../../../../core/services/quiz';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { QuizPreviewComponent } from '../quiz-preview/quiz-preview.component';

@Component({
  selector: 'app-quiz-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule
  ],
  templateUrl: './quiz-card.html',
  styleUrls: ['./quiz-card.scss']
})
export class QuizCardComponent {
  @Input() quiz!: Quiz;
  @Output() quizUpdated = new EventEmitter<void>();

  constructor(
    private router: Router,
    private quizService: QuizService,
    private dialog: MatDialog
  ) {}

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'active': 'primary',
      'draft': 'warn',
      'completed': 'accent',
      'closed': ''
    };
    return colors[status] || '';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'active': 'En cours',
      'draft': 'Brouillon',
      'completed': 'Terminé',
      'closed': 'Clôturé'
    };
    return labels[status] || status;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'mi-parcours': 'Mi-parcours',
      'fin-semestre': 'Fin de semestre',
      'fin-annee': 'Fin d\'année'
    };
    return labels[type] || type;
  }

  viewResults(): void {
    this.router.navigate(['/quiz-management/results', this.quiz.id]);
  }

  editQuiz(): void {
    this.router.navigate(['/quiz-management/edit', this.quiz.id]);
  }

  previewQuiz(): void {
    if (!this.quiz.questions || this.quiz.questions.length === 0) {
      return;
    }

    this.dialog.open(QuizPreviewComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: {
        quiz: this.quiz,
        questions: this.quiz.questions
      },
      panelClass: 'quiz-preview-dialog-container'
    });
  }

  publishQuiz(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Publier le quiz',
        message: `Êtes-vous sûr de vouloir publier "${this.quiz.title}" ? Les étudiants pourront y accéder.`,
        confirmText: 'Publier',
        cancelText: 'Annuler',
        type: 'info'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.quizService.publishQuiz(this.quiz.id);
        this.quizUpdated.emit();
      }
    });
  }

  unpublishQuiz(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Dépublier le quiz',
        message: `Êtes-vous sûr de vouloir dépublier "${this.quiz.title}" ? Les étudiants ne pourront plus y accéder.`,
        confirmText: 'Dépublier',
        cancelText: 'Annuler',
        type: 'warning'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.quizService.unpublishQuiz(this.quiz.id);
        this.quizUpdated.emit();
      }
    });
  }

  deleteQuiz(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Supprimer le quiz',
        message: `Êtes-vous sûr de vouloir supprimer "${this.quiz.title}" ? Cette action est irréversible.`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.quizService.deleteQuiz(this.quiz.id);
        this.quizUpdated.emit();
      }
    });
  }
}
