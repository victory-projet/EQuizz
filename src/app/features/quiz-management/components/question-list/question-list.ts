// src/app/features/quiz-management/components/question-list/question-list.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Question } from '../../../../shared/interfaces/quiz.interface';

@Component({
  selector: 'app-question-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatChipsModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './question-list.html',
  styleUrls: ['./question-list.scss']
})
export class QuestionListComponent {
  @Input() questions: Question[] = [];
  @Input() editable: boolean = true;

  // ✅ MÉTHODE CORRECTE POUR OBTENIR LES LETTRES DES OPTIONS
  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index); // A, B, C, D...
  }

  getQuestionTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'multiple': 'Choix multiple',
      'close': 'Vrai/Faux',
      'open': 'Question ouverte'
    };
    return labels[type] || type;
  }

  getQuestionTypeColor(type: string): string {
    const colors: { [key: string]: string } = {
      'multiple': 'primary',
      'close': 'accent',
      'open': 'warn'
    };
    return colors[type] || '';
  }

  getQuestionTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'multiple': 'list',
      'close': 'check_circle',
      'open': 'short_text'
    };
    return icons[type] || 'help';
  }

  onEditQuestion(question: Question) {
    console.log('Modifier la question:', question);
  }

  onDeleteQuestion(question: Question) {
    console.log('Supprimer la question:', question);
  }

  onAddQuestion() {
    console.log('Ajouter une nouvelle question');
  }
}
