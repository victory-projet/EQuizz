import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../http/api.service';
import { INotificationRepository } from '../../core/domain/repositories/notification.repository.interface';
import { Notification } from '../../core/domain/entities/notification.entity';

export interface BackendNotification {
  id: number;
  type: string;
  message: string;
  createdAt: string;
  estLue: boolean;
  evaluationId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationRepository implements INotificationRepository {
  private api = inject(ApiService);
  private readonly baseUrl = '/notifications';

  getNotifications(unreadOnly = false): Observable<Notification[]> {
    const params = unreadOnly ? new HttpParams().set('nonLuesOnly', 'true') : undefined;
    return this.api.get<BackendNotification[]>(this.baseUrl, params).pipe(
      map((notifications: BackendNotification[]) => notifications.map(n => this.mapToNotification(n)))
    );
  }

  markAsRead(notificationId: string): Observable<void> {
    return this.api.put<void>(`${this.baseUrl}/${notificationId}/read`, {});
  }

  markAllAsRead(): Observable<void> {
    return this.api.put<void>(`${this.baseUrl}/read-all`, {});
  }

  private mapToNotification(backend: BackendNotification): Notification {
    return new Notification(
      backend.id.toString(),
      backend.type,
      backend.message,
      new Date(backend.createdAt),
      backend.estLue,
      backend.evaluationId?.toString()
    );
  }
}
