import { Injectable, ComponentRef, ViewContainerRef, Type } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface LazyComponentConfig {
  loadingTemplate?: string;
  errorTemplate?: string;
  retryAttempts?: number;
  retryDelay?: number;
}

@Injectable({
  providedIn: 'root'
})
export class LazyLoadingService {
  private loadedComponents = new Map<string, Type<any>>();
  private loadingPromises = new Map<string, Promise<Type<any>>>();

  private defaultConfig: LazyComponentConfig = {
    loadingTemplate: '<div class="loading-spinner">Chargement...</div>',
    errorTemplate: '<div class="error-message">Erreur de chargement</div>',
    retryAttempts: 3,
    retryDelay: 1000
  };

  /**
   * Charge un composant de manière lazy
   */
  loadComponent<T>(
    importFn: () => Promise<{ [key: string]: Type<T> }>,
    componentName: string,
    config?: LazyComponentConfig
  ): Observable<Type<T>> {
    const cacheKey = `${componentName}_${importFn.toString()}`;
    
    // Vérifier si le composant est déjà chargé
    if (this.loadedComponents.has(cacheKey)) {
      return of(this.loadedComponents.get(cacheKey)!);
    }

    // Vérifier si le chargement est en cours
    if (this.loadingPromises.has(cacheKey)) {
      return from(this.loadingPromises.get(cacheKey)!);
    }

    // Démarrer le chargement
    const loadingPromise = this.loadWithRetry(importFn, componentName, config);
    this.loadingPromises.set(cacheKey, loadingPromise);

    return from(loadingPromise).pipe(
      map(component => {
        this.loadedComponents.set(cacheKey, component);
        this.loadingPromises.delete(cacheKey);
        return component;
      }),
      catchError(error => {
        this.loadingPromises.delete(cacheKey);
        throw error;
      })
    );
  }

  /**
   * Charge et instancie un composant dans un ViewContainer
   */
  loadAndCreateComponent<T>(
    viewContainer: ViewContainerRef,
    importFn: () => Promise<{ [key: string]: Type<T> }>,
    componentName: string,
    config?: LazyComponentConfig
  ): Observable<ComponentRef<T>> {
    return this.loadComponent(importFn, componentName, config).pipe(
      map(componentType => {
        viewContainer.clear();
        return viewContainer.createComponent(componentType);
      })
    );
  }

  /**
   * Précharge des composants pour améliorer les performances
   */
  preloadComponents(components: Array<{
    importFn: () => Promise<any>;
    componentName: string;
  }>): void {
    components.forEach(({ importFn, componentName }) => {
      // Précharger en arrière-plan sans bloquer l'UI
      setTimeout(() => {
        this.loadComponent(importFn, componentName).subscribe({
          next: () => console.log(`Composant ${componentName} préchargé`),
          error: (error) => console.warn(`Erreur préchargement ${componentName}:`, error)
        });
      }, 100);
    });
  }

  /**
   * Charge un module de manière lazy
   */
  loadModule(importFn: () => Promise<any>): Observable<any> {
    return from(importFn()).pipe(
      catchError(error => {
        console.error('Erreur lors du chargement du module:', error);
        throw error;
      })
    );
  }

  /**
   * Nettoie le cache des composants chargés
   */
  clearCache(): void {
    this.loadedComponents.clear();
    this.loadingPromises.clear();
  }

  /**
   * Obtient les statistiques de chargement
   */
  getStats(): {
    loadedComponents: number;
    loadingInProgress: number;
    componentNames: string[];
  } {
    return {
      loadedComponents: this.loadedComponents.size,
      loadingInProgress: this.loadingPromises.size,
      componentNames: Array.from(this.loadedComponents.keys())
    };
  }

  private async loadWithRetry<T>(
    importFn: () => Promise<{ [key: string]: Type<T> }>,
    componentName: string,
    config?: LazyComponentConfig
  ): Promise<Type<T>> {
    const finalConfig = { ...this.defaultConfig, ...config };
    let lastError: any;

    for (let attempt = 1; attempt <= finalConfig.retryAttempts!; attempt++) {
      try {
        const module = await importFn();
        const component = module[componentName];
        
        if (!component) {
          throw new Error(`Composant ${componentName} non trouvé dans le module`);
        }
        
        return component;
      } catch (error) {
        lastError = error;
        console.warn(`Tentative ${attempt}/${finalConfig.retryAttempts} échouée pour ${componentName}:`, error);
        
        if (attempt < finalConfig.retryAttempts!) {
          await this.delay(finalConfig.retryDelay!);
        }
      }
    }

    throw lastError;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}