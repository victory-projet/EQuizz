import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-auth-debug',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="auth-debug" *ngIf="showDebug()">
      <h4>🔍 Auth Debug Info</h4>
      <div class="debug-info">
        <p><strong>Authenticated:</strong> {{ authService.isAuthenticated() ? '✅' : '❌' }}</p>
        <p><strong>Current User:</strong> {{ authService.currentUser()?.email || 'None' }}</p>
        <p><strong>Token exists:</strong> {{ hasToken() ? '✅' : '❌' }}</p>
        <p><strong>Token preview:</strong> {{ getTokenPreview() }}</p>
        <button (click)="checkAuth()" class="btn-debug">🔄 Recheck Auth</button>
        <button (click)="clearAuth()" class="btn-debug">🗑️ Clear Auth</button>
        <button (click)="toggleDebug()" class="btn-debug">❌ Hide Debug</button>
      </div>
    </div>
    <button *ngIf="!showDebug()" (click)="toggleDebug()" class="debug-toggle">🔍 Show Auth Debug</button>
  `,
  styles: [`
    .auth-debug {
      position: fixed;
      top: 10px;
      right: 10px;
      background: #f8f9fa;
      border: 2px solid #007bff;
      border-radius: 8px;
      padding: 15px;
      z-index: 9999;
      max-width: 300px;
      font-size: 12px;
    }
    .debug-info p {
      margin: 5px 0;
    }
    .btn-debug {
      margin: 2px;
      padding: 4px 8px;
      font-size: 10px;
      border: 1px solid #ccc;
      background: white;
      cursor: pointer;
      border-radius: 4px;
    }
    .debug-toggle {
      position: fixed;
      top: 10px;
      right: 10px;
      z-index: 9999;
      padding: 8px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
  `]
})
export class AuthDebugComponent {
  showDebug = signal(false);

  constructor(public authService: AuthService) {}

  hasToken(): boolean {
    const token = localStorage.getItem('token');
    return !!(token && token !== 'null' && token !== 'undefined');
  }

  getTokenPreview(): string {
    const token = localStorage.getItem('token');
    if (!token || token === 'null' || token === 'undefined') {
      return 'No token';
    }
    return token.substring(0, 20) + '...';
  }

  checkAuth(): void {
    // Force recheck auth
    window.location.reload();
  }

  clearAuth(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  }

  toggleDebug(): void {
    this.showDebug.set(!this.showDebug());
  }
}