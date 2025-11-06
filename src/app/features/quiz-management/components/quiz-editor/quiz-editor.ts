// src/app/features/quiz-management/components/quiz-editor/quiz-editor.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms'; // Déjà présent - c'est bon

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
    MatNativeDateModule
  ],
  templateUrl: './quiz-editor.html',
  styleUrls: ['./quiz-editor.scss']
})
export class QuizEditorComponent {
  quiz = {
    title: '',
    ue: '',
    type: 'mi-parcours',
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
    private router: Router
  ) {}

  saveQuiz(): void {
    if (this.quiz.title && this.quiz.ue && this.quiz.classes.length > 0) {
      this.quizService.createQuiz(this.quiz);
      alert('Quiz créé avec succès !');
      this.router.navigate(['/quiz-management']);
    } else {
      alert('Veuillez remplir tous les champs obligatoires');
    }
  }

  cancel(): void {
    this.router.navigate(['/quiz-management']);
  }
}

// Import nécessaires
import { QuizService } from '../../../../core/services/quiz';
import { Router } from '@angular/router';
