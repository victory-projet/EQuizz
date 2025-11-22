import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SvgIconComponent } from '../../shared/components/svg-icon/svg-icon';

interface Question {
  id: string;
  type: 'multiple' | 'open' | 'close';
  text: string;
  options?: string[];
  points: number;
}

@Component({
  selector: 'app-quiz-preview',
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  templateUrl: './quiz-preview.component.html',
  styleUrls: ['./quiz-preview.component.scss']
})
export class QuizPreviewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  quizId = signal('');
  quizTitle = signal('Aperçu du Quiz');
  quizDescription = signal('');
  questions = signal<Question[]>([]);
  currentQuestionIndex = signal(0);

  ngOnInit(): void {
    this.quizId.set(this.route.snapshot.params['id']);
    this.loadQuiz();
  }

  loadQuiz(): void {
    // Mock data - À remplacer par un appel API
    this.quizTitle.set('Évaluation Mi-parcours - Algorithmique');
    this.quizDescription.set('Ce quiz évalue vos connaissances en algorithmique');
    this.questions.set([
      {
        id: '1',
        type: 'multiple',
        text: 'Quelle est la complexité temporelle de l\'algorithme de tri rapide (QuickSort) dans le cas moyen?',
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
        points: 2
      },
      {
        id: '2',
        type: 'close',
        text: 'Un arbre binaire de recherche garantit toujours une complexité O(log n) pour la recherche.',
        options: ['Vrai', 'Faux'],
        points: 1
      },
      {
        id: '3',
        type: 'open',
        text: 'Expliquez brièvement la différence entre un algorithme itératif et un algorithme récursif.',
        points: 3
      }
    ]);
  }

  get currentQuestion(): Question {
    return this.questions()[this.currentQuestionIndex()];
  }

  get isFirstQuestion(): boolean {
    return this.currentQuestionIndex() === 0;
  }

  get isLastQuestion(): boolean {
    return this.currentQuestionIndex() === this.questions().length - 1;
  }

  nextQuestion(): void {
    if (!this.isLastQuestion) {
      this.currentQuestionIndex.update(i => i + 1);
    }
  }

  previousQuestion(): void {
    if (!this.isFirstQuestion) {
      this.currentQuestionIndex.update(i => i - 1);
    }
  }

  goToQuestion(index: number): void {
    this.currentQuestionIndex.set(index);
  }

  close(): void {
    this.router.navigate(['/quiz-management']);
  }

  getQuestionTypeBadge(type: string): string {
    const badges: Record<string, string> = {
      multiple: 'QCM',
      close: 'Vrai/Faux',
      open: 'Question Ouverte'
    };
    return badges[type] || type;
  }

  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }

  getTotalPoints(): number {
    return this.questions().reduce((sum, q) => sum + q.points, 0);
  }
}
