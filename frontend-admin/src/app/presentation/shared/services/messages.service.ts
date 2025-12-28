import { Injectable, signal } from '@angular/core';

export interface Message {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  content: string;
  date: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  sender?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  private messages = signal<Message[]>([]);

  constructor() {
    this.loadMessages();
  }

  private loadMessages(): void {
    // Messages fictifs
    const mockMessages: Message[] = [
      {
        id: '1',
        type: 'info',
        title: 'Nouvelle évaluation disponible',
        content: 'L\'évaluation "Programmation Web Avancée" est maintenant ouverte aux étudiants de la classe ING4ISI. Les étudiants ont jusqu\'au 15 janvier pour compléter cette évaluation.',
        date: new Date(Date.now() - 2 * 60 * 60 * 1000), // Il y a 2 heures
        isRead: false,
        priority: 'high',
        sender: 'Système d\'évaluation'
      },
      {
        id: '2',
        type: 'warning',
        title: 'Maintenance programmée',
        content: 'Le système sera indisponible demain de 2h à 4h du matin pour une maintenance de routine. Veuillez planifier vos activités en conséquence.',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Il y a 1 jour
        isRead: false,
        priority: 'medium',
        sender: 'Administration système'
      },
      {
        id: '3',
        type: 'success',
        title: 'Rapport mensuel généré',
        content: 'Le rapport mensuel des évaluations pour décembre 2024 a été généré avec succès. Vous pouvez le consulter dans la section Rapports.',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Il y a 3 jours
        isRead: true,
        priority: 'low',
        sender: 'Générateur de rapports'
      },
      {
        id: '4',
        type: 'info',
        title: 'Nouveaux étudiants importés',
        content: '25 nouveaux étudiants ont été importés dans le système pour le semestre de printemps. Veuillez vérifier leurs informations dans la section Étudiants.',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Il y a 5 jours
        isRead: true,
        priority: 'medium',
        sender: 'Gestion des étudiants'
      },
      {
        id: '5',
        type: 'error',
        title: 'Erreur de synchronisation',
        content: 'Une erreur s\'est produite lors de la synchronisation avec le système externe. L\'équipe technique a été notifiée et travaille sur une solution.',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Il y a 1 semaine
        isRead: true,
        priority: 'high',
        sender: 'Support technique'
      },
      {
        id: '6',
        type: 'info',
        title: 'Mise à jour des fonctionnalités',
        content: 'De nouvelles fonctionnalités ont été ajoutées au système : export PDF amélioré, notifications en temps réel, et interface utilisateur optimisée.',
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // Il y a 10 jours
        isRead: true,
        priority: 'low',
        sender: 'Équipe de développement'
      }
    ];

    this.messages.set(mockMessages);
  }

  getMessages() {
    return this.messages();
  }

  getUnreadCount(): number {
    return this.messages().filter(msg => !msg.isRead).length;
  }

  markAsRead(messageId: string): void {
    const messages = this.messages();
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    
    if (messageIndex !== -1 && !messages[messageIndex].isRead) {
      messages[messageIndex].isRead = true;
      this.messages.set([...messages]);
    }
  }

  markAllAsRead(): void {
    const messages = this.messages().map(msg => ({ ...msg, isRead: true }));
    this.messages.set(messages);
  }

  deleteMessage(messageId: string): void {
    const messages = this.messages().filter(msg => msg.id !== messageId);
    this.messages.set(messages);
  }
}