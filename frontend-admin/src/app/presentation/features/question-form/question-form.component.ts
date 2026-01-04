import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
<<<<<<< Updated upstream
import { FormsModule } from '@angular/forms';
import { EvaluationUseCase } from '../../../core/usecases/evaluation.usecase';
import { Question } from '../../../core/domain/entities/question.entity';
=======
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { Question } from '../../../core/domain/entities/evaluation.entity';
>>>>>>> Stashed changes

@Component({
  selector: 'app-question-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './question-form.component.html',
  styleUrls: ['./question-form.component.scss']
})
export class QuestionFormComponent {
  @Input() quizzId?: string | number;
  @Input() evaluationId?: string | number;
  @Input() question?: Question | null;
  @Input() questionNumber?: number;
  @Output() questionCreated = new EventEmitter<Question>();
  @Output() saved = new EventEmitter<Question>();
  @Output() cancelled = new EventEmitter<void>();

  questionForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');

<<<<<<< Updated upstream
  formData = {
    enonce: '',
    type: 'QCM' as 'QCM' | 'VRAI_FAUX' | 'TEXTE_LIBRE' | 'NUMERIQUE' | 'OUI_NON' | 'ECHELLE',
    options: ['', '', '', ''],
    ordre: 1
  };
=======
  questionTypes = [
    { value: 'CHOIX_MULTIPLE', label: 'Choix multiples' },
    { value: 'REPONSE_OUVERTE', label: 'Réponse ouverte' }
  ];
>>>>>>> Stashed changes

  constructor(private fb: FormBuilder) {
    this.questionForm = this.fb.group({
      enonce: ['', [Validators.required, Validators.minLength(10)]],
      typeQuestion: ['', Validators.required],
      options: this.fb.array([])
    });

<<<<<<< Updated upstream
  ngOnInit(): void {
    if (this.question) {
      // Map frontend types to backend types
      let backendType: 'QCM' | 'VRAI_FAUX' | 'TEXTE_LIBRE' | 'NUMERIQUE' | 'OUI_NON' | 'ECHELLE' = 'QCM';
      const questionType = this.question.typeQuestion || this.question.type;
      
      // Map various frontend types to backend types
      if (questionType === 'TEXTE_LIBRE' || questionType === 'NUMERIQUE') {
        backendType = questionType;
      } else if (questionType === 'VRAI_FAUX' || questionType === 'OUI_NON') {
        backendType = questionType;
      } else if (questionType === 'ECHELLE') {
        backendType = 'ECHELLE';
      } else {
        backendType = 'QCM';
      }

      this.formData = {
        enonce: this.question.enonce,
        type: backendType,
        options: this.question.options || ['', '', '', ''],
        ordre: this.question.ordre
      };
    } else {
      this.formData.ordre = this.questionNumber;
=======
    // Écouter les changements de type de question
    this.questionForm.get('typeQuestion')?.valueChanges.subscribe(type => {
      this.onTypeChange(type);
    });
  }

  get options(): FormArray {
    return this.questionForm.get('options') as FormArray;
  }

  get isChoixMultiple(): boolean {
    return this.questionForm.get('typeQuestion')?.value === 'CHOIX_MULTIPLE';
  }

  onTypeChange(type: string): void {
    const optionsArray = this.options;
    
    // Vider les options existantes
    while (optionsArray.length !== 0) {
      optionsArray.removeAt(0);
    }

    // Si c'est un choix multiple, ajouter 2 options par défaut
    if (type === 'CHOIX_MULTIPLE') {
      this.addOption();
      this.addOption();
>>>>>>> Stashed changes
    }
  }

  addOption(): void {
    const optionControl = new FormControl('', [Validators.required, Validators.minLength(1)]);
    this.options.push(optionControl);
  }

  removeOption(index: number): void {
    if (this.options.length > 2) {
      this.options.removeAt(index);
    }
  }

<<<<<<< Updated upstream
  onTypeChange(): void {
    if (this.formData.type === 'QCM' && this.formData.options.length === 0) {
      this.formData.options = ['', '', '', ''];
    }
  }

  validate(): boolean {
    if (!this.formData.enonce.trim()) {
      this.errorMessage.set('L\'énoncé est requis');
      return false;
    }

    if (this.formData.type === 'QCM') {
      const validOptions = this.formData.options.filter(o => o.trim());
      if (validOptions.length < 2) {
        this.errorMessage.set('Au moins 2 options sont requises pour un QCM');
        return false;
      }
    }

    return true;
  }

  save(): void {
    this.errorMessage.set('');
    
    if (!this.validate()) {
      return;
    }

    this.isLoading.set(true);

    const questionData: any = {
      enonce: this.formData.enonce,
      typeQuestion: this.formData.type,  // Backend attend 'typeQuestion'
      ordre: this.formData.ordre
    };

    if (this.formData.type === 'QCM') {
      questionData.options = this.formData.options.filter(o => o.trim());
    }

    if (this.question && this.question.id) {
      // Update existing question
      this.evaluationUseCase.updateQuestion(this.question.id, questionData).subscribe({
        next: (question) => {
          this.isLoading.set(false);
          this.saved.emit(question);
        },
        error: (error) => {
          this.errorMessage.set(error.error?.message || 'Erreur lors de la mise à jour');
          this.isLoading.set(false);
        }
      });
    } else {
      // Create new question
      console.log('📤 Adding question:', {
        quizzId: this.quizzId,
        questionData
      });
=======
  onSubmit(): void {
    if (this.questionForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');

      const formValue = this.questionForm.value;
>>>>>>> Stashed changes
      
      // Préparer les données selon le type de question
      const questionData = {
        enonce: formValue.enonce.trim(),
        typeQuestion: formValue.typeQuestion,
        options: formValue.typeQuestion === 'CHOIX_MULTIPLE' 
          ? formValue.options.filter((opt: string) => opt.trim().length > 0)
          : []
      };

      // Validation supplémentaire pour les choix multiples
      if (questionData.typeQuestion === 'CHOIX_MULTIPLE' && questionData.options.length < 2) {
        this.errorMessage.set('Au moins 2 options sont requises pour les questions à choix multiples');
        this.isLoading.set(false);
        return;
      }

      // Émettre l'événement avec les données de la question
      this.saved.emit(questionData as Question);
      this.questionCreated.emit(questionData as Question);
      
      // Réinitialiser le formulaire
      this.resetForm();
      this.isLoading.set(false);
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.resetForm();
    this.cancelled.emit();
  }

  private resetForm(): void {
    this.questionForm.reset();
    this.errorMessage.set('');
    
    // Vider les options
    while (this.options.length !== 0) {
      this.options.removeAt(0);
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.questionForm.controls).forEach(key => {
      const control = this.questionForm.get(key);
      control?.markAsTouched();
    });

    // Marquer aussi les options comme touchées
    this.options.controls.forEach(control => {
      control.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.questionForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} est requis`;
      }
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} doit contenir au moins ${field.errors['minlength'].requiredLength} caractères`;
      }
    }
    return '';
  }

  getOptionError(index: number): string {
    const option = this.options.at(index);
    if (option?.errors && option.touched) {
      if (option.errors['required']) {
        return 'Cette option est requise';
      }
      if (option.errors['minlength']) {
        return 'L\'option doit contenir au moins 1 caractère';
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'enonce': 'L\'énoncé',
      'typeQuestion': 'Le type de question'
    };
    return labels[fieldName] || fieldName;
  }
}