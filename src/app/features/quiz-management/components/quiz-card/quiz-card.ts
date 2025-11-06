// src/app/features/quiz-management/components/quiz-card/quiz-card.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Quiz } from '../../../../shared/interfaces/quiz.interface';

@Component({
  selector: 'app-quiz-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './quiz-card.html',
  styleUrls: ['./quiz-card.scss']
})
export class QuizCardComponent {
  @Input() quiz!: Quiz;

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
}
