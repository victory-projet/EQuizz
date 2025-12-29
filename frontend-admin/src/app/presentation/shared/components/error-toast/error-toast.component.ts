import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { ErrorHandlerService, AppError } from '../../../../core/services/error-handler.service';
import { Subject, takeUntil, timer } from 'rxjs';

@Component({
  selector: 'app-error-toast',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
      ])
    ])
  ],
  template: `
    <div class="error-toast-container">
      @for (error of visibleErrors(); track error.id) {
        <div 
          class="error-toast"
          [class]="getErrorClass(error)"
          [@slideIn]
        >
          <div class="error-content">
            <div class="error-icon">
              <span class="material-icons">{{ getErrorIcon(error.type) }}</span>
            </div>
            
            <div class="error-message">
              <div class="error-title">{{ error.message }}</div>
              @if (error.details && showDetails()) {
                <div class="error-details">{{ error.details }}</div>
              }
            </div>
            
            <div class="error-actions">
              @if (error.isRetryable) {
                <button 
                  class="retry-btn"
                  (click)="retryAction(error)"
                  title="Réessayer"
                >
                  <span class="material-icons">refresh</span>
                </button>
              }
              
              <button 
                class="close-btn"
                (click)="dismissError(error.id)"
                title="Fermer"
              >
                <span class="material-icons">close</span>
              </button>
            </div>
          </div>
          
          <!-- Barre de progression pour l'auto-dismiss -->
          @if (getAutoDismissTime(error) > 0) {
            <div class="progress-bar">
              <div 
                class="progress-fill"
                [style.animation-duration]="getAutoDismissTime(error) + 'ms'"
              ></div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .error-toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      max-width: 400px;
      pointer-events: none;
    }

    .error-toast {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      margin-bottom: 12px;
      overflow: hidden;
      pointer-events: auto;
      position: relative;
      border-left: 4px solid;
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .error-toast.error-network {
      border-left-color: #ff9800;
    }

    .error-toast.error-auth {
      border-left-color: #f44336;
    }

    .error-toast.error-validation {
      border-left-color: #ff5722;
    }

    .error-toast.error-server {
      border-left-color: #9c27b0;
    }

    .error-toast.error-unknown {
      border-left-color: #607d8b;
    }

    .error-content {
      display: flex;
      align-items: flex-start;
      padding: 16px;
      gap: 12px;
    }

    .error-icon {
      flex-shrink: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .error-icon .material-icons {
      font-size: 20px;
      color: #666;
    }

    .error-message {
      flex: 1;
      min-width: 0;
    }

    .error-title {
      font-weight: 500;
      color: #333;
      font-size: 14px;
      line-height: 1.4;
      margin-bottom: 4px;
    }

    .error-details {
      font-size: 12px;
      color: #666;
      line-height: 1.3;
      word-break: break-word;
    }

    .error-actions {
      display: flex;
      gap: 4px;
      flex-shrink: 0;
    }

    .retry-btn,
    .close-btn {
      width: 32px;
      height: 32px;
      border: none;
      background: transparent;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s;
    }

    .retry-btn:hover {
      background-color: rgba(76, 175, 80, 0.1);
    }

    .close-btn:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }

    .retry-btn .material-icons {
      font-size: 18px;
      color: #4caf50;
    }

    .close-btn .material-icons {
      font-size: 18px;
      color: #666;
    }

    .progress-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2px;
      background-color: rgba(0, 0, 0, 0.1);
    }

    .progress-fill {
      height: 100%;
      background-color: currentColor;
      width: 100%;
      transform-origin: left;
      animation: progress linear;
    }

    @keyframes progress {
      from {
        transform: scaleX(1);
      }
      to {
        transform: scaleX(0);
      }
    }

    /* Responsive */
    @media (max-width: 480px) {
      .error-toast-container {
        left: 20px;
        right: 20px;
        max-width: none;
      }
      
      .error-content {
        padding: 12px;
      }
      
      .error-title {
        font-size: 13px;
      }
      
      .error-details {
        font-size: 11px;
      }
    }
  `]
})
export class ErrorToastComponent implements OnInit, OnDestroy {
  private errorHandler = inject(ErrorHandlerService);
  private destroy$ = new Subject<void>();
  
  visibleErrors = signal<AppError[]>([]);
  showDetails = signal(false);
  
  // Configuration
  private readonly MAX_VISIBLE_ERRORS = 3;
  private readonly AUTO_DISMISS_TIMES = {
    network: 5000,
    auth: 0, // Pas d'auto-dismiss pour les erreurs d'auth
    validation: 4000,
    server: 6000,
    unknown: 5000
  };
  
  ngOnInit(): void {
    // Écouter les changements d'erreurs
    // Note: Les signaux Angular n'ont pas de méthode pipe, on utilise effect() à la place
    this.setupErrorSubscription();
  }
  
  private setupErrorSubscription(): void {
    // Utiliser un interval pour vérifier les changements d'erreurs
    timer(0, 1000).pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      const errors = this.errorHandler.errors();
      
      // Afficher seulement les N dernières erreurs
      const visibleErrors = errors.slice(0, this.MAX_VISIBLE_ERRORS);
      const currentVisible = this.visibleErrors();
      
      // Mettre à jour seulement si les erreurs ont changé
      if (JSON.stringify(visibleErrors) !== JSON.stringify(currentVisible)) {
        this.visibleErrors.set(visibleErrors);
        
        // Programmer l'auto-dismiss pour les nouvelles erreurs
        visibleErrors.forEach((error: AppError) => {
          const dismissTime = this.getAutoDismissTime(error);
          if (dismissTime > 0) {
            timer(dismissTime).subscribe(() => {
              this.dismissError(error.id);
            });
          }
        });
      }
    });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  /**
   * Ferme une erreur spécifique
   */
  dismissError(errorId: string): void {
    this.errorHandler.dismissError(errorId);
  }
  
  /**
   * Tente de réessayer l'action qui a causé l'erreur
   */
  retryAction(error: AppError): void {
    console.log('🔄 Retry action for error:', error);
    
    // Pour l'instant, on ferme juste l'erreur
    // Dans une implémentation complète, on pourrait relancer la requête
    this.dismissError(error.id);
    
    // Optionnel: recharger la page pour les erreurs réseau
    if (error.type === 'network') {
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  }
  
  /**
   * Obtient la classe CSS pour le type d'erreur
   */
  getErrorClass(error: AppError): string {
    return `error-${error.type}`;
  }
  
  /**
   * Obtient l'icône pour le type d'erreur
   */
  getErrorIcon(type: AppError['type']): string {
    const icons = {
      network: 'wifi_off',
      auth: 'lock',
      validation: 'warning',
      server: 'error',
      unknown: 'help'
    };
    return icons[type] || 'error';
  }
  
  /**
   * Obtient le temps d'auto-dismiss pour une erreur
   */
  getAutoDismissTime(error: AppError): number {
    return this.AUTO_DISMISS_TIMES[error.type] || 0;
  }
  
  /**
   * Bascule l'affichage des détails
   */
  toggleDetails(): void {
    this.showDetails.set(!this.showDetails());
  }
}