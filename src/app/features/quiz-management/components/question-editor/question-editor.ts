import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { Question, QuestionType, QuestionOption } from '../../../../shared/interfaces/quiz.interface';

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
  templateUrl: './question-editor.html',
  styleUrls: ['./question-editor.scss']
})
export class QuestionEditorComponent implements OnInit, OnChanges {
  @Input() question?: Question;
  @Input() index: number = 0;
  @Output() questionChange = new EventEmitter<Partial<Question>>();
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
  }

  ngOnChanges(): void {
    if (this.questionForm && this.question) {
      this.patchFormValues();
    }
  }

  private initForm(): void {
    this.questionForm = this.fb.group({
      type: [this.question?.type || 'multiple', Validators.required],
      text: [this.question?.text || '', [Validators.required, Validators.minLength(10)]],
      points: [this.question?.points || 1, [Validators.required, Validators.min(1), Validators.max(100)]],
      explanation: [this.question?.explanation || ''],
      correctAnswer: [this.question?.correctAnswer || ''],
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

    // Écouter les changements de type
    this.questionForm.get('type')?.valueChanges.subscribe(type => {
      this.onTypeChange(type);
    });

    // Émettre les changements
    this.questionForm.valueChanges.subscribe(() => {
      this.emitChanges();
    });
  }

  private patchFormValues(): void {
    if (!this.question) return;

    this.questionForm.patchValue({
      type: this.question.type,
      text: this.question.text,
      points: this.question.points,
      explanation: this.question.explanation,
      correctAnswer: this.question.correctAnswer
    });
  }

  get options(): FormArray {
    return this.questionForm.get('options') as FormArray;
  }

  get currentType(): QuestionType {
    return this.questionForm.get('type')?.value;
  }

  get isMultiple(): boolean {
    return this.currentType === 'multiple';
  }

  get isClose(): boolean {
    return this.currentType === 'close';
  }

  get isOpen(): boolean {
    return this.currentType === 'open';
  }

  onTypeChange(type: QuestionType): void {
    const optionsArray = this.options;
    
    // Réinitialiser les options
    optionsArray.clear();
    
    if (type === 'multiple') {
      // Ajouter 2 options par défaut pour QCM
      this.addOption('');
      this.addOption('');
      this.questionForm.get('correctAnswer')?.setValue(0);
    } else if (type === 'close') {
      this.questionForm.get('correctAnswer')?.setValue('');
    } else {
      // Question ouverte - pas de réponse correcte
      this.questionForm.get('correctAnswer')?.setValue(null);
    }
  }

  addOption(text: string = ''): void {
    const optionControl = this.fb.control(text, [Validators.required, Validators.minLength(1)]);
    this.options.push(optionControl);
  }

  removeOption(index: number): void {
    if (this.options.length > 2) {
      this.options.removeAt(index);
      
      // Ajuster la réponse correcte si nécessaire
      const correctAnswer = this.questionForm.get('correctAnswer')?.value;
      if (correctAnswer === index) {
        this.questionForm.get('correctAnswer')?.setValue(0);
      } else if (correctAnswer > index) {
        this.questionForm.get('correctAnswer')?.setValue(correctAnswer - 1);
      }
    }
  }

  canAddOption(): boolean {
    return this.isMultiple && this.options.length < 6;
  }

  canRemoveOption(): boolean {
    return this.isMultiple && this.options.length > 2;
  }

  onRemove(): void {
    this.remove.emit(this.index);
  }

  private emitChanges(): void {
    if (this.questionForm.valid) {
      const formValue = this.questionForm.value;
      
      const questionData: Partial<Question> = {
        type: formValue.type,
        text: formValue.text,
        points: formValue.points,
        explanation: formValue.explanation,
        order: this.index
      };

      if (this.isMultiple) {
        questionData.options = formValue.options.map((text: string, idx: number) => ({
          id: this.question?.options?.[idx]?.id || `opt-${Date.now()}-${idx}`,
          text,
          order: idx
        }));
        questionData.correctAnswer = formValue.correctAnswer;
      } else if (this.isClose) {
        questionData.correctAnswer = formValue.correctAnswer;
      }

      this.questionChange.emit(questionData);
    }
  }

  isFormValid(): boolean {
    return this.questionForm.valid;
  }
}
