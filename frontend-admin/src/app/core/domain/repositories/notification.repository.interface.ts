// Repository Interface - Notification
import { Observable } from 'rxjs';
import { Notification } from '../entities/notification.entity';

export abstract class NotificationRepositoryInterface {
  abstract getNotifications(): Observable<Notification[]>;
  abstract markAsRead(id: number): Observable<void>;
  abstract markAllAsRead(): Observable<void>;
}
