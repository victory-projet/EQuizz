import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Message {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  content: string;
  date: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  sender?: string;
}

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit {
  messages = signal<Message[]>([]);
  filteredMessages = signal<Message[]>([]);
  selectedFilter = signal<'all' | 'unread' | 'read'>('all');
  selectedType = signal<'all' | 'info' | 'warning' | 'success' | 'error'>('all');

  ngOnInit(): void {
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
    this.applyFilters();
  }

  setFilter(filter: 'all' | 'unread' | 'read'): void {
    this.selectedFilter.set(filter);
    this.applyFilters();
  }

  setTypeFilter(type: 'all' | 'info' | 'warning' | 'success' | 'error'): void {
    this.selectedType.set(type);
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = this.messages();

    // Filtre par statut de lecture
    if (this.selectedFilter() !== 'all') {
      filtered = filtered.filter(msg => 
        this.selectedFilter() === 'read' ? msg.isRead : !msg.isRead
      );
    }

    // Filtre par type
    if (this.selectedType() !== 'all') {
      filtered = filtered.filter(msg => msg.type === this.selectedType());
    }

    this.filteredMessages.set(filtered);
  }

  markAsRead(messageId: string): void {
    const messages = this.messages();
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    
    if (messageIndex !== -1 && !messages[messageIndex].isRead) {
      messages[messageIndex].isRead = true;
      this.messages.set([...messages]);
      this.applyFilters();
    }
  }

  markAllAsRead(): void {
    const messages = this.messages().map(msg => ({ ...msg, isRead: true }));
    this.messages.set(messages);
    this.applyFilters();
  }

  deleteMessage(messageId: string): void {
    const messages = this.messages().filter(msg => msg.id !== messageId);
    this.messages.set(messages);
    this.applyFilters();
  }

  getUnreadCount(): number {
    return this.messages().filter(msg => !msg.isRead).length;
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'info': return 'info';
      case 'warning': return 'warning';
      case 'success': return 'check_circle';
      case 'error': return 'error';
      default: return 'notifications';
    }
  }

  getPriorityClass(priority: string): string {
    return `priority-${priority}`;
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 60) {
      return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    } else if (diffInDays < 7) {
      return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  }
}