import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { CacheService } from '../services/cache.service';

/**
 * Intercepteur fonctionnel pour la mise en cache HTTP
 */
export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  const cacheService = inject(CacheService);

  // URLs qui doivent être mises en cache
  const cacheableUrls = [
    '/api/users',
    '/api/classes',
    '/api/teachers',
    '/api/students',
    '/api/evaluations'
  ];

  // Méthodes HTTP qui peuvent être mises en cache
  const cacheableMethods = ['GET'];

  // Vérifier si la requête peut être mise en cache
  if (!shouldCache(req, cacheableMethods, cacheableUrls)) {
    return next(req);
  }

  const cacheKey = generateCacheKey(req);
  
  // Vérifier si la réponse est en cache
  const cachedResponse = cacheService.get<any>(cacheKey);
  if (cachedResponse) {
    // Retourner la réponse mise en cache
    return of(new HttpResponse({
      body: cachedResponse,
      status: 200,
      statusText: 'OK (from cache)'
    }));
  }

  // Exécuter la requête et mettre en cache la réponse
  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse && event.status === 200) {
        // Déterminer le TTL basé sur l'URL
        const ttl = getTtlForUrl(req.url);
        
        // Mettre en cache la réponse
        cacheService.set(cacheKey, event.body, {
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
};

function shouldCache(req: any, cacheableMethods: string[], cacheableUrls: string[]): boolean {
  // Vérifier la méthode HTTP
  if (!cacheableMethods.includes(req.method)) {
    return false;
  }

  // Vérifier si l'URL est dans la liste des URLs cachables
  return cacheableUrls.some(url => req.url.includes(url));
}

function generateCacheKey(req: any): string {
  // Générer une clé unique basée sur l'URL et les paramètres
  const url = req.urlWithParams;
  const method = req.method;
  return `http_${method}_${btoa(url)}`;
}

function getTtlForUrl(url: string): number {
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