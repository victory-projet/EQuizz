import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EvaluationUseCase } from '../../../core/usecases/evaluation.usecase';
import { Evaluation, Question } from '../../../core/domain/entities/evaluation.entity';

@Component({
  selector: 'app-evaluation-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './evaluation-preview.component.html',
  styleUrls: ['./evaluation-preview.component.scss']
})
export class EvaluationPreviewComponent implements OnInit {
  evaluation = signal<Evaluation | null>(null);
  questions = signal<Question[]>([]);
  currentQuestionIndex = signal(0);
  isLoading = signal(false);
  errorMessage = signal('');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private evaluationUseCase: EvaluationUseCase
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEvaluation(id);
    }
  }

  loadEvaluation(id: string | number): void {
    this.isLoading.set(true);
    this.evaluationUseCase.getEvaluation(id).subscribe({
      next: (evaluation) => {
        this.evaluation.set(evaluation);
        this.questions.set(evaluation.quizz?.questions || []);
        this.updateCurrentQuestion();
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set('Erreur lors du chargement de l\'évaluation');
        this.isLoading.set(false);
      }
    });
  }

  currentQuestion = signal<Question | null>(null);
  progress = signal<number>(0);

  private updateCurrentQuestion(): void {
    const questions = this.questions();
    const index = this.currentQuestionIndex();
    this.currentQuestion.set(questions[index] || null);
    
    const total = questions.length;
    const progressValue = total === 0 ? 0 : ((index + 1) / total) * 100;
    this.progress.set(progressValue);
  }

  nextQuestion(): void {
    const index = this.currentQuestionIndex();
    if (index < this.questions().length - 1) {
      this.currentQuestionIndex.set(index + 1);
      this.updateCurrentQuestion();
    }
  }

  previousQuestion(): void {
    const index = this.currentQuestionIndex();
    if (index > 0) {
      this.currentQuestionIndex.set(index - 1);
      this.updateCurrentQuestion();
    }
  }

  goToQuestion(index: number): void {
    if (index >= 0 && index < this.questions().length) {
      this.currentQuestionIndex.set(index);
      this.updateCurrentQuestion();
    }
  }

  close(): void {
    this.router.navigate(['/evaluations', this.evaluation()?.id]);
  }

  getQuestionTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'CHOIX_MULTIPLE': 'QCM',
      'QCM': 'QCM',
      'REPONSE_OUVERTE': 'Réponse ouverte',
      'TEXTE_LIBRE': 'Texte libre',
      'ECHELLE': 'Échelle',
      'OUI_NON': 'Oui/Non'
    };
    return labels[type] || type;
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  // Expose String for template
  String = String;
}
