import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GlobalConfirmationComponent } from './presentation/shared/components/global-confirmation/global-confirmation.component';
import { ErrorToastComponent } from './presentation/shared/components/error-toast/error-toast.component';
import { ChunkLoaderService } from './core/services/chunk-loader.service';
import { ErrorHandlerService } from './core/services/error-handler.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, 
    GlobalConfirmationComponent,
    ErrorToastComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('frontend-admin');
  
  private chunkLoader = inject(ChunkLoaderService);
  private errorHandler = inject(ErrorHandlerService);
  
  ngOnInit(): void {
    this.setupGlobalErrorHandlers();
  }
  
  ngOnDestroy(): void {
    // Nettoyer les gestionnaires d'erreurs si nécessaire
  }
  
  /**
   * Configure les gestionnaires d'erreurs globaux
   */
  private setupGlobalErrorHandlers(): void {
    // Gestionnaire pour les erreurs de chargement de chunks
    window.addEventListener('error', (event) => {
      if (this.isChunkLoadError(event.error)) {
        event.preventDefault();
        this.chunkLoader.handleChunkError(event.error);
      }
    });
    
    // Gestionnaire pour les promesses rejetées non gérées
    window.addEventListener('unhandledrejection', (event) => {
      if (this.isChunkLoadError(event.reason)) {
        event.preventDefault();
        this.chunkLoader.handleChunkError(event.reason);
      }
    });
    
    // Log des erreurs pour le debugging
    console.log('🔧 Gestionnaires d\'erreurs globaux configurés');
  }
  
  /**
   * Vérifie si l'erreur est liée au chargement de chunks
   */
  private isChunkLoadError(error: any): boolean {
    if (!error) return false;
    
    const errorMessage = error.message || error.toString();
    return (
      errorMessage.includes('Loading chunk') ||
      errorMessage.includes('Loading CSS chunk') ||
      errorMessage.includes('chunk-') ||
      error.name === 'ChunkLoadError'
    );
  }
}
