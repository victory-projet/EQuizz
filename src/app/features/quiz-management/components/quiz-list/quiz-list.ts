// src/app/features/quiz-management/components/quiz-list/quiz-list.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuizCardComponent } from '../quiz-card/quiz-card';
import { Quiz } from '../../../../shared/interfaces/quiz.interface';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-quiz-list',
  standalone: true,
  imports: [CommonModule,  MatIconModule,QuizCardComponent, MatTooltipModule],
  templateUrl: './quiz-list.html',
  styleUrls: ['./quiz-list.scss']
})
export class QuizListComponent {
  @Input() quizzes: Quiz[] = [];
  @Input() searchTerm: string = '';
  @Input() filter: string = '';

  getEmptyMessage(): string {
    if (this.quizzes.length === 0) {
      return 'Aucun quiz trouvé avec les critères sélectionnés.';
    }
    return '';
  }
}
