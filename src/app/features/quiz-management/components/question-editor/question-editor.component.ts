import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { Question, QuestionType } from '../../../../shared/interfaces/quiz.interface';

@Component({
  selector: 'app-question-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule
  ],
  templateUrl: './question-editor.component.html',
  styleUrls: ['./question-editor.component.scss']
})
export class QuestionEditorComponent implements OnInit {
  @Input() question?: Question;
  @Input() index: number = 0;
  @Output() questionChange = new EventEmitter<Question>();
  @Output() remove = new EventEmitter<number>();

  questionForm!: FormGroup;
  
  questionTypes: { value: QuestionType; label: string }[] = [
    { value: 'multiple', label: 'QCM (Choix multiples)' },
    { value: 'close', label: 'Question fermée' },
    { value: 'open', label: 'Question ouverte' }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
    
    // Écouter les changements de type pour adapter le formulaire
    this.questionForm.get('type')?.valueChanges.subscribe(type => {
      this.onTypeChange(type);
    });
  }

  initForm(): void {
    this.questionForm = this.fb.group({
      id: [this.question?.id || this.generateId()],
      type: [this.question?.type || 'multiple', Validators.required],
      text: [this.question?.text || '', [Validators.required, Validators.minLength(10)]],
      points: [this.question?.points || 1, [Validators.required, Validators.min(1)]],
      explanation: [this.question?.explanation || ''],
      correctAnswer: [this.question?.correctAnswer],
      options: this.fb.array([])
    });

    // Initialiser les options si c'est un QCM
    if (this.question?.type === 'multiple' && this.question.options) {
      this.question.options.forEach(option => {
        this.addOption(option.text);
      });
    } else if (!this.question || this.question.type === 'multiple') {
      // Ajouter 2 options par défaut pour un nouveau QCM
      this.addOption('');
      this.addOption('');
    }
  }

  get options(): FormArray {
    return this.questionForm.get('options') as FormArray;
  }

  get currentType(): QuestionType {
    return this.questionForm.get('type')?.value;
  }

  onTypeChange(type: QuestionType): void {
    const optionsArray = this.options;
    
    if (type === 'multiple') {
      // Ajouter des options si nécessaire
      if (optionsArray.length === 0) {
        this.addOption('');
        this.addOption('');
      }
      this.questionForm.get('correctAnswer')?.setValidators(Validators.required);
    } else if (type === 'close') {
      // Vider les options et demander une réponse
      optionsArray.clear();
      this.questionForm.get('correctAnswer')?.setValidators([Validators.required]);
    } else {
      // Question ouverte : pas de réponse correcte
      optionsArray.clear();
      this.questionForm.get('correctAnswer')?.clearValidators();
      this.questionForm.get('correctAnswer')?.setValue(null);
    }
    
    this.questionForm.get('correctAnswer')?.updateValueAndValidity();
  }

  addOption(text: string = ''): void {
    if (this.options.length < 6) {
      this.options.push(this.fb.control(text, Validators.required));
    }
  }

  removeOption(index: number): void {
    if (this.options.length > 2) {
      this.options.removeAt(index);
      
      // Ajuster la réponse correcte si nécessaire
      const correctAnswer = this.questionForm.get('correctAnswer')?.value;
      if (correctAnswer === index) {
        this.questionForm.get('correctAnswer')?.setValue(null);
      } else if (correctAnswer > index) {
        this.questionForm.get('correctAnswer')?.setValue(correctAnswer - 1);
      }
    }
  }

  onSubmit(): void {
    if (this.questionForm.valid) {
      const formValue = this.questionForm.value;
      
      const question: Question = {
        id: formValue.id,
        quizId: this.question?.quizId || '',
        type: formValue.type,
        text: formValue.text,
        order: this.question?.order || this.index + 1,
        points: formValue.points,
        explanation: formValue.explanation,
        correctAnswer: formValue.correctAnswer,
        createdAt: this.question?.createdAt || new Date()
      };

      // Ajouter les options pour les QCM
      if (formValue.type === 'multiple') {
        question.options = formValue.options.map((text: string, i: number) => ({
          id: `opt-${question.id}-${i}`,
          text,
          order: i
        }));
      }

      this.questionChange.emit(question);
    }
  }

  onRemove(): void {
    this.remove.emit(this.index);
  }

  private generateId(): string {
    return `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
