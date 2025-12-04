import { Component, Input, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Evaluation } from '../../../core/domain/entities/evaluation.entity';

@Component({
  selector: 'app-evaluation-publish',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './evaluation-publish.component.html',
  styleUrls: ['./evaluation-publish.component.scss']
})
export class EvaluationPublishComponent implements OnInit {
  @Input() evaluation!: Evaluation;
  @Input() questionCount: number = 0;
  
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  // Validation checks
  checks = signal({
    hasQuestions: false,
    hasTitle: false,
    hasDescription: false,
    hasDates: false,
    hasCourse: false,
    hasClass: false,
    isDraft: false
  });

  canPublish = signal(false);

  ngOnInit(): void {
    this.validateEvaluation();
  }

  validateEvaluation(): void {
    const checks = {
      hasQuestions: this.questionCount > 0,
      hasTitle: !!this.evaluation.titre && this.evaluation.titre.trim().length > 0,
      hasDescription: !!this.evaluation.description && this.evaluation.description.trim().length > 0,
      hasDates: !!this.evaluation.dateDebut && !!this.evaluation.dateFin,
      hasCourse: !!this.evaluation.cours,
      hasClass: !!this.evaluation.classe,
      isDraft: this.evaluation.statut === 'BROUILLON'
    };

    this.checks.set(checks);

    // Can publish if all critical checks pass
    const canPublish = checks.hasQuestions && 
                       checks.hasTitle && 
                       checks.hasDates && 
                       checks.hasCourse && 
                       checks.hasClass && 
                       checks.isDraft;
    
    this.canPublish.set(canPublish);
  }

  confirm(): void {
    if (this.canPublish()) {
      this.confirmed.emit();
    }
  }

  cancel(): void {
    this.cancelled.emit();
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
