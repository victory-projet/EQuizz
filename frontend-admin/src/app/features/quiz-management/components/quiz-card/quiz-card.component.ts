import { Component, input, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Quiz } from '../../../../core/domain/entities/quiz.entity';
import { ModalService } from '../../../../core/services/modal.service';
import { ToastService } from '../../../../core/services/toast.service';
import { PublishQuizUseCase } from '../../../../core/domain/use-cases/quiz/publish-quiz.use-case';
import { DeleteQuizUseCase } from '../../../../core/domain/use-cases/quiz/delete-quiz.use-case';

@Component({
  selector: 'app-quiz-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="quiz-card">
      <div class="card-header">
        <div class="status-badge" [class]="getStatusClass()">
          {{ getStatusLabel() }}
        </div>
        <div class="card-menu">
          <button class="menu-btn" (click)="toggleMenu()">⋮</button>
          @if (showMenuDropdown()) {
            <div class="menu-dropdown" (click)="$event.stopPropagation()">
              <button (click)="onPreview()">👁️ Aperçu</button>
              <button (click)="onDuplicate()">📋 Dupliquer</button>
              <button (click)="onDelete()" class="danger">🗑️ Supprimer</button>
            </div>
          }
        </div>
      </div>

      <div class="card-content">
        <h3>{{ quiz().title }}</h3>
        <p class="description">Matière: {{ quiz().subject }}</p>
        
        <div class="card-stats">
          <div class="stat">
            <span class="stat-icon">❓</span>
            <span>{{ quiz().questions.length || 0 }} questions</span>
          </div>
          <div class="stat">
            <span class="stat-icon">📅</span>
            <span>{{ formatDate(quiz().createdDate) }}</span>
          </div>
          @if (quiz().endDate !== undefined) {
            <div class="stat">
              <span class="stat-icon">⏰</span>
              <span>Fin: {{ formatDate(quiz().endDate!) }}</span>
            </div>
          }
        </div>
      </div>

      <div class="card-footer">
        @if (quiz().isDraft()) {
          <!-- Brouillon: Bouton Continuer + Publier -->
          <button class="btn-secondary" (click)="onContinue()">
            ▶️ Continuer
          </button>
          <button class="btn-accent" (click)="onPublish()">
            🚀 Publier
          </button>
        } @else if (quiz().isActive()) {
          <!-- Actif: Bouton Modifier + Fermer -->
          <button class="btn-outline" (click)="onEdit()">
            ✏️ Modifier
          </button>
          <button class="btn-secondary" (click)="onClose()">
            🔒 Fermer
          </button>
        } @else {
          <!-- Fermé: Bouton Voir résultats -->
          <button class="btn-outline" (click)="onViewResults()">
            📊 Résultats
          </button>
          <button class="btn-secondary" (click)="onEdit()">
            ✏️ Modifier
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .quiz-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
      height: 100%;
      display: flex;
      flex-direction: column;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
    }

    .card-header {
      padding: 1rem 1.5rem;
      background: #f9fafb;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;

      &.draft {
        background: #6a1b9a;    // Violet foncé (Purple 800)
        color: #f3e5f5;         // Violet très clair
      }

      &.active {
        background: #1a1a1a;    // Noir
        color: #ffffff;         // Blanc
      }

      &.closed {
        background: #424242;    // Gris très foncé (Grey 800)
        color: #e0e0e0;         // Gris clair
      }

      &.expired {
        background: #616161;    // Gris foncé (Grey 700)
        color: #f5f5f5;         // Gris très clair
      }
    }

    .card-menu {
      position: relative;

      .menu-btn {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0.25rem 0.5rem;
        color: #666;

        &:hover {
          color: #1a1a1a;
        }
      }

      .menu-dropdown {
        position: absolute;
        right: 0;
        top: 100%;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        padding: 0.5rem;
        min-width: 150px;
        z-index: 10;

        button {
          width: 100%;
          text-align: left;
          padding: 0.5rem 1rem;
          border: none;
          background: none;
          cursor: pointer;
          border-radius: 4px;
          font-size: 0.875rem;

          &:hover {
            background: #f3f4f6;
          }

          &.danger {
            color: white;
            background: #1a1a1a;
            font-weight: 600;

            &:hover {
              background: #000000;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            }
          }
        }
      }
    }

    .card-content {
      padding: 1.5rem;
      flex: 1;
      display: flex;
      flex-direction: column;

      h3 {
        font-size: 1.25rem;
        font-weight: 600;
        color: #1a1a1a;
        margin-bottom: 0.5rem;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .description {
        color: #666;
        font-size: 0.875rem;
        margin-bottom: 1rem;
      }
    }

    .card-stats {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-top: auto;

      .stat {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        color: #666;

        .stat-icon {
          font-size: 1rem;
        }
      }
    }

    .card-footer {
      padding: 1rem 1.5rem;
      background: #f9fafb;
      display: flex;
      gap: 0.75rem;

      button {
        flex: 1;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        border: none;

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }

      .btn-outline {
        background: white;
        border: 2px solid #2c3e50;
        color: #2c3e50;

        &:hover:not(:disabled) {
          background: #2c3e50;
          color: white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
        }
      }

      .btn-primary {
        background: #2c3e50;
        color: white;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);

        &:hover:not(:disabled) {
          background: #1a252f;
          box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
        }
      }

      .btn-secondary {
        background: #34495e;
        color: white;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);

        &:hover:not(:disabled) {
          background: #2c3e50;
          box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
        }
      }

      .btn-accent {
        background: #3498db;
        color: white;
        box-shadow: 0 2px 4px rgba(52, 152, 219, 0.3);

        &:hover:not(:disabled) {
          background: #2980b9;
          box-shadow: 0 3px 6px rgba(52, 152, 219, 0.4);
        }
      }
    }
  `]
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

  onContinue(): void {
    // Continuer l'édition d'un brouillon
    this.router.navigate(['/quiz/edit', this.quiz().id]);
  }

  onEdit(): void {
    // Modifier un quiz
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
