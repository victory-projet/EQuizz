import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Service pour gérer les problèmes de chargement des chunks (lazy loading)
 */
@Injectable({
  providedIn: 'root'
})
export class ChunkLoaderService {
  private router = inject(Router);
  private failedChunks = new Set<string>();
  private retryAttempts = new Map<string, number>();
  
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly RETRY_DELAY = 1000; // 1 seconde
  
  /**
   * Gère les erreurs de chargement de chunks
   */
  handleChunkError(error: any, chunkName?: string): void {
    console.error('🔧 Erreur de chargement de chunk:', error);
    
    const chunk = chunkName || this.extractChunkName(error);
    
    if (chunk) {
      this.failedChunks.add(chunk);
      const attempts = this.retryAttempts.get(chunk) || 0;
      
      if (attempts < this.MAX_RETRY_ATTEMPTS) {
        this.retryAttempts.set(chunk, attempts + 1);
        console.log(`🔄 Tentative ${attempts + 1}/${this.MAX_RETRY_ATTEMPTS} pour le chunk: ${chunk}`);
        
        // Attendre avant de réessayer
        setTimeout(() => {
          this.retryChunkLoad(chunk);
        }, this.RETRY_DELAY * (attempts + 1));
      } else {
        console.error(`❌ Échec définitif du chargement du chunk: ${chunk}`);
        this.handleChunkFailure(chunk);
      }
    } else {
      // Erreur générale de chargement
      this.handleGeneralLoadError(error);
    }
  }
  
  /**
   * Extrait le nom du chunk depuis l'erreur
   */
  private extractChunkName(error: any): string | null {
    if (error?.message) {
      const chunkMatch = error.message.match(/chunk-([A-Z0-9]+)\.js/i);
      if (chunkMatch) {
        return chunkMatch[0];
      }
    }
    
    if (error?.filename) {
      const filenameMatch = error.filename.match(/chunk-([A-Z0-9]+)\.js/i);
      if (filenameMatch) {
        return filenameMatch[0];
      }
    }
    
    return null;
  }
  
  /**
   * Tente de recharger un chunk spécifique
   */
  private retryChunkLoad(chunkName: string): void {
    // Pour les chunks Angular, on peut essayer de recharger la page
    // ou de naviguer vers une route qui force le rechargement
    console.log(`🔄 Rechargement du chunk: ${chunkName}`);
    
    // Stratégie 1: Recharger la page actuelle
    if (this.shouldReloadPage(chunkName)) {
      window.location.reload();
      return;
    }
    
    // Stratégie 2: Naviguer vers le dashboard puis revenir
    const currentUrl = this.router.url;
    if (currentUrl !== '/dashboard') {
      this.router.navigate(['/dashboard']).then(() => {
        setTimeout(() => {
          this.router.navigateByUrl(currentUrl);
        }, 500);
      });
    }
  }
  
  /**
   * Détermine si on doit recharger la page pour ce chunk
   */
  private shouldReloadPage(chunkName: string): boolean {
    // Recharger la page pour les chunks critiques
    const criticalChunks = [
      'main',
      'polyfills',
      'vendor',
      'runtime'
    ];
    
    return criticalChunks.some(critical => 
      chunkName.toLowerCase().includes(critical)
    );
  }
  
  /**
   * Gère l'échec définitif d'un chunk
   */
  private handleChunkFailure(chunkName: string): void {
    console.error(`💥 Échec définitif du chunk: ${chunkName}`);
    
    // Afficher un message à l'utilisateur
    this.showChunkErrorMessage(chunkName);
    
    // Rediriger vers une page de fallback
    this.router.navigate(['/dashboard'], {
      queryParams: { 
        error: 'chunk_load_failed',
        chunk: chunkName 
      }
    });
  }
  
  /**
   * Gère les erreurs générales de chargement
   */
  private handleGeneralLoadError(error: any): void {
    console.error('🔧 Erreur générale de chargement:', error);
    
    // Vérifier si c'est un problème de réseau
    if (this.isNetworkError(error)) {
      console.log('🌐 Problème de réseau détecté');
      // Attendre un peu puis recharger
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } else {
      // Autre type d'erreur
      console.log('🔧 Erreur de chargement non-réseau');
    }
  }
  
  /**
   * Vérifie si l'erreur est liée au réseau
   */
  private isNetworkError(error: any): boolean {
    return (
      error?.message?.includes('Loading chunk') ||
      error?.message?.includes('Loading CSS chunk') ||
      error?.message?.includes('Failed to fetch') ||
      error?.name === 'ChunkLoadError'
    );
  }
  
  /**
   * Affiche un message d'erreur à l'utilisateur
   */
  private showChunkErrorMessage(chunkName: string): void {
    // Créer une notification temporaire
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f44336;
      color: white;
      padding: 16px;
      border-radius: 4px;
      z-index: 10000;
      max-width: 300px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    `;
    notification.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 8px;">
        Erreur de chargement
      </div>
      <div style="font-size: 14px;">
        Impossible de charger certains composants. 
        La page va être rechargée automatiquement.
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Supprimer après 5 secondes
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  }
  
  /**
   * Nettoie les données de retry pour un chunk
   */
  clearChunkRetryData(chunkName: string): void {
    this.failedChunks.delete(chunkName);
    this.retryAttempts.delete(chunkName);
  }
  
  /**
   * Obtient les statistiques des chunks échoués
   */
  getFailedChunksStats(): {
    failedChunks: string[];
    totalRetries: number;
  } {
    return {
      failedChunks: Array.from(this.failedChunks),
      totalRetries: Array.from(this.retryAttempts.values())
        .reduce((sum, attempts) => sum + attempts, 0)
    };
  }
  
  /**
   * Réinitialise toutes les données de retry
   */
  reset(): void {
    this.failedChunks.clear();
    this.retryAttempts.clear();
  }
}