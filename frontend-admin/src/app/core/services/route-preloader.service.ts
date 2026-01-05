import { Injectable, inject } from '@angular/core';
import { Router, Route } from '@angular/router';
import { Observable, from, of, EMPTY } from 'rxjs';
import { catchError, tap, switchMap } from 'rxjs/operators';

export interface PreloadConfig {
  delay?: number; // Délai avant le préchargement (ms)
  priority?: 'high' | 'medium' | 'low';
  condition?: () => boolean; // Condition pour décider du préchargement
}

export interface PreloadedRoute {
  path: string;
  loadTime: number;
  success: boolean;
  error?: any;
}

@Injectable({
  providedIn: 'root'
})
export class RoutePreloaderService {
  private router = inject(Router);
  
  private preloadedRoutes = new Map<string, PreloadedRoute>();
  private preloadingQueue: Array<{ route: Route; config: PreloadConfig }> = [];
  private isPreloading = false;

  /**
   * Précharge une route spécifique
   */
  preloadRoute(routePath: string, config: PreloadConfig = {}): Observable<boolean> {
    const route = this.findRouteByPath(routePath);
    
    if (!route || !route.loadChildren) {
      console.warn(`Route ${routePath} non trouvée ou ne supporte pas le lazy loading`);
      return of(false);
    }

    // Vérifier si déjà préchargée
    if (this.preloadedRoutes.has(routePath)) {
      return of(this.preloadedRoutes.get(routePath)!.success);
    }

    const startTime = performance.now();
    
    return this.loadRouteModule(route).pipe(
      tap(() => {
        const loadTime = performance.now() - startTime;
        this.preloadedRoutes.set(routePath, {
          path: routePath,
          loadTime,
          success: true
        });
        console.log(`Route ${routePath} préchargée en ${loadTime.toFixed(2)}ms`);
      }),
      switchMap(() => of(true)),
      catchError(error => {
        this.preloadedRoutes.set(routePath, {
          path: routePath,
          loadTime: performance.now() - startTime,
          success: false,
          error
        });
        console.error(`Erreur préchargement route ${routePath}:`, error);
        return of(false);
      })
    );
  }

  /**
   * Précharge plusieurs routes avec priorité
   */
  preloadRoutes(routes: Array<{ path: string; config?: PreloadConfig }>): void {
    // Trier par priorité
    const sortedRoutes = routes.sort((a, b) => {
      const priorityA = this.getPriorityValue(a.config?.priority || 'medium');
      const priorityB = this.getPriorityValue(b.config?.priority || 'medium');
      return priorityB - priorityA; // Priorité élevée en premier
    });

    sortedRoutes.forEach(({ path, config = {} }) => {
      const route = this.findRouteByPath(path);
      if (route) {
        this.preloadingQueue.push({ route, config });
      }
    });

    this.processPreloadingQueue();
  }

  /**
   * Précharge les routes critiques (haute priorité)
   */
  preloadCriticalRoutes(): void {
    const criticalRoutes = [
      { path: '/dashboard', config: { priority: 'high' as const } },
      { path: '/evaluations', config: { priority: 'high' as const } },
      { path: '/students', config: { priority: 'high' as const } }
    ];

    this.preloadRoutes(criticalRoutes);
  }

  /**
   * Précharge les routes en fonction de l'utilisation
   */
  preloadByUsagePattern(userRole: string): void {
    const routesByRole: Record<string, Array<{ path: string; config?: PreloadConfig }>> = {
      'ADMIN': [
        { path: '/dashboard', config: { priority: 'high' } },
        { path: '/students', config: { priority: 'high' } },
        { path: '/evaluations', config: { priority: 'medium' } },
        { path: '/reports', config: { priority: 'medium' } },
        { path: '/archive-management', config: { priority: 'low' } }
      ],
      'ENSEIGNANT': [
        { path: '/dashboard', config: { priority: 'high' } },
        { path: '/evaluations', config: { priority: 'high' } },
        { path: '/evaluation-create', config: { priority: 'high' } },
        { path: '/students', config: { priority: 'medium' } },
        { path: '/reports', config: { priority: 'medium' } }
      ]
    };

    const routes = routesByRole[userRole] || [];
    this.preloadRoutes(routes);
  }

  /**
   * Précharge les routes sur hover (au survol des liens)
   */
  preloadOnHover(routePath: string): void {
    if (!this.preloadedRoutes.has(routePath)) {
      this.preloadRoute(routePath, { 
        delay: 100, // Petit délai pour éviter les préchargements accidentels
        priority: 'medium' 
      }).subscribe();
    }
  }

  /**
   * Précharge les routes en arrière-plan quand l'application est inactive
   */
  preloadOnIdle(routes: string[]): void {
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        routes.forEach(path => {
          this.preloadRoute(path, { priority: 'low' }).subscribe();
        });
      });
    } else {
      // Fallback pour les navigateurs qui ne supportent pas requestIdleCallback
      setTimeout(() => {
        routes.forEach(path => {
          this.preloadRoute(path, { priority: 'low' }).subscribe();
        });
      }, 2000);
    }
  }

  /**
   * Obtient les statistiques de préchargement
   */
  getPreloadStats(): {
    totalPreloaded: number;
    successfulPreloads: number;
    failedPreloads: number;
    averageLoadTime: number;
    preloadedRoutes: PreloadedRoute[];
  } {
    const preloadedRoutes = Array.from(this.preloadedRoutes.values());
    const successful = preloadedRoutes.filter(r => r.success);
    const failed = preloadedRoutes.filter(r => !r.success);
    
    const averageLoadTime = successful.length > 0 
      ? successful.reduce((sum, r) => sum + r.loadTime, 0) / successful.length 
      : 0;

    return {
      totalPreloaded: preloadedRoutes.length,
      successfulPreloads: successful.length,
      failedPreloads: failed.length,
      averageLoadTime,
      preloadedRoutes
    };
  }

  /**
   * Vérifie si une route est préchargée
   */
  isRoutePreloaded(routePath: string): boolean {
    const preloaded = this.preloadedRoutes.get(routePath);
    return preloaded ? preloaded.success : false;
  }

  /**
   * Nettoie le cache de préchargement
   */
  clearPreloadCache(): void {
    this.preloadedRoutes.clear();
    this.preloadingQueue = [];
  }

  private findRouteByPath(path: string): Route | null {
    const routes = this.router.config;
    
    const findRoute = (routes: Route[], targetPath: string): Route | null => {
      for (const route of routes) {
        if (route.path === targetPath.replace('/', '')) {
          return route;
        }
        
        if (route.children) {
          const childRoute = findRoute(route.children, targetPath);
          if (childRoute) return childRoute;
        }
      }
      return null;
    };

    return findRoute(routes, path);
  }

  private loadRouteModule(route: Route): Observable<any> {
    if (!route.loadChildren) {
      return EMPTY;
    }

    try {
      if (typeof route.loadChildren === 'function') {
        const result = route.loadChildren();
        // Handle both Promise and Observable returns
        if (result && typeof (result as any).then === 'function') {
          return from(result as Promise<any>);
        } else if (result && typeof (result as any).subscribe === 'function') {
          return result as Observable<any>;
        } else {
          return from(Promise.resolve(result));
        }
      } else {
        // Pour les anciennes versions d'Angular
        return from(Promise.resolve(route.loadChildren));
      }
    } catch (error) {
      return EMPTY;
    }
  }

  private processPreloadingQueue(): void {
    if (this.isPreloading || this.preloadingQueue.length === 0) {
      return;
    }

    this.isPreloading = true;
    
    const processNext = () => {
      if (this.preloadingQueue.length === 0) {
        this.isPreloading = false;
        return;
      }

      const { route, config } = this.preloadingQueue.shift()!;
      const delay = config.delay || 0;
      
      // Vérifier la condition si elle existe
      if (config.condition && !config.condition()) {
        processNext();
        return;
      }

      setTimeout(() => {
        this.loadRouteModule(route).subscribe({
          next: () => {
            console.log(`Route ${route.path} préchargée`);
            processNext();
          },
          error: (error) => {
            console.error(`Erreur préchargement route ${route.path}:`, error);
            processNext();
          }
        });
      }, delay);
    };

    processNext();
  }

  private getPriorityValue(priority: 'high' | 'medium' | 'low'): number {
    switch (priority) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 2;
    }
  }
}