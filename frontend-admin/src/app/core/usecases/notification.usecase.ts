// Use Case - Notification
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NotificationRepositoryInterface } from '../domain/repositories/notification.repository.interface';
import { Notification } from '../domain/entities/notification.entity';

@Injectable({
  providedIn: 'root'
})
export class NotificationUseCase {
  constructor(private notificationRepository: NotificationRepositoryInterface) {}

  getNotifications(): Observable<Notification[]> {
    return this.notificationRepository.getNotifications();
  }

  markAsRead(id: number): Observable<void> {
    return this.notificationRepository.markAsRead(id);
  }

  markAllAsRead(): Observable<void> {
    return this.notificationRepository.markAllAsRead();
  }
}
