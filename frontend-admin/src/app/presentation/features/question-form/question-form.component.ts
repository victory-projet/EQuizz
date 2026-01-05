import { Component, EventEmitter, Input, Output, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { EvaluationUseCase } from '../../../core/usecases/evaluation.usecase';
import { Question } from '../../../core/domain/entities/question.entity';

@Component({
  selector: 'app-question-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './question-form.component.html',
  styleUrls: ['./question-form.component.scss']
})
export class QuestionFormComponent implements OnInit {
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

  questionTypes = [
    { value: 'CHOIX_MULTIPLE', label: 'Choix multiples' },
    { value: 'REPONSE_OUVERTE', label: 'Réponse ouverte' },
    { value: 'VRAI_FAUX', label: 'Vrai/Faux' },
    { value: 'NUMERIQUE', label: 'Numérique' }
  ];

  constructor(private fb: FormBuilder, private evaluationUseCase: EvaluationUseCase) {
    this.questionForm = this.fb.group({
      enonce: ['', [Validators.required, Validators.minLength(10)]],
      typeQuestion: ['CHOIX_MULTIPLE', Validators.required],
      options: this.fb.array([]),
      bonneReponse: [''],
      points: [1, [Validators.required, Validators.min(0.5), Validators.max(10)]],
      ordre: [1]
    });

    // Écouter les changements de type de question
    this.questionForm.get('typeQuestion')?.valueChanges.subscribe(type => {
      this.onTypeChange(type);
    });
  }

  ngOnInit(): void {
    if (this.question) {
      // Mode édition - pré-remplir le formulaire
      this.questionForm.patchValue({
        enonce: this.question.enonce,
        typeQuestion: this.question.typeQuestion || this.question.type,
        bonneReponse: this.question.bonneReponse,
        points: this.question.points || 1,
        ordre: this.question.ordre
      });

      // Charger les options si c'est un choix multiple
      if (this.isChoixMultiple && this.question.options) {
        this.question.options.forEach(option => {
          this.options.push(new FormControl(option, [Validators.required]));
        });
      }
    } else {
      // Mode création - initialiser avec des valeurs par défaut
      this.questionForm.patchValue({
        ordre: this.questionNumber || 1
      });
      
      // Ajouter des options par défaut pour choix multiple
      this.onTypeChange('CHOIX_MULTIPLE');
    }
  }

  get options(): FormArray {
    return this.questionForm.get('options') as FormArray;
  }

  get isChoixMultiple(): boolean {
    return this.questionForm.get('typeQuestion')?.value === 'CHOIX_MULTIPLE';
  }

  get isVraiFaux(): boolean {
    return this.questionForm.get('typeQuestion')?.value === 'VRAI_FAUX';
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

  onSubmit(): void {
    if (this.questionForm.invalid) {
      this.errorMessage.set('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    if (!this.validate()) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const formValue = this.questionForm.value;
    
    // Préparer les données selon le type de question
    const questionData: any = {
      enonce: formValue.enonce.trim(),
      typeQuestion: formValue.typeQuestion,
      points: formValue.points,
      ordre: formValue.ordre
    };

    // Ajouter les options pour les choix multiples
    if (formValue.typeQuestion === 'CHOIX_MULTIPLE') {
      questionData.options = formValue.options.filter((opt: string) => opt.trim());
      questionData.bonneReponse = formValue.bonneReponse;
    } else if (formValue.typeQuestion === 'VRAI_FAUX') {
      questionData.options = ['Vrai', 'Faux'];
      questionData.bonneReponse = formValue.bonneReponse;
    } else {
      questionData.bonneReponse = formValue.bonneReponse;
    }

    // Ajouter l'ID du quiz
    if (this.quizzId) {
      questionData.quizz_id = this.quizzId;
    }

    // Appeler le service pour créer/modifier la question
    const request = this.question?.id 
      ? this.evaluationUseCase.updateQuestion(this.question.id, questionData)
      : this.evaluationUseCase.createQuestion(this.quizzId!, questionData);

    request.subscribe({
      next: (question: Question) => {
        this.isLoading.set(false);
        this.saved.emit(question);
        this.questionCreated.emit(question);
      },
      error: (error) => {
        console.error('Erreur lors de la sauvegarde:', error);
        this.errorMessage.set(error.error?.message || 'Erreur lors de la sauvegarde');
        this.isLoading.set(false);
      }
    });
  }

  validate(): boolean {
    const formValue = this.questionForm.value;

    if (!formValue.enonce?.trim()) {
      this.errorMessage.set('L\'énoncé est requis');
      return false;
    }

    if (formValue.typeQuestion === 'CHOIX_MULTIPLE') {
      const validOptions = formValue.options.filter((opt: string) => opt?.trim());
      if (validOptions.length < 2) {
        this.errorMessage.set('Au moins 2 options sont requises pour un choix multiple');
        return false;
      }
      if (!formValue.bonneReponse?.trim()) {
        this.errorMessage.set('La bonne réponse est requise');
        return false;
      }
    }

    if (formValue.typeQuestion === 'VRAI_FAUX' && !formValue.bonneReponse) {
      this.errorMessage.set('Veuillez sélectionner la bonne réponse (Vrai ou Faux)');
      return false;
    }

    return true;
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  // Méthodes utilitaires pour le template
  getCharFromIndex(index: number): string {
    return String.fromCharCode(65 + index); // A, B, C, D...
  }
}