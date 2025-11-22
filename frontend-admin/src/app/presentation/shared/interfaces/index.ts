// Shared Interfaces Barrel Export
export * from './user.interface';
export * from './analytics.interface';

// Re-export Notification interface from service
export type { Notification } from '../../../core/services/notification.service';
