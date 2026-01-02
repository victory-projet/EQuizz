import { Component, Input, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EvaluationUseCase } from '../../../core/usecases/evaluation.usecase';
import { Question } from '../../../core/domain/entities/question.entity';

@Component({
  selector: 'app-question-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './question-form.component.html',
  styleUrls: ['./question-form.component.scss']
})
export class QuestionFormComponent implements OnInit {
  @Input() evaluationId!: string | number;
  @Input() quizzId!: string | number;
  @Input() question: Question | null = null;
  @Input() questionNumber: number = 1;
  
  @Output() saved = new EventEmitter<Question>();
  @Output() cancelled = new EventEmitter<void>();

  isLoading = signal(false);
  errorMessage = signal('');

  formData = {
    enonce: '',
    type: 'QCM' as 'QCM' | 'VRAI_FAUX' | 'TEXTE_LIBRE' | 'NUMERIQUE' | 'OUI_NON' | 'ECHELLE',
    options: ['', '', '', ''],
    ordre: 1
  };

  constructor(private evaluationUseCase: EvaluationUseCase) {}

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
    }
  }

  addOption(): void {
    this.formData.options.push('');
  }

  removeOption(index: number): void {
    if (this.formData.options.length > 2) {
      this.formData.options.splice(index, 1);
    }
  }

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
      
      this.evaluationUseCase.addQuestion(this.quizzId, questionData).subscribe({
        next: (question) => {
          console.log('✅ Question created:', question);
          this.isLoading.set(false);
          this.saved.emit(question);
        },
        error: (error) => {
          console.error('❌ Error creating question:', error);
          this.errorMessage.set(error.error?.message || error.message || 'Erreur lors de la création');
          this.isLoading.set(false);
        }
      });
    }
  }

  cancel(): void {
    this.cancelled.emit();
  }

  // Expose String for template
  String = String;
}
