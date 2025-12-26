import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, timer } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export interface CacheConfig {
  ttl?: number; // Time to live en millisecondes (défaut: 5 minutes)
  maxSize?: number; // Taille maximale du cache (défaut: 100)
  persistToStorage?: boolean; // Persister dans localStorage (défaut: true)
}

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private cache = new Map<string, CacheItem<any>>();
  private cacheSubjects = new Map<string, BehaviorSubject<any>>();
  private defaultConfig: CacheConfig = {
    ttl: 5 * 60 * 1000, // 5 minutes
    maxSize: 100,
    persistToStorage: true
  };

  constructor() {
    this.loadFromStorage();
    this.startCleanupTimer();
  }

  /**
   * Met en cache une donnée avec une clé unique
   */
  set<T>(key: string, data: T, config?: CacheConfig): void {
    const finalConfig = { ...this.defaultConfig, ...config };
    const now = Date.now();
    
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: now,
      expiresAt: now + finalConfig.ttl!
    };

    this.cache.set(key, cacheItem);
    
    // Émettre la nouvelle valeur aux observateurs
    if (this.cacheSubjects.has(key)) {
      this.cacheSubjects.get(key)!.next(data);
    }

    // Gérer la taille maximale du cache
    if (this.cache.size > finalConfig.maxSize!) {
      this.evictOldest();
    }

    // Persister dans localStorage si configuré
    if (finalConfig.persistToStorage) {
      this.saveToStorage(key, cacheItem);
    }
  }

  /**
   * Récupère une donnée du cache
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Vérifier l'expiration
    if (Date.now() > item.expiresAt) {
      this.delete(key);
      return null;
    }

    return item.data as T;
  }

  /**
   * Récupère une donnée du cache ou exécute une fonction pour la récupérer
   */
  getOrFetch<T>(
    key: string, 
    fetchFn: () => Observable<T>, 
    config?: CacheConfig
  ): Observable<T> {
    const cachedData = this.get<T>(key);
    
    if (cachedData !== null) {
      return of(cachedData);
    }

    return fetchFn().pipe(
      tap(data => this.set(key, data, config))
    );
  }

  /**
   * Observe les changements d'une clé de cache
   */
  observe<T>(key: string): Observable<T | null> {
    if (!this.cacheSubjects.has(key)) {
      const initialValue = this.get<T>(key);
      this.cacheSubjects.set(key, new BehaviorSubject<T | null>(initialValue));
    }
    
    return this.cacheSubjects.get(key)!.asObservable();
  }

  /**
   * Supprime une entrée du cache
   */
  delete(key: string): void {
    this.cache.delete(key);
    this.removeFromStorage(key);
    
    if (this.cacheSubjects.has(key)) {
      this.cacheSubjects.get(key)!.next(null);
    }
  }

  /**
   * Vide tout le cache
   */
  clear(): void {
    this.cache.clear();
    this.clearStorage();
    
    // Notifier tous les observateurs
    this.cacheSubjects.forEach(subject => subject.next(null));
    this.cacheSubjects.clear();
  }

  /**
   * Invalide les entrées expirées
   */
  invalidateExpired(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    this.cache.forEach((item, key) => {
      if (now > item.expiresAt) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => this.delete(key));
  }

  /**
   * Invalide les entrées par pattern
   */
  invalidateByPattern(pattern: string): void {
    const regex = new RegExp(pattern);
    const keysToDelete: string[] = [];

    this.cache.forEach((_, key) => {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.delete(key));
  }

  /**
   * Retourne les statistiques du cache
   */
  getStats(): {
    size: number;
    keys: string[];
    totalMemoryUsage: number;
  } {
    const keys = Array.from(this.cache.keys());
    const totalMemoryUsage = this.estimateMemoryUsage();

    return {
      size: this.cache.size,
      keys,
      totalMemoryUsage
    };
  }

  /**
   * Vérifie si une clé existe et n'est pas expirée
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    if (Date.now() > item.expiresAt) {
      this.delete(key);
      return false;
    }
    
    return true;
  }

  private evictOldest(): void {
    let oldestKey = '';
    let oldestTimestamp = Date.now();

    this.cache.forEach((item, key) => {
      if (item.timestamp < oldestTimestamp) {
        oldestTimestamp = item.timestamp;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      this.delete(oldestKey);
    }
  }

  private startCleanupTimer(): void {
    // Nettoyer les entrées expirées toutes les minutes
    timer(0, 60000).pipe(
      switchMap(() => {
        this.invalidateExpired();
        return of(null);
      })
    ).subscribe();
  }

  private saveToStorage(key: string, item: CacheItem<any>): void {
    try {
      const storageKey = `cache_${key}`;
      localStorage.setItem(storageKey, JSON.stringify(item));
    } catch (error) {
      console.warn('Erreur lors de la sauvegarde en cache:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('cache_'));
      
      keys.forEach(storageKey => {
        const cacheKey = storageKey.replace('cache_', '');
        const itemStr = localStorage.getItem(storageKey);
        
        if (itemStr) {
          const item: CacheItem<any> = JSON.parse(itemStr);
          
          // Vérifier si l'item n'est pas expiré
          if (Date.now() <= item.expiresAt) {
            this.cache.set(cacheKey, item);
          } else {
            localStorage.removeItem(storageKey);
          }
        }
      });
    } catch (error) {
      console.warn('Erreur lors du chargement du cache:', error);
    }
  }

  private removeFromStorage(key: string): void {
    try {
      localStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.warn('Erreur lors de la suppression du cache:', error);
    }
  }

  private clearStorage(): void {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('cache_'));
      keys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Erreur lors du vidage du cache:', error);
    }
  }

  private estimateMemoryUsage(): number {
    let totalSize = 0;
    
    this.cache.forEach(item => {
      try {
        totalSize += JSON.stringify(item).length * 2; // Approximation en bytes
      } catch {
        totalSize += 1000; // Estimation par défaut
      }
    });
    
    return totalSize;
  }
}