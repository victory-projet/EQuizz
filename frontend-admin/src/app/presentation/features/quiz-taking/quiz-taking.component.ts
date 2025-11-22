import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { trigger, transition, style, animate } from '@angular/animations';

interface Question {
  id: string;
  type: 'multiple' | 'open' | 'close';
  text: string;
  options?: string[];
  points: number;
}

interface Answer {
  questionId: string;
  answer: string | number;
}

@Component({
  selector: 'app-quiz-taking',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    MatProgressBarModule
  ],
  templateUrl: './quiz-taking.component.html',
  styleUrls: ['./quiz-taking.component.scss'],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(50px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ])
  ]
})
export class QuizTakingComponent implements OnInit {
  quizId: string = '';
  quizTitle: string = 'Évaluation Mi-parcours - Algorithmique';
  questions: Question[] = [];
  currentQuestionIndex: number = 0;
  answers: Map<string, string | number> = new Map();
  isSubmitted: boolean = false;
  String = String; // Pour utiliser String.fromCharCode dans le template

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.quizId = this.route.snapshot.params['id'];
    this.loadQuiz();
  }

  loadQuiz(): void {
    // Mock data - À remplacer par un appel API
    this.questions = [
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
    ];
  }

  get currentQuestion(): Question {
    return this.questions[this.currentQuestionIndex];
  }

  get progress(): number {
    return ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
  }

  get isFirstQuestion(): boolean {
    return this.currentQuestionIndex === 0;
  }

  get isLastQuestion(): boolean {
    return this.currentQuestionIndex === this.questions.length - 1;
  }

  get answeredCount(): number {
    return this.answers.size;
  }

  nextQuestion(): void {
    if (!this.isLastQuestion) {
      this.currentQuestionIndex++;
    }
  }

  previousQuestion(): void {
    if (!this.isFirstQuestion) {
      this.currentQuestionIndex--;
    }
  }

  goToQuestion(index: number): void {
    this.currentQuestionIndex = index;
  }

  saveAnswer(questionId: string, answer: string | number): void {
    this.answers.set(questionId, answer);
  }

  getAnswer(questionId: string): string | number | undefined {
    return this.answers.get(questionId);
  }

  isQuestionAnswered(questionId: string): boolean {
    return this.answers.has(questionId);
  }

  submitQuiz(): void {
    if (this.answers.size < this.questions.length) {
      const confirmed = confirm(
        `Vous n'avez répondu qu'à ${this.answers.size} question(s) sur ${this.questions.length}. Voulez-vous vraiment soumettre?`
      );
      if (!confirmed) return;
    }

    // Soumettre les réponses
    const submission = {
      quizId: this.quizId,
      answers: Array.from(this.answers.entries()).map(([questionId, answer]) => ({
        questionId,
        answer
      })),
      submittedAt: new Date()
    };

    console.log('Submitting quiz:', submission);
    this.isSubmitted = true;

    // Rediriger après 2 secondes
    setTimeout(() => {
      this.router.navigate(['/dashboard']);
    }, 2000);
  }

  cancel(): void {
    if (confirm('Êtes-vous sûr de vouloir quitter? Vos réponses ne seront pas sauvegardées.')) {
      this.router.navigate(['/dashboard']);
    }
  }

  onTextareaInput(event: Event, questionId: string): void {
    const target = event.target as HTMLTextAreaElement;
    if (target) {
      this.saveAnswer(questionId, target.value);
    }
  }
}
