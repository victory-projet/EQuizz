import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutoNotificationService, NotificationLog } from '../../../core/services/auto-notification.service';
import { SvgIconComponent } from '../../shared/components/svg-icon/svg-icon';

@Component({
  selector: 'app-notifications-history',
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  templateUrl: './notifications-history.component.html',
  styleUrls: ['./notifications-history.component.scss']
})
export class NotificationsHistoryComponent implements OnInit {
  private autoNotificationService = inject(AutoNotificationService);

  logs = signal<NotificationLog[]>([]);
  stats = signal({
    total: 0,
    sent: 0,
    failed: 0,
    pending: 0
  });

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.logs.set(this.autoNotificationService.getNotificationLogs());
    this.stats.set(this.autoNotificationService.getNotificationStats());
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      quiz_published: 'Quiz publié',
      quiz_reminder: 'Rappel',
      quiz_closed: 'Quiz clôturé',
      results_available: 'Résultats disponibles'
    };
    return labels[type] || type;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      sent: 'Envoyée',
      failed: 'Échouée',
      pending: 'En attente'
    };
    return labels[status] || status;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
