import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AcademicService } from '../../core/services/academic.service';
import { ModalService } from '../../core/services/modal.service';
import { ToastService } from '../../core/services/toast.service';

// Clean Architecture - Use Cases
import { CreateQuizUseCase } from '../../core/domain/use-cases/quiz/create-quiz.use-case';
import { Quiz, Question, QuestionOption } from '../../core/domain/entities/quiz.entity';

interface LocalQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  text: string;
  options?: LocalQuestionOption[];
  correctAnswer?: number | string;
  points: number;
  order: number;
}

interface LocalQuestionOption {
  text: string;
  isCorrect: boolean;
}

@Component({
  selector: 'app-quiz-creation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quiz-creation.component.html',
  styleUrls: ['./quiz-creation.component.scss']
})
export class QuizCreationComponent implements OnInit {
  private router = inject(Router);
  private createQuizUseCase = inject(CreateQuizUseCase);
  private academicService = inject(AcademicService);
  private modalService = inject(ModalService);
  private toastService = inject(ToastService);

  // Quiz data
  quizTitle = signal('');
  quizDescription = signal('');
  selectedAcademicYear = signal('');
  selectedSubject = signal('');
  
  // Questions
  questions = signal<LocalQuestion[]>([]);
  currentStep = signal<'info' | 'questions' | 'preview'>('info');
  
  // Current question being edited
  questionText = signal('');
  questionType = signal<'multiple_choice' | 'true_false' | 'short_answer'>('multiple_choice');
  questionPoints = signal(1);
  questionOptions = signal<LocalQuestionOption[]>([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false }
  ]);

  // Data
  academicYears = signal<any[]>([]);
  subjects = signal<any[]>([]);
  isLoading = signal(false);
  isSaving = signal(false);

  questionTypes = [
    { value: 'multiple_choice', label: 'Choix Multiple (QCM)' },
    { value: 'true_false', label: 'Vrai/Faux' },
    { value: 'short_answer', label: 'Réponse Courte' }
  ];

  ngOnInit(): void {
    console.log('QuizCreationComponent initialized');
    this.loadAcademicYears();
    this.loadSubjects();
  }

  loadAcademicYears(): void {
    console.log('Loading academic years...');
    this.isLoading.set(true);
    this.academicService.getAcademicYears().subscribe({
      next: (years) => {
        console.log('Academic years loaded:', years);
        this.academicYears.set(years);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading academic years:', err);
        this.isLoading.set(false);
      }
    });
  }

  loadSubjects(): void {
    console.log('Loading subjects...');
    this.academicService.getSubjects().subscribe({
      next: (subjects) => {
        console.log('Subjects loaded:', subjects);
        this.subjects.set(subjects);
      },
      error: (err) => console.error('Error loading subjects:', err)
    });
  }

  onAcademicYearChange(): void {
    const yearId = this.selectedAcademicYear();
    console.log('Academic year changed:', yearId);
    if (yearId) {
      this.academicService.getSubjects(yearId).subscribe({
        next: (subjects) => {
          console.log('Subjects for year loaded:', subjects);
          this.subjects.set(subjects);
        },
        error: (err) => console.error('Error loading subjects:', err)
      });
    }
  }

  addQuestion(): void {
    if (!this.questionText()) {
      this.modalService.alert('Erreur', 'Veuillez saisir le texte de la question');
      return;
    }

    const question: LocalQuestion = {
      id: Date.now().toString(),
      type: this.questionType(),
      text: this.questionText(),
      points: this.questionPoints(),
      order: this.questions().length + 1,
      options: this.questionType() === 'multiple_choice' 
        ? this.questionOptions().filter(o => o.text.trim() !== '')
        : undefined
    };

    this.questions.update(q => [...q, question]);
    this.resetCurrentQuestion();
  }

  removeQuestion(index: number): void {
    this.questions.update(q => q.filter((_, i) => i !== index));
  }

  resetCurrentQuestion(): void {
    this.questionText.set('');
    this.questionType.set('multiple_choice');
    this.questionPoints.set(1);
    this.questionOptions.set([
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ]);
  }

  nextStep(): void {
    if (this.currentStep() === 'info') {
      if (!this.quizTitle() || !this.selectedAcademicYear() || !this.selectedSubject()) {
        this.modalService.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
        return;
      }
      this.currentStep.set('questions');
    } else if (this.currentStep() === 'questions') {
      if (this.questions().length === 0) {
        this.modalService.alert('Erreur', 'Veuillez ajouter au moins une question');
        return;
      }
      this.currentStep.set('preview');
    }
  }

  previousStep(): void {
    if (this.currentStep() === 'questions') {
      this.currentStep.set('info');
    } else if (this.currentStep() === 'preview') {
      this.currentStep.set('questions');
    }
  }

  async saveAsDraft(): Promise<void> {
    await this.saveQuiz('draft');
  }

  async publishQuiz(): Promise<void> {
    const confirmed = await this.modalService.confirm(
      'Publier le quiz',
      'Êtes-vous sûr de vouloir publier ce quiz ? Il sera visible par les étudiants.'
    );
    
    if (confirmed) {
      await this.saveQuiz('active');
    }
  }

  private async saveQuiz(status: 'draft' | 'active'): Promise<void> {
    this.isSaving.set(true);

    // Créer l'entité Quiz
    const quiz = new Quiz(
      `quiz-${Date.now()}`,
      this.quizTitle(),
      this.selectedSubject(),
      status,
      [], // Les questions seront ajoutées après
      ['class-1'], // TODO: Sélectionner les classes
      new Date(),
      undefined,
      'Évaluation'
    );

    this.createQuizUseCase.execute(quiz).subscribe({
      next: (createdQuiz) => {
        this.isSaving.set(false);
        const message = status === 'active' 
          ? 'Quiz publié avec succès !' 
          : 'Quiz enregistré comme brouillon';
        
        this.toastService.success(message);
        
        // Délai pour permettre au toast de s'afficher avant la navigation
        setTimeout(() => {
          this.router.navigate(['/quiz-management']);
        }, 1500);
      },
      error: (err) => {
        this.isSaving.set(false);
        this.toastService.error('Impossible de sauvegarder le quiz');
        console.error('Error saving quiz:', err);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/quiz-management']);
  }

  getTotalPoints(): number {
    return this.questions().reduce((sum, q) => sum + q.points, 0);
  }

  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index); // A, B, C, D...
  }
}
