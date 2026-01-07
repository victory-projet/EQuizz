import { Component, Input, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Question } from '../../../core/domain/entities/question.entity';

@Component({
  selector: 'app-question-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './question-form.component.html',
  styleUrls: ['./question-form.component.scss']
})
export class QuestionFormComponent implements OnInit {
  @Input() question: Question | null = null;
  @Input() isVisible = false;
  @Output() questionSaved = new EventEmitter<Question>();
  @Output() cancelled = new EventEmitter<void>();

  questionForm!: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');

  questionTypes = [
    { value: 'QCM', label: 'QCM (Choix multiple)', icon: 'radio_button_checked' },
    { value: 'VRAI_FAUX', label: 'Vrai/Faux', icon: 'check_box' },
    { value: 'TEXTE_LIBRE', label: 'Texte libre', icon: 'text_fields' },
    { value: 'NUMERIQUE', label: 'Numérique', icon: 'pin' },
    { value: 'OUI_NON', label: 'Oui/Non', icon: 'toggle_on' },
    { value: 'ECHELLE', label: 'Échelle de notation', icon: 'linear_scale' }
  ];

  constructor(private fb: FormBuilder) {
    this.initializeForm();
  }

  ngOnInit(): void {
    if (this.question) {
      this.populateForm();
    }
  }

  private initializeForm(): void {
    this.questionForm = this.fb.group({
      enonce: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      typeQuestion: ['QCM', [Validators.required]],
      options: this.fb.array([]),
      bonneReponse: [0],
      explication: ['', [Validators.maxLength(300)]],
      points: [1, [Validators.required, Validators.min(0.5), Validators.max(10)]],
      obligatoire: [true]
    });

    // Ajouter des options par défaut pour QCM
    this.addOption('Option A');
    this.addOption('Option B');
    this.addOption('Option C');
    this.addOption('Option D');

    // Écouter les changements de type de question
    this.questionForm.get('typeQuestion')?.valueChanges.subscribe(type => {
      this.onQuestionTypeChange(type);
    });
  }

  private populateForm(): void {
    if (!this.question) return;

    this.questionForm.patchValue({
      enonce: this.question.enonce,
      typeQuestion: this.question.typeQuestion,
      bonneReponse: this.question.bonneReponse || 0,
      explication: this.question.explication || '',
      points: this.question.points || 1,
      obligatoire: this.question.obligatoire !== false
    });

    // Remplir les options si c'est un QCM
    if (this.question.typeQuestion === 'QCM' && this.question.options) {
      this.clearOptions();
      this.question.options.forEach(option => {
        this.addOption(option);
      });
    }
  }

  get options(): FormArray {
    return this.questionForm.get('options') as FormArray;
  }

  get selectedType(): string {
    return this.questionForm.get('typeQuestion')?.value || 'QCM';
  }

  get requiresOptions(): boolean {
    const type = this.selectedType;
    return ['QCM', 'VRAI_FAUX', 'OUI_NON'].includes(type);
  }

  get requiresNumericAnswer(): boolean {
    return this.selectedType === 'NUMERIQUE';
  }

  get requiresScaleConfig(): boolean {
    return this.selectedType === 'ECHELLE';
  }

  onQuestionTypeChange(type: string): void {
    this.clearOptions();

    switch (type) {
      case 'QCM':
        this.addOption('Option A');
        this.addOption('Option B');
        this.addOption('Option C');
        this.addOption('Option D');
        break;
      case 'VRAI_FAUX':
        this.addOption('Vrai');
        this.addOption('Faux');
        break;
      case 'OUI_NON':
        this.addOption('Oui');
        this.addOption('Non');
        break;
      default:
        // Pas d'options pour les autres types
        break;
    }

    // Réinitialiser la bonne réponse
    this.questionForm.patchValue({ bonneReponse: 0 });
  }

  addOption(text: string = ''): void {
    const optionControl = this.fb.control(text, [Validators.required, Validators.maxLength(200)]);
    this.options.push(optionControl);
  }

  removeOption(index: number): void {
    if (this.options.length > 2) {
      this.options.removeAt(index);
      
      // Ajuster la bonne réponse si nécessaire
      const currentCorrect = this.questionForm.get('bonneReponse')?.value;
      if (currentCorrect >= index && currentCorrect > 0) {
        this.questionForm.patchValue({ bonneReponse: currentCorrect - 1 });
      }
    }
  }

  clearOptions(): void {
    while (this.options.length > 0) {
      this.options.removeAt(0);
    }
  }

