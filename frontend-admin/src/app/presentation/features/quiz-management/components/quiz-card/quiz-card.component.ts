import { Component, input, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Quiz } from '../../../../../core/domain/entities/quiz.entity';
import { ModalService } from '../../../../../core/services/modal.service';
import { ToastService } from '../../../../../core/services/toast.service';
import { PublishQuizUseCase } from '../../../../../core/application/use-cases/quiz/publish-quiz.use-case';
import { DeleteQuizUseCase } from '../../../../../core/application/use-cases/quiz/delete-quiz.use-case';
import { SvgIconComponent } from '../../../../shared/components/svg-icon/svg-icon';

@Component({
  selector: 'app-quiz-card',
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  templateUrl: './quiz-card.component.html',
  styleUrls: ['./quiz-card.component.scss']
})
export class QuizCardComponent {
  quiz = input.required<Quiz>();
  quizDeleted = output<string>();
  quizUpdated = output<void>();
  
  private router = inject(Router);
  private modalService = inject(ModalService);
  private toastService = inject(ToastService);
  private publishQuizUseCase = inject(PublishQuizUseCase);
  private deleteQuizUseCase = inject(DeleteQuizUseCase);
  
  showMenuDropdown = signal(false);

  toggleMenu(): void {
    this.showMenuDropdown.update(v => !v);
  }

  getStatusLabel(): string {
    const quiz = this.quiz();
    
    // Vérifier si le quiz est expiré (date de fin passée)
    if (quiz.endDate && new Date(quiz.endDate) < new Date() && quiz.status === 'active') {
      return 'Terminé';
    }
    
    const labels: Record<string, string> = {
      draft: 'Brouillon',
      active: 'En cours',
      closed: 'Fermé'
    };
    return labels[quiz.status] || quiz.status;
  }

  getStatusClass(): string {
    const quiz = this.quiz();
    
    // Vérifier si le quiz est expiré
    if (quiz.endDate && new Date(quiz.endDate) < new Date() && quiz.status === 'active') {
      return 'expired';
    }
    
    return quiz.status;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  getClassInfo(): string {
    const classIds = this.quiz().classIds;
    if (!classIds || classIds.length === 0) {
      return 'Aucune classe';
    }
    return classIds.length === 1 ? '1 classe' : `${classIds.length} classes`;
  }

  getSemesterInfo(): string {
    const semesterId = this.quiz().semesterId;
    if (!semesterId) {
      return 'Non défini';
    }
    // Extraire le numéro du semestre depuis l'ID
    if (semesterId.includes('1') || semesterId.toLowerCase().includes('s1')) {
      return 'Semestre 1';
    } else if (semesterId.includes('2') || semesterId.toLowerCase().includes('s2')) {
      return 'Semestre 2';
    }
    return semesterId;
  }

  onContinue(): void {
    // Continuer l'édition d'un brouillon
    this.router.navigate(['/quiz/edit', this.quiz().id]);
  }

  onEdit(): void {
    // Vérifier si le quiz peut être modifié (uniquement les brouillons)
    if (!this.quiz().canBeEdited()) {
      this.toastService.error('Seuls les quiz en brouillon peuvent être modifiés');
      return;
    }
    this.router.navigate(['/quiz/edit', this.quiz().id]);
  }

  onPreview(): void {
    // Aperçu du quiz
    this.router.navigate(['/quiz/preview', this.quiz().id]);
    this.showMenuDropdown.set(false);
  }

  onDuplicate(): void {
    // Dupliquer le quiz
    this.toastService.info('Fonctionnalité de duplication à venir');
    this.showMenuDropdown.set(false);
  }

  async onDelete(): Promise<void> {
    this.showMenuDropdown.set(false);
    
    const confirmed = await this.modalService.confirm(
      'Supprimer le quiz',
      `Êtes-vous sûr de vouloir supprimer le quiz "${this.quiz().title}" ? Cette action est irréversible.`
    );
    
    if (confirmed) {
      this.deleteQuizUseCase.execute(this.quiz().id).subscribe({
        next: () => {
          this.toastService.success('Quiz supprimé avec succès');
          this.quizDeleted.emit(this.quiz().id);
        },
        error: (error) => {
          this.toastService.error(error.message || 'Erreur lors de la suppression');
        }
      });
    }
  }

  async onPublish(): Promise<void> {
    const confirmed = await this.modalService.confirm(
      'Publier le quiz',
      `Êtes-vous sûr de vouloir publier le quiz "${this.quiz().title}" ? Il sera visible par les étudiants.`
    );
    
    if (confirmed) {
      this.publishQuizUseCase.execute(this.quiz().id).subscribe({
        next: () => {
          this.toastService.success('Quiz publié avec succès');
          this.quizUpdated.emit();
        },
        error: (error) => {
          this.toastService.error(error.message || 'Erreur lors de la publication');
        }
      });
    }
  }

  onClose(): void {
    // Fermer un quiz actif
    this.toastService.info('Fonctionnalité de fermeture à venir');
  }

  onViewResults(): void {
    // Voir les résultats d'un quiz fermé
    this.router.navigate(['/quiz/results', this.quiz().id]);
  }
}