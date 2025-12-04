// Infrastructure - Notification Repository Implementation
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NotificationRepositoryInterface } from '../../core/domain/repositories/notification.repository.interface';
import { Notification } from '../../core/domain/entities/notification.entity';
import { ApiService } from '../http/api.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationRepository implements NotificationRepositoryInterface {
  constructor(private api: ApiService) {}

  getNotifications(): Observable<Notification[]> {
    return this.api.get<Notification[]>('/notifications');
  }

  markAsRead(id: number): Observable<void> {
    return this.api.put<void>(`/notifications/${id}/read`, {});
  }

  markAllAsRead(): Observable<void> {
    return this.api.put<void>('/notifications/read-all', {});
  }
}
