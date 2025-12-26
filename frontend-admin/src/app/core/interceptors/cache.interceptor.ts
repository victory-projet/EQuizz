import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { CacheService } from '../services/cache.service';

@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  private cacheService = inject(CacheService);

  // URLs qui doivent être mises en cache
  private cacheableUrls = [
    '/api/users',
    '/api/classes',
    '/api/teachers',
    '/api/students',
    '/api/evaluations'
  ];

  // Méthodes HTTP qui peuvent être mises en cache
  private cacheableMethods = ['GET'];

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Vérifier si la requête peut être mise en cache
    if (!this.shouldCache(req)) {
      return next.handle(req);
    }

    const cacheKey = this.generateCacheKey(req);
    
    // Vérifier si la réponse est en cache
    const cachedResponse = this.cacheService.get<any>(cacheKey);
    if (cachedResponse) {
      // Retourner la réponse mise en cache
      return of(new HttpResponse({
        body: cachedResponse,
        status: 200,
        statusText: 'OK (from cache)'
      }));
    }

    // Exécuter la requête et mettre en cache la réponse
    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse && event.status === 200) {
          // Déterminer le TTL basé sur l'URL
          const ttl = this.getTtlForUrl(req.url);
          
          // Mettre en cache la réponse
          this.cacheService.set(cacheKey, event.body, {
            ttl,
            persistToStorage: true
          });
        }
      }),
      catchError(error => {
        // En cas d'erreur, ne pas mettre en cache
        throw error;
      })
    );
  }

  private shouldCache(req: HttpRequest<any>): boolean {
    // Vérifier la méthode HTTP
    if (!this.cacheableMethods.includes(req.method)) {
      return false;
    }

    // Vérifier si l'URL est dans la liste des URLs cachables
    return this.cacheableUrls.some(url => req.url.includes(url));
  }

  private generateCacheKey(req: HttpRequest<any>): string {
    // Générer une clé unique basée sur l'URL et les paramètres
    const url = req.urlWithParams;
    const method = req.method;
    return `http_${method}_${btoa(url)}`;
  }

  private getTtlForUrl(url: string): number {
    // Définir des TTL différents selon le type de données
    if (url.includes('/users')) {
      return 10 * 60 * 1000; // 10 minutes pour les utilisateurs
    }
    
    if (url.includes('/classes')) {
      return 30 * 60 * 1000; // 30 minutes pour les classes
    }
    
    if (url.includes('/evaluations')) {
      return 5 * 60 * 1000; // 5 minutes pour les évaluations
    }
    
    // TTL par défaut
    return 15 * 60 * 1000; // 15 minutes
  }
}