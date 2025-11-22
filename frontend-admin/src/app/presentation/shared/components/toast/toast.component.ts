// src/app/shared/components/toast/toast.component.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { Subject, takeUntil } from 'rxjs';
import { icons } from 'lucide-angular';
import { SvgIconComponent } from '../svg-icon/svg-icon';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  dismissible?: boolean;
}

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
  animations: [
    trigger('toastAnimation', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-out', 
          style({ transform: 'translateX(100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    // Subscribe to toast service if needed
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  show(toast: Omit<Toast, 'id'>): void {
    const id = this.generateId();
    const duration = toast.duration ?? 5000;
    const newToast: Toast = {
      id,
      ...toast,
      duration,
      dismissible: toast.dismissible ?? true
    };

    this.toasts.push(newToast);

    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
  }

  remove(id: string): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }

  getIconName(type: string): keyof typeof icons {
    const iconMap: Record<string, keyof typeof icons> = {
      success: 'Check',
      error: 'X',
      warning: 'Info',
      info: 'Info'
    };
    return iconMap[type] || 'Info';
  }

  private generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
