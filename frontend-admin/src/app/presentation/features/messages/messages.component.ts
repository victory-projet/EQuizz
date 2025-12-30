import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { MessagesService, Message } from '../../shared/services/messages.service';
import { GlobalSearchService } from '../../shared/services/global-search.service';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  messages = signal<Message[]>([]);
  filteredMessages = signal<Message[]>([]);
  selectedFilter = signal<'all' | 'unread' | 'read'>('all');
  selectedType = signal<'all' | 'info' | 'warning' | 'success' | 'error'>('all');
  searchQuery = signal('');

  constructor(
    private messagesService: MessagesService,
    private globalSearchService: GlobalSearchService
  ) {}

  ngOnInit(): void {
    this.loadMessages();
    this.setupGlobalSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.globalSearchService.clearConfig();
  }

  private setupGlobalSearch(): void {
    // Configurer la recherche pour cette page
    this.globalSearchService.setSearchConfig({
      placeholder: 'Rechercher dans les messages...',
      suggestions: ['évaluation', 'maintenance', 'erreur', 'non lu', 'système'],
      onSearch: (query: string) => {
        this.searchQuery.set(query);
        this.applyFilters();
      },
      onClear: () => {
        this.searchQuery.set('');
        this.applyFilters();
      }
    });

    // Écouter les recherches depuis la navbar
    this.globalSearchService.search$
      .pipe(takeUntil(this.destroy$))
      .subscribe(query => {
        this.searchQuery.set(query);
        this.applyFilters();
      });
  }

  private loadMessages(): void {
    this.messages.set(this.messagesService.getMessages());
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

    // Recherche textuelle
    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      filtered = filtered.filter(msg => 
        msg.title.toLowerCase().includes(query) ||
        msg.content.toLowerCase().includes(query) ||
        (msg.sender && msg.sender.toLowerCase().includes(query))
      );
    }

    this.filteredMessages.set(filtered);
  }

  markAsRead(messageId: string): void {
    this.messagesService.markAsRead(messageId);
    this.loadMessages(); // Recharger les messages
  }

  markAllAsRead(): void {
    this.messagesService.markAllAsRead();
    this.loadMessages(); // Recharger les messages
  }

  deleteMessage(messageId: string): void {
    this.messagesService.deleteMessage(messageId);
    this.loadMessages(); // Recharger les messages
  }

  getUnreadCount(): number {
    return this.messagesService.getUnreadCount();
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