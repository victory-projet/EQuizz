// src/app/features/quiz-management/components/quiz-editor/quiz-editor.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { QuizService } from '../../../../core/services/quiz';
import { ToastService } from '../../../../core/services/toast.service';
import { Question, QuestionType } from '../../../../shared/interfaces/quiz.interface';
import { QuestionEditorComponent } from '../question-editor/question-editor.component';
import { QuizPreviewComponent } from '../quiz-preview/quiz-preview.component';

@Component({
  selector: 'app-quiz-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatMenuModule,
    DragDropModule,
    QuestionEditorComponent
  ],
  templateUrl: './quiz-editor.html',
  styleUrls: ['./quiz-editor.scss']
})
export class QuizEditorComponent implements OnInit {
  isEditMode = false;
  quizId?: string;
  questions: Question[] = [];
  quiz = {
    title: '',
    ue: '',
    type: 'mi-parcours' as 'mi-parcours' | 'fin-semestre' | 'fin-annee',
    classes: [] as string[],
    endDate: new Date(),
    questionsCount: 0,
    status: 'draft' as const,
    participation: { current: 0, total: 0, rate: 0 },
    createdAt: new Date()
  };

  ueOptions = [
    'Algorithmique et Programmation',
    'Base de Données',
    'Réseaux Informatiques',
    'Mathématiques',
    'Systèmes d\'Information'
  ];

  classOptions = [
    'L1 Info A', 'L1 Info B', 'L2 Info', 'L3 Info A', 'L3 Info B',
    'M1 Info', 'M2 Info'
  ];

  typeOptions = [
    { value: 'mi-parcours', label: 'Mi-parcours' },
    { value: 'fin-semestre', label: 'Fin de semestre' },
    { value: 'fin-annee', label: 'Fin d\'année' }
  ];

  constructor(
    private quizService: QuizService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Vérifier si on est en mode édition
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.quizId = params['id'];
        this.loadQuiz(params['id']);
      }
    });
  }

  loadQuiz(id: string): void {
    const quiz = this.quizService.getQuizById(id);
    if (quiz) {
      this.quiz = {
        title: quiz.title,
        ue: quiz.ue,
        type: quiz.type,
        classes: quiz.classes,
        endDate: quiz.endDate,
        questionsCount: quiz.questionsCount,
        status: 'draft' as const,
        participation: quiz.participation,
        createdAt: quiz.createdAt
      };
      this.questions = quiz.questions || [];
    }
  }

  addQuestion(type: QuestionType): void {
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      quizId: this.quizId || '',
      type,
      text: '',
      order: this.questions.length + 1,
      points: 1,
      createdAt: new Date()
    };
    this.questions.push(newQuestion);
  }

  onQuestionChange(question: Question, index: number): void {
    this.questions[index] = question;
    this.quiz.questionsCount = this.questions.length;
  }

  removeQuestion(index: number): void {
    this.questions.splice(index, 1);
    // Réorganiser les ordres
    this.questions.forEach((q, i) => {
      q.order = i + 1;
    });
    this.quiz.questionsCount = this.questions.length;
  }

  dropQuestion(event: CdkDragDrop<Question[]>): void {
    moveItemInArray(this.questions, event.previousIndex, event.currentIndex);
    // Mettre à jour les ordres
    this.questions.forEach((q, i) => {
      q.order = i + 1;
    });
  }

  saveQuiz(): void {
    // Validation
    if (!this.quiz.title || !this.quiz.ue || this.quiz.classes.length === 0) {
      this.toastService.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (this.questions.length === 0) {
      this.toastService.warning('Ajoutez au moins une question au quiz');
      return;
    }

    // Vérifier que toutes les questions sont valides
    const invalidQuestions = this.questions.filter(q => !q.text || q.text.length < 10);
    if (invalidQuestions.length > 0) {
      this.toastService.error('Certaines questions sont incomplètes');
      return;
    }

    const quizData = {
      ...this.quiz,
      questions: this.questions,
      questionsCount: this.questions.length
    };

    if (this.isEditMode && this.quizId) {
      this.quizService.updateQuiz(this.quizId, quizData);
    } else {
      this.quizService.createQuiz(quizData);
    }

    this.router.navigate(['/quiz-management']);
  }

  previewQuiz(): void {
    if (this.questions.length === 0) {
      this.toastService.warning('Ajoutez au moins une question pour prévisualiser');
      return;
    }

    // Vérifier que les questions ont du contenu
    const validQuestions = this.questions.filter(q => q.text && q.text.trim().length > 0);
    if (validQuestions.length === 0) {
      this.toastService.warning('Complétez au moins une question pour prévisualiser');
      return;
    }

    // Ouvrir la modale de prévisualisation
    this.dialog.open(QuizPreviewComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: {
        quiz: this.quiz,
        questions: validQuestions
      },
      panelClass: 'quiz-preview-dialog-container'
    });
  }

  cancel(): void {
    this.router.navigate(['/quiz-management']);
  }
}
