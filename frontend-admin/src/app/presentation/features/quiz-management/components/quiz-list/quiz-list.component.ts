import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../../../shared/components/svg-icon/svg-icon';
import { Quiz } from '../../../../../core/domain/entities/quiz.entity';
import { QuizCardComponent } from '../quiz-card/quiz-card.component';

@Component({
  selector: 'app-quiz-list',
  standalone: true,
  imports: [CommonModule, SvgIconComponent, QuizCardComponent],
  template: `
    <div class="quiz-list">
      @for (quiz of quizzes(); track quiz.id) {
        <app-quiz-card 
          [quiz]="quiz" 
          (quizDeleted)="onQuizDeleted($event)"
          (quizUpdated)="onQuizUpdated()"
        />
      } @empty {
        <div class="empty-state">
          <app-svg-icon name="Inbox" size="xl" />
          <h3>Aucun quiz trouvé</h3>
          <p>Créez votre premier quiz pour commencer</p>
        </div>
      }
    </div>
  `,
  styles: [`
    @import '../../../../../../styles.scss';

    .quiz-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: $spacing-6;

      @media (max-width: $breakpoint-sm) {
        grid-template-columns: 1fr;
      }
    }

    .empty-state {
      grid-column: 1 / -1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: $spacing-16 $spacing-8;
      background: $bg-primary;
      border-radius: $radius-lg;
      box-shadow: $shadow-sm;
      color: $text-tertiary;

      app-svg-icon {
        margin-bottom: $spacing-6;
      }

      h3 {
        font-size: $text-2xl;
        font-weight: $font-semibold;
        color: $text-primary;
        margin: 0 0 $spacing-2 0;
      }

      p {
        font-size: $text-base;
        color: $text-secondary;
        margin: 0;
      }
    }
  `]
})
export class QuizListComponent {
  quizzes = input.required<Quiz[]>();
  quizDeleted = output<string>();
  quizUpdated = output<void>();

  onQuizDeleted(quizId: string): void {
    this.quizDeleted.emit(quizId);
  }

  onQuizUpdated(): void {
    this.quizUpdated.emit();
  }
}