  moveOptionUp(index: number): void {
    if (index > 0) {
      const option = this.options.at(index);
      this.options.removeAt(index);
      this.options.insert(index - 1, option);
      
      // Ajuster la bonne réponse
      const currentCorrect = this.questionForm.get('bonneReponse')?.value;
      if (currentCorrect === index) {
        this.questionForm.patchValue({ bonneReponse: index - 1 });
      } else if (currentCorrect === index - 1) {
        this.questionForm.patchValue({ bonneReponse: index });
      }
    }
  }

  moveOptionDown(index: number): void {
    if (index < this.options.length - 1) {
      const option = this.options.at(index);
      this.options.removeAt(index);
      this.options.insert(index + 1, option);
      
      // Ajuster la bonne réponse
      const currentCorrect = this.questionForm.get('bonneReponse')?.value;
      if (currentCorrect === index) {
        this.questionForm.patchValue({ bonneReponse: index + 1 });
      } else if (currentCorrect === index + 1) {
        this.questionForm.patchValue({ bonneReponse: index });
      }
    }
  }

  setCorrectAnswer(index: number): void {
    this.questionForm.patchValue({ bonneReponse: index });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.questionForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.questionForm.get(fieldName);
    if (!field || !field.errors) return '';

    const errors = field.errors;
    
    if (errors['required']) return 'Ce champ est requis';
    if (errors['minlength']) return `Minimum ${errors['minlength'].requiredLength} caractères`;
    if (errors['maxlength']) return `Maximum ${errors['maxlength'].requiredLength} caractères`;
    if (errors['min']) return `Valeur minimum: ${errors['min'].min}`;
    if (errors['max']) return `Valeur maximum: ${errors['max'].max}`;

    return 'Valeur invalide';
  }

  getOptionError(index: number): string {
    const option = this.options.at(index);
    if (!option || !option.errors) return '';

    const errors = option.errors;
    
    if (errors['required']) return 'Cette option est requise';
    if (errors['maxlength']) return `Maximum ${errors['maxlength'].requiredLength} caractères`;

    return 'Valeur invalide';
  }

  isOptionInvalid(index: number): boolean {
    const option = this.options.at(index);
    return !!(option && option.invalid && (option.dirty || option.touched));
  }

  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index); // A, B, C, D...
  }

  getQuestionTypeIcon(type: string): string {
    const typeObj = this.questionTypes.find(t => t.value === type);
    return typeObj?.icon || 'help_outline';
  }

  previewQuestion(): void {
    // TODO: Implémenter l'aperçu de la question
    console.log('Aperçu de la question:', this.questionForm.value);
  }

  onSubmit(): void {
    if (this.questionForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');

      const formValue = this.questionForm.value;
      
      const questionData: Question = {
        id: this.question?.id,
        enonce: formValue.enonce,
        typeQuestion: formValue.typeQuestion,
        options: this.requiresOptions ? formValue.options : undefined,
        bonneReponse: this.requiresOptions ? formValue.bonneReponse : undefined,
        explication: formValue.explication || undefined,
        points: formValue.points,
        obligatoire: formValue.obligatoire,
        ordre: this.question?.ordre || 0
      };

      // Simuler un délai de traitement
      setTimeout(() => {
        this.questionSaved.emit(questionData);
        this.isLoading.set(false);
      }, 500);
    } else {
      this.markFormGroupTouched();
      this.errorMessage.set('Veuillez corriger les erreurs dans le formulaire');
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.questionForm.controls).forEach(key => {
      const control = this.questionForm.get(key);
      control?.markAsTouched();
      
      if (control instanceof FormArray) {
        control.controls.forEach(c => c.markAsTouched());
      }
    });
  }

  resetForm(): void {
    this.questionForm.reset();
    this.initializeForm();
    this.errorMessage.set('');
  }

  // Méthodes utilitaires pour le template
  get formData() {
    return this.questionForm.value;
  }

  get isEditMode(): boolean {
    return !!this.question?.id;
  }

  get modalTitle(): string {
    return this.isEditMode ? 'Modifier la question' : 'Créer une nouvelle question';
  }

  get submitButtonText(): string {
    return this.isEditMode ? 'Mettre à jour' : 'Créer la question';
  }

  get canAddOption(): boolean {
    return this.requiresOptions && this.options.length < 6;
  }

  get canRemoveOption(): boolean {
    return this.requiresOptions && this.options.length > 2;
  }

  get estimatedReadingTime(): number {
    const text = this.formData.enonce || '';
    const wordsPerMinute = 200;
    const words = text.split(' ').length;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
  }

  get characterCount(): number {
    return (this.formData.enonce || '').length;
  }
}