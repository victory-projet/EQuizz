import { Injectable, inject } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { NotificationService } from './notification.service';
import { ToastService } from './toast.service';

export interface EmailNotification {
  to: string[];
  subject: string;
  body: string;
  type: 'quiz_published' | 'quiz_reminder' | 'quiz_closed' | 'results_available';
}

export interface NotificationLog {
  id: string;
  type: string;
  recipients: number;
  sentAt: Date;
  status: 'sent' | 'failed' | 'pending';
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AutoNotificationService {
  private notificationService = inject(NotificationService);
  private toastService = inject(ToastService);
  
  private notificationLogs: NotificationLog[] = [];

  /**
   * Envoie une notification automatique lors de la publication d'un quiz
   */
  notifyQuizPublished(quizId: string, quizTitle: string, studentEmails: string[]): Observable<boolean> {
    const notification: EmailNotification = {
      to: studentEmails,
      subject: `Nouveau quiz disponible: ${quizTitle}`,
      body: `
        Bonjour,
        
        Un nouveau quiz "${quizTitle}" vient d'être publié et est maintenant disponible.
        
        Connectez-vous à la plateforme EQuizz pour le compléter.
        
        Bonne chance!
        
        ---
        Plateforme EQuizz
      `,
      type: 'quiz_published'
    };

    return this.sendNotification(notification, `Quiz publié: ${studentEmails.length} étudiants notifiés`);
  }

  /**
   * Envoie un rappel avant la date limite d'un quiz
   */
  notifyQuizReminder(quizId: string, quizTitle: string, studentEmails: string[], dueDate: Date): Observable<boolean> {
    const notification: EmailNotification = {
      to: studentEmails,
      subject: `Rappel: Quiz "${quizTitle}" à compléter`,
      body: `
        Bonjour,
        
        Ceci est un rappel concernant le quiz "${quizTitle}".
        
        Date limite: ${dueDate.toLocaleDateString('fr-FR')}
        
        N'oubliez pas de le compléter avant la date limite!
        
        ---
        Plateforme EQuizz
      `,
      type: 'quiz_reminder'
    };

    return this.sendNotification(notification, `Rappel envoyé: ${studentEmails.length} étudiants`);
  }

  /**
   * Notifie la clôture d'un quiz
   */
  notifyQuizClosed(quizId: string, quizTitle: string, studentEmails: string[]): Observable<boolean> {
    const notification: EmailNotification = {
      to: studentEmails,
      subject: `Quiz clôturé: ${quizTitle}`,
      body: `
        Bonjour,
        
        Le quiz "${quizTitle}" est maintenant clôturé.
        
        Les résultats seront bientôt disponibles.
        
        ---
        Plateforme EQuizz
      `,
      type: 'quiz_closed'
    };

    return this.sendNotification(notification, `Quiz clôturé: ${studentEmails.length} étudiants notifiés`);
  }

  /**
   * Notifie la disponibilité des résultats
   */
  notifyResultsAvailable(quizId: string, quizTitle: string, studentEmails: string[]): Observable<boolean> {
    const notification: EmailNotification = {
      to: studentEmails,
      subject: `Résultats disponibles: ${quizTitle}`,
      body: `
        Bonjour,
        
        Les résultats du quiz "${quizTitle}" sont maintenant disponibles.
        
        Connectez-vous pour consulter votre score et vos réponses.
        
        ---
        Plateforme EQuizz
      `,
      type: 'results_available'
    };

    return this.sendNotification(notification, `Résultats publiés: ${studentEmails.length} étudiants notifiés`);
  }

  /**
   * Envoie une notification personnalisée
   */
  sendCustomNotification(
    recipients: string[],
    subject: string,
    message: string
  ): Observable<boolean> {
    const notification: EmailNotification = {
      to: recipients,
      subject: subject,
      body: message,
      type: 'quiz_published' // Type par défaut
    };

    return this.sendNotification(notification, `Notification envoyée à ${recipients.length} destinataires`);
  }

  /**
   * Méthode privée pour envoyer la notification
   */
  private sendNotification(notification: EmailNotification, successMessage: string): Observable<boolean> {
    // Simulation d'envoi d'email - À remplacer par une vraie intégration (SendGrid, AWS SES, etc.)
    console.log('📧 Envoi de notification:', notification);

    // Log de la notification
    const log: NotificationLog = {
      id: `notif-${Date.now()}`,
      type: notification.type,
      recipients: notification.to.length,
      sentAt: new Date(),
      status: 'sent',
      message: notification.subject
    };
    this.notificationLogs.push(log);

    // Afficher une notification dans l'interface
    this.notificationService.success(successMessage);
    this.toastService.success(successMessage);

    // Simuler un délai d'envoi
    return of(true).pipe(delay(1000));
  }

  /**
   * Récupère l'historique des notifications
   */
  getNotificationLogs(): NotificationLog[] {
    return [...this.notificationLogs].sort((a, b) => 
      b.sentAt.getTime() - a.sentAt.getTime()
    );
  }

  /**
   * Récupère les statistiques des notifications
   */
  getNotificationStats(): {
    total: number;
    sent: number;
    failed: number;
    pending: number;
  } {
    const logs = this.notificationLogs;
    return {
      total: logs.length,
      sent: logs.filter(l => l.status === 'sent').length,
      failed: logs.filter(l => l.status === 'failed').length,
      pending: logs.filter(l => l.status === 'pending').length
    };
  }

  /**
   * Planifie un rappel automatique
   */
  scheduleReminder(quizId: string, quizTitle: string, studentEmails: string[], reminderDate: Date): void {
    const now = new Date();
    const delay = reminderDate.getTime() - now.getTime();

    if (delay > 0) {
      setTimeout(() => {
        this.notifyQuizReminder(quizId, quizTitle, studentEmails, reminderDate).subscribe();
      }, delay);

      this.toastService.info(`Rappel planifié pour le ${reminderDate.toLocaleDateString('fr-FR')}`);
    }
  }

  /**
   * Envoie des notifications en masse
   */
  sendBulkNotifications(
    notifications: Array<{
      recipients: string[];
      subject: string;
      message: string;
    }>
  ): Observable<boolean> {
    console.log(`📧 Envoi de ${notifications.length} notifications en masse`);

    notifications.forEach(notif => {
      this.sendCustomNotification(notif.recipients, notif.subject, notif.message).subscribe();
    });

    this.toastService.success(`${notifications.length} notifications envoyées`);
    return of(true).pipe(delay(1000));
  }
}
