// src/app/core/application/use-cases/quiz/publish-quiz.use-case.ts
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Quiz } from '../../../domain/entities/quiz.entity';
import { IQuizRepository } from '../../../domain/repositories/quiz.repository.interface';
import { AutoNotificationService } from '../../../services/auto-notification.service';

@Injectable({
  providedIn: 'root'
})
export class PublishQuizUseCase {
  private repository = inject(IQuizRepository);
  private autoNotificationService = inject(AutoNotificationService);

  execute(id: string): Observable<Quiz> {
    return this.repository.publish(id).pipe(
      tap(quiz => {
        // Envoyer automatiquement une notification aux étudiants
        this.sendPublicationNotification(quiz);
      })
    );
  }

  private sendPublicationNotification(quiz: Quiz): void {
    // Récupérer les emails des étudiants (mock pour l'instant)
    // Dans une vraie implémentation, on récupérerait les emails depuis la base de données
    const studentEmails = this.getStudentEmailsForQuiz(quiz);
    
    if (studentEmails.length > 0) {
      this.autoNotificationService.notifyQuizPublished(
        quiz.id,
        quiz.title,
        studentEmails
      ).subscribe({
        next: () => {
          console.log(`✅ Notifications envoyées à ${studentEmails.length} étudiants`);
        },
        error: (err) => {
          console.error('❌ Erreur lors de l\'envoi des notifications:', err);
        }
      });
    }
  }

  private getStudentEmailsForQuiz(quiz: Quiz): string[] {
    // Mock - À remplacer par une vraie récupération depuis la base de données
    // On devrait récupérer les emails des étudiants des classes associées au quiz
    return [
      'marie.dubois@student.com',
      'pierre.martin@student.com',
      'sophie.laurent@student.com',
      'jean.dupont@student.com',
      'alice.bernard@student.com'
    ];
  }
}
