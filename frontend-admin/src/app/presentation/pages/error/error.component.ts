import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="error-container">
      <div class="error-content">
        <span class="error-icon">{{ getErrorIcon() }}</span>
        <h1 class="error-code">{{ errorCode() }}</h1>
        <h2 class="error-title">{{ getErrorTitle() }}</h2>
        <p class="error-message">{{ getErrorMessage() }}</p>
        
        <div class="error-actions">
          <button class="btn-primary" (click)="goHome()">
            Retour à l'accueil
          </button>
          <button class="btn-secondary" (click)="goBack()">
            Page précédente
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .error-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .error-content {
      text-align: center;
      background: white;
      border-radius: 16px;
      padding: 4rem 3rem;
      max-width: 600px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .error-icon {
      font-size: 6rem;
      display: block;
      margin-bottom: 1rem;
    }

    .error-code {
      font-size: 4rem;
      font-weight: 700;
      color: #4f46e5;
      margin-bottom: 1rem;
    }

    .error-title {
      font-size: 2rem;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 1rem;
    }

    .error-message {
      color: #666;
      font-size: 1.125rem;
      margin-bottom: 2rem;
    }

    .error-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;

      button {
        padding: 0.875rem 2rem;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }

      .btn-primary {
        background: #4f46e5;
        color: white;
        border: none;

        &:hover {
          background: #4338ca;
        }
      }

      .btn-secondary {
        background: white;
        color: #4f46e5;
        border: 2px solid #4f46e5;

        &:hover {
          background: #f5f3ff;
        }
      }
    }
  `]
})
export class ErrorComponent {
  errorCode = input('404');

  constructor(private router: Router) {}

  getErrorIcon(): string {
    const icons: Record<string, string> = {
      '404': '🔍',
      '403': '🔒',
      '500': '⚠️'
    };
    return icons[this.errorCode()] || '❌';
  }

  getErrorTitle(): string {
    const titles: Record<string, string> = {
      '404': 'Page non trouvée',
      '403': 'Accès refusé',
      '500': 'Erreur serveur'
    };
    return titles[this.errorCode()] || 'Une erreur est survenue';
  }

  getErrorMessage(): string {
    const messages: Record<string, string> = {
      '404': 'La page que vous recherchez n\'existe pas ou a été déplacée.',
      '403': 'Vous n\'avez pas les permissions nécessaires pour accéder à cette page.',
      '500': 'Une erreur interne s\'est produite. Veuillez réessayer plus tard.'
    };
    return messages[this.errorCode()] || 'Quelque chose s\'est mal passé.';
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  goBack(): void {
    window.history.back();
  }
}
