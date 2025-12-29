export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  category: NotificationCategory;
  isRead: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: NotificationMetadata;
  userId?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
}

export type NotificationType = 
  | 'info' 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'system';

export type NotificationPriority = 
  | 'low' 
  | 'medium' 
  | 'high' 
  | 'critical';

export type NotificationCategory = 
  | 'evaluation' 
  | 'user' 
  | 'system' 
  | 'security' 
  | 'performance' 
  | 'maintenance';

export interface NotificationMetadata {
  [key: string]: any;
  source?: string;
  tags?: string[];
  data?: any;
}

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  icon: string;
  color: string;
  createdAt: Date;
  userId: string;
  userName: string;
  userRole: string;
  entityId?: string;
  entityType?: string;
  metadata?: ActivityMetadata;
}

export type ActivityType = 
  | 'evaluation_created'
  | 'evaluation_published'
  | 'evaluation_updated'
  | 'evaluation_closed'
  | 'evaluation_deleted'
  | 'user_created'
  | 'user_updated'
  | 'user_deleted'
  | 'user_login'
  | 'user_logout'
  | 'class_created'
  | 'class_updated'
  | 'class_deleted'
  | 'course_created'
  | 'course_updated'
  | 'course_deleted'
  | 'system_backup'
  | 'system_maintenance'
  | 'security_alert';

export interface ActivityMetadata {
  [key: string]: any;
  changes?: any;
  previousValues?: any;
  ipAddress?: string;
  userAgent?: string;
}

export interface NotificationSettings {
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  categories: {
    [key in NotificationCategory]: {
      enabled: boolean;
      email: boolean;
      push: boolean;
      minPriority: NotificationPriority;
    };
  };
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:mm format
    endTime: string;   // HH:mm format
  };
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
}

export interface NotificationFilter {
  type?: NotificationType[];
  priority?: NotificationPriority[];
  category?: NotificationCategory[];
  isRead?: boolean;
  isArchived?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ActivityFilter {
  type?: ActivityType[];
  userId?: string;
  entityType?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface NotificationSummary {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
  byPriority: Record<NotificationPriority, number>;
  byCategory: Record<NotificationCategory, number>;
}

export interface ActivitySummary {
  total: number;
  today: number;
  thisWeek: number;
  byType: Record<ActivityType, number>;
  byUser: Array<{
    userId: string;
    userName: string;
    count: number;
  }>;
}