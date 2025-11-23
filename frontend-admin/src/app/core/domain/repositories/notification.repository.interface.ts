// src/app/core/domain/repositories/notification.repository.interface.ts
import { Observable } from 'rxjs';
import { Notification } from '../entities/notification.entity';

export abstract class INotificationRepository {
    abstract getNotifications(unreadOnly?: boolean): Observable<Notification[]>;
    abstract markAsRead(notificationId: string): Observable<void>;
    abstract markAllAsRead(): Observable<void>;
}
