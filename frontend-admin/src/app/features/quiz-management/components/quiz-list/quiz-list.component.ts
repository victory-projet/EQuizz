import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Quiz } from '../../../../core/domain/entities/quiz.entity';
import { QuizCardComponent } from '../quiz-card/quiz-card.component';

@Component({
  selector: 'app-quiz-list',
  standalone: true,
  imports: [CommonModule, QuizCardComponent],
  template: `
    <div class="quiz-list">
      @for (quiz of quizzes(); track quiz.id) {
        <app-quiz-card [quiz]="quiz" />
      } @empty {
        <div class="empty-state">
          <span class="empty-icon">📝</span>
          <h3>Aucun quiz trouvé</h3>
          <p>Créez votre premier quiz pour commencer</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .quiz-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

      .empty-icon {
        font-size: 4rem;
        display: block;
        margin-bottom: 1rem;
      }

      h3 {
        font-size: 1.5rem;
        color: #1a1a1a;
        margin-bottom: 0.5rem;
      }

      p {
        color: #666;
      }
    }
  `]
})
export class QuizListComponent {
  quizzes = input.required<Quiz[]>();
}
