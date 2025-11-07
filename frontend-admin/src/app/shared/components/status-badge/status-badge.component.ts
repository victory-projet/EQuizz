import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

type BadgeStatus = 'draft' | 'published' | 'archived' | 'active' | 'inactive' | 'pending' | 'success' | 'error';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="status-badge" [class]="status()">
      {{ getLabel() }}
    </span>
  `,
  styles: [`
    .status-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: capitalize;

      &.draft {
        background: #f3f4f6;
        color: #6b7280;
      }

      &.published, &.active, &.success {
        background: #d1fae5;
        color: #065f46;
      }

      &.archived, &.inactive {
        background: #fee2e2;
        color: #991b1b;
      }

      &.pending {
        background: #fef3c7;
        color: #92400e;
      }

      &.error {
        background: #fee2e2;
        color: #dc2626;
      }
    }
  `]
})
export class StatusBadgeComponent {
  status = input.required<BadgeStatus>();
  customLabel = input<string>();

  getLabel(): string {
    if (this.customLabel()) {
      return this.customLabel()!;
    }

    const labels: Record<BadgeStatus, string> = {
      draft: 'Brouillon',
      published: 'Publié',
      archived: 'Archivé',
      active: 'Actif',
      inactive: 'Inactif',
      pending: 'En attente',
      success: 'Succès',
      error: 'Erreur'
    };

    return labels[this.status()] || this.status();
  }
}
