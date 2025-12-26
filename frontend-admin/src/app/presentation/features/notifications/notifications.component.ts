import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Notification {
  id: string;
  type: 'alert' | 'activity';
  subType: 'info' | 'warning' | 'error' | 'success' | 'evaluation_created' | 'evaluation_published' | 'evaluation_closed' | 'user_created' | 'course_created' | 'class_created';
  title: string;
  message?: string;
  description?: string;
  date: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  actionLabel?: string;
  user?: string;
  icon?: string;
  color?: string;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  notifications = signal<Notification[]>([]);
  isLoading = signal(true);
  errorMessage = signal('');
  
  // Filtres et recherche
  selectedFilter = signal<'all' | 'unread' | 'alerts' | 'activities'>('all');
  searchTerm = signal('');
  
  // Pagination
  currentPage = signal(1);
  itemsPerPage = 10;
  
  // Computed values
  totalCount = computed(() => this.notifications().length);
  unreadCount = computed(() => this.notifications().filter(n => !n.isRead).length);
  
  filteredNotifications = computed(() => {
    let filtered = this.notifications();
    
    // Filtre par type
    switch (this.selectedFilter()) {
      case 'unread':
        filtered = filtered.filter(n => !n.isRead);
        break;
      case 'alerts':
        filtered = filtered.filter(n => n.type === 'alert');
        break;
      case 'activities':
        filtered = filtered.filter(n => n.type === 'activity');
        break;
    }
    
    // Filtre par recherche
    const search = this.searchTerm().toLowerCase();
    if (search) {
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(search) ||
        (n.message && n.message.toLowerCase().includes(search)) ||
        (n.description && n.description.toLowerCase().includes(search)) ||
        (n.user && n.user.toLowerCase().includes(search))
      );
    }
    
    // Trier par date (plus récent en premier)
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });
  
  totalPages = computed(() => Math.ceil(this.filteredNotifications().length / this.itemsPerPage));
  
  paginatedNotifications = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredNotifications().slice(start, end);
  });

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.http.get<any>(`${environment.apiUrl}/notifications`).subscribe({
      next: (data) => {
        console.log('📬 Notifications loaded:', data);
        
        // Combiner les alertes et activités
        const allNotifications: Notification[] = [
          ...(data.alerts || []).map((alert: any) => ({
            ...alert,
            type: 'alert' as const,
            subType: alert.type || 'info'
          })),
          ...(data.activitesRecentes || []).map((activity: any) => ({
            ...activity,
            type: 'activity' as const,
            subType: activity.type || 'info',
            message: activity.description,
            isRead: activity.isRead || false,
            priority: activity.priority || 'medium'
          }))
        ];
        
        this.notifications.set(allNotifications);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('❌ Error loading notifications:', error);
        this.errorMessage.set('Erreur lors du chargement des notifications');
        this.isLoading.set(false);
      }
    });
  }

  refreshNotifications(): void {
    this.loadNotifications();
  }

  setFilter(filter: 'all' | 'unread' | 'alerts' | 'activities'): void {
    this.selectedFilter.set(filter);
    this.currentPage.set(1); // Reset pagination
  }

  onSearch(): void {
    this.currentPage.set(1); // Reset pagination
  }

  markAsRead(notificationId: string): void {
    const notifications = this.notifications();
    const updatedNotifications = notifications.map(n => 
      n.id === notificationId ? { ...n, isRead: true } : n
    );
    
    this.notifications.set(updatedNotifications);

    // Appel API
    this.http.patch(`${environment.apiUrl}/notifications/${notificationId}/read`, {}).subscribe({
      next: () => console.log('✅ Notification marked as read'),
      error: (error) => {
        console.error('❌ Error marking notification as read:', error);
        // Revert on error
        this.notifications.set(notifications);
      }
    });
  }

  markAllAsRead(): void {
    const notifications = this.notifications();
    const updatedNotifications = notifications.map(n => ({ ...n, isRead: true }));
    
    this.notifications.set(updatedNotifications);

    // Appel API
    this.http.patch(`${environment.apiUrl}/notifications/mark-all-read`, {}).subscribe({
      next: () => console.log('✅ All notifications marked as read'),
      error: (error) => {
        console.error('❌ Error marking all notifications as read:', error);
        // Revert on error
        this.notifications.set(notifications);
      }
    });
  }

  deleteNotification(notificationId: string): void {
    const notifications = this.notifications();
    const updatedNotifications = notifications.filter(n => n.id !== notificationId);
    
    this.notifications.set(updatedNotifications);

    // Appel API
    this.http.delete(`${environment.apiUrl}/notifications/${notificationId}`).subscribe({
      next: () => console.log('✅ Notification deleted'),
      error: (error) => {
        console.error('❌ Error deleting notification:', error);
        // Revert on error
        this.notifications.set(notifications);
      }
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  getFilteredNotifications(): Notification[] {
    return this.paginatedNotifications();
  }

  getNotificationClass(notification: Notification): string {
    return `notification-${notification.type}`;
  }

  getNotificationIcon(notification: Notification): string {
    if (notification.icon) return notification.icon;
    
    const icons: { [key: string]: string } = {
      // Alerts
      'info': 'info',
      'warning': 'warning',
      'error': 'error',
      'success': 'check_circle',
      
      // Activities
      'evaluation_created': 'quiz',
      'evaluation_published': 'publish',
      'evaluation_closed': 'lock',
      'user_created': 'person_add',
      'course_created': 'menu_book',
      'class_created': 'group_add'
    };
    
    return icons[notification.subType] || 'notifications';
  }

  getNotificationColor(notification: Notification): string {
    if (notification.color) return notification.color;
    
    const colors: { [key: string]: string } = {
      // Alerts
      'info': '#3b82f6',
      'warning': '#f59e0b',
      'error': '#ef4444',
      'success': '#10b981',
      
      // Activities
      'evaluation_created': '#8b5cf6',
      'evaluation_published': '#10b981',
      'evaluation_closed': '#6b7280',
      'user_created': '#3b82f6',
      'course_created': '#f59e0b',
      'class_created': '#ec4899'
    };
    
    return colors[notification.subType] || '#6b7280';
  }

  getTimeAgo(date: string): string {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Il y a ${diffInDays}j`;
    
    return notificationDate.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
}

