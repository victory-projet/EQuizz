import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';
import { NotificationComponent } from '../notification/notification.component';

@Component({
  selector: 'app-notification-container',
  standalone: true,
  imports: [CommonModule, NotificationComponent],
  template: `
    <div class="notification-container">
      @for (notification of notificationService.notifications$ | async; track notification.id) {
        <app-notification
          [notification]="notification"
          (dismiss)="onDismiss($event)"
          (actionClick)="onActionClick($event)">
        </app-notification>
      }
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 9999;
      pointer-events: none;
    }

    .notification-container > * {
      pointer-events: auto;
    }

    @media (max-width: 640px) {
      .notification-container {
        top: 0;
        right: 0;
        left: 0;
        padding: 1rem;
      }
    }
  `]
})
export class NotificationContainerComponent {
  constructor(public notificationService: NotificationService) {}

  onDismiss(id: string): void {
    this.notificationService.dismiss(id).subscribe();
  }

  onActionClick(event: any): void {
    // L'action est déjà exécutée dans le composant notification
    console.log('Action clicked:', event);
  }
}