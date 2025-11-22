import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration: number;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly MAX_NOTIFICATIONS = 5;
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  
  public notifications$: Observable<Notification[]> = this.notificationsSubject.asObservable();

  /**
   * Affiche une notification de succès
   */
  success(message: string, duration: number = 3000): void {
    this.addNotification('success', message, duration);
  }

  /**
   * Affiche une notification d'erreur
   */
  error(message: string, duration: number = 5000): void {
    this.addNotification('error', message, duration);
  }

  /**
   * Affiche une notification d'information
   */
  info(message: string, duration: number = 3000): void {
    this.addNotification('info', message, duration);
  }

  /**
   * Affiche une notification d'avertissement
   */
  warning(message: string, duration: number = 4000): void {
    this.addNotification('warning', message, duration);
  }

  /**
   * Supprime une notification par son ID
   */
  remove(id: string): void {
    const current = this.notificationsSubject.value;
    this.notificationsSubject.next(current.filter(n => n.id !== id));
  }

  /**
   * Supprime toutes les notifications
   */
  clear(): void {
    this.notificationsSubject.next([]);
  }

  /**
   * Ajoute une notification à la file d'attente
   */
  private addNotification(type: Notification['type'], message: string, duration: number): void {
    const notification: Notification = {
      id: this.generateId(),
      type,
      message,
      duration,
      timestamp: new Date()
    };

    let current = this.notificationsSubject.value;
    
    // Limiter à MAX_NOTIFICATIONS
    if (current.length >= this.MAX_NOTIFICATIONS) {
      current = current.slice(1); // Supprimer la plus ancienne
    }

    this.notificationsSubject.next([...current, notification]);

    // Auto-suppression après la durée spécifiée
    if (duration > 0) {
      setTimeout(() => this.remove(notification.id), duration);
    }
  }

  /**
   * Génère un ID unique pour la notification
   */
  private generateId(): string {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
