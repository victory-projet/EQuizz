// src/app/core/services/toast.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ToastMessage {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  dismissible?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new Subject<ToastMessage>();
  toast$ = this.toastSubject.asObservable();

  success(message: string, duration = 5000): void {
    this.show({ type: 'success', message, duration });
  }

  error(message: string, duration = 7000): void {
    this.show({ type: 'error', message, duration });
  }

  warning(message: string, duration = 6000): void {
    this.show({ type: 'warning', message, duration });
  }

  info(message: string, duration = 5000): void {
    this.show({ type: 'info', message, duration });
  }

  show(toast: ToastMessage): void {
    this.toastSubject.next({
      ...toast,
      duration: toast.duration ?? 5000,
      dismissible: toast.dismissible ?? true
    });
  }
}
