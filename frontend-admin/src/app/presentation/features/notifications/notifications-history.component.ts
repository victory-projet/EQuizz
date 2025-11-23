import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { INotificationRepository } from '../../../core/domain/repositories/notification.repository.interface';
import { Notification } from '../../../core/domain/entities/notification.entity';
import { SvgIconComponent } from '../../shared/components/svg-icon/svg-icon';

@Component({
  selector: 'app-notifications-history',
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  templateUrl: './notifications-history.component.html',
  styleUrls: ['./notifications-history.component.scss']
})
export class NotificationsHistoryComponent implements OnInit {
  private notificationRepo = inject(INotificationRepository);

  logs = signal<Notification[]>([]);
  stats = signal({
    total: 0,
    read: 0,
    unread: 0
  });
  isLoading = signal(true);

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.isLoading.set(true);
    this.notificationRepo.getNotifications().subscribe({
      next: (notifications) => {
        this.logs.set(notifications);
        this.stats.set({
          total: notifications.length,
          read: notifications.filter(n => n.isRead).length,
          unread: notifications.filter(n => !n.isRead).length
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading notifications:', err);
        this.isLoading.set(false);
      }
    });
  }

  markAsRead(notificationId: string): void {
    this.notificationRepo.markAsRead(notificationId).subscribe({
      next: () => {
        this.loadNotifications();
      },
      error: (err) => {
        console.error('Error marking notification as read:', err);
      }
    });
  }

  markAllAsRead(): void {
    this.notificationRepo.markAllAsRead().subscribe({
      next: () => {
        this.loadNotifications();
      },
      error: (err) => {
        console.error('Error marking all notifications as read:', err);
      }
    });
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      quiz_published: 'Quiz publié',
      quiz_reminder: 'Rappel',
      quiz_closed: 'Quiz clôturé',
      results_available: 'Résultats disponibles',
      evaluation_published: 'Évaluation publiée',
      evaluation_reminder: 'Rappel évaluation'
    };
    return labels[type] || type;
  }

  getStatusLabel(isRead: boolean): string {
    return isRead ? 'Lue' : 'Non lue';
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
