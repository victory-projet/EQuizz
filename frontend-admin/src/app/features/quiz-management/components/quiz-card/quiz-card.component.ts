import { Component, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Quiz } from '../../../../core/domain/entities/quiz.entity';
import { ModalService } from '../../../../core/services/modal.service';

@Component({
  selector: 'app-quiz-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="quiz-card">
      <div class="card-header">
        <div class="status-badge" [class]="quiz().status">
          {{ getStatusLabel(quiz().status) }}
        </div>
        <div class="card-menu">
          <button class="menu-btn" (click)="toggleMenu()">⋮</button>
          @if (showMenu()) {
            <div class="menu-dropdown">
              <button (click)="onEdit()">✏️ Modifier</button>
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
        </div>
      </div>

      <div class="card-footer">
        <button class="btn-outline" (click)="onEdit()">Modifier</button>
        <button class="btn-primary" (click)="onPublish()">
          {{ quiz().isActive() ? 'Fermer' : 'Publier' }}
        </button>
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
      font-weight: 500;

      &.draft {
        background: #f3f4f6;
        color: #6b7280;
      }

      &.active {
        background: #d1fae5;
        color: #065f46;
      }

      &.closed {
        background: #fee2e2;
        color: #991b1b;
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
            color: #dc2626;

            &:hover {
              background: #fee2e2;
            }
          }
        }
      }
    }

    .card-content {
      padding: 1.5rem;

      h3 {
        font-size: 1.25rem;
        font-weight: 600;
        color: #1a1a1a;
        margin-bottom: 0.5rem;
      }

      .description {
        color: #666;
        font-size: 0.875rem;
        margin-bottom: 1rem;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }

    .card-stats {
      display: flex;
      gap: 1rem;

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
      }

      .btn-outline {
        background: white;
        border: 1px solid #e5e7eb;
        color: #1a1a1a;

        &:hover {
          border-color: #4f46e5;
          color: #4f46e5;
        }
      }

      .btn-primary {
        background: #4f46e5;
        border: none;
        color: white;

        &:hover {
          background: #4338ca;
        }
      }
    }
  `]
})
export class QuizCardComponent {
  quiz = input.required<Quiz>();
  private modalService = inject(ModalService);
  
  showMenu = input(false);

  toggleMenu(): void {
    // Toggle menu logic
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      draft: 'Brouillon',
      active: 'Publié',
      closed: 'Fermé'
    };
    return labels[status] || status;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  onEdit(): void {
    // Navigation vers édition
  }

  onPreview(): void {
    // Ouvrir modal preview
  }

  onDuplicate(): void {
    // Dupliquer le quiz
  }

  async onDelete(): Promise<void> {
    const confirmed = await this.modalService.confirm(
      'Supprimer le quiz',
      'Êtes-vous sûr de vouloir supprimer ce quiz ? Cette action est irréversible.'
    );
    
    if (confirmed) {
      // Supprimer le quiz
    }
  }

  onPublish(): void {
    // Publier/dépublier le quiz
  }
}
