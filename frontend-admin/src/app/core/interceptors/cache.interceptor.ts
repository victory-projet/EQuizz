import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

// Simple in-memory cache
const cache = new Map<string, { response: HttpResponse<any>; timestamp: number }>();

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  // Only cache GET requests in production
  if (!environment.enableCache || req.method !== 'GET') {
    return next(req);
  }

  // Skip cache for certain endpoints
  const skipCache = ['/auth/', '/login', '/logout'].some(path => req.url.includes(path));
  if (skipCache) {
    return next(req);
  }

  const cacheKey = req.urlWithParams;
  const cached = cache.get(cacheKey);

  // Return cached response if valid
  if (cached) {
    const age = Date.now() - cached.timestamp;
    if (age < environment.cacheTimeout) {
      console.log('📦 Cache hit:', cacheKey);
      return of(cached.response.clone());
    } else {
      // Remove expired cache
      cache.delete(cacheKey);
    }
  }

  // Make request and cache response
  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse) {
        console.log('💾 Caching response:', cacheKey);
        cache.set(cacheKey, {
          response: event.clone(),
          timestamp: Date.now()
        });

        // Limit cache size to 50 entries
        if (cache.size > 50) {
          const firstKey = cache.keys().next().value;
          if (firstKey) {
            cache.delete(firstKey);
          }
        }
      }
    })
  );
};

// Function to clear cache
export function clearCache(): void {
  cache.clear();
  console.log('🗑️ Cache cleared');
}

// Function to clear specific cache entry
export function clearCacheEntry(url: string): void {
  cache.delete(url);
  console.log('🗑️ Cache entry cleared:', url);
}
