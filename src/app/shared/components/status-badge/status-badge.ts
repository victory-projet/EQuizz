// src/app/shared/components/status-badge/status-badge.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';

export type StatusType =
  | 'active'
  | 'draft'
  | 'completed'
  | 'closed'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule, MatChipsModule, MatIcon],
  templateUrl: './status-badge.html',
  styleUrls: ['./status-badge.scss']
})
export class StatusBadge{
  @Input() status: StatusType = 'active';
  @Input() label?: string;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  getStatusConfig() {
    const configs: Record<StatusType, { label: string; color: string; icon?: string }> = {
      active: { label: 'En cours', color: 'primary', icon: 'play_circle' },
      draft: { label: 'Brouillon', color: 'warn', icon: 'drafts' },
      completed: { label: 'Terminé', color: 'accent', icon: 'check_circle' },
      closed: { label: 'Clôturé', color: '', icon: 'lock' },
      success: { label: 'Succès', color: 'primary', icon: 'check_circle' },
      warning: { label: 'Attention', color: 'warn', icon: 'warning' },
      error: { label: 'Erreur', color: 'warn', icon: 'error' },
      info: { label: 'Info', color: 'accent', icon: 'info' }
    };

    return configs[this.status];
  }

  getDisplayLabel(): string {
    return this.label || this.getStatusConfig().label;
  }

  getSizeClass(): string {
    return `size-${this.size}`;
  }
}
