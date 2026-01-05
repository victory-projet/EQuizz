import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface ImageOptimizationConfig {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 à 1.0
  format?: 'jpeg' | 'png' | 'webp';
  enableLazyLoading?: boolean;
  placeholder?: string;
}

export interface OptimizedImage {
  url: string;
  width: number;
  height: number;
  size: number;
  format: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImageOptimizationService {
  private imageCache = new Map<string, OptimizedImage>();
  private loadingImages = new Set<string>();

  private defaultConfig: ImageOptimizationConfig = {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.8,
    format: 'jpeg',
    enableLazyLoading: true,
    placeholder: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNoYXJnZW1lbnQuLi48L3RleHQ+PC9zdmc+'
  };

  /**
   * Optimise une image
   */
  optimizeImage(
    imageUrl: string, 
    config?: ImageOptimizationConfig
  ): Observable<OptimizedImage> {
    const finalConfig = { ...this.defaultConfig, ...config };
    const cacheKey = this.generateCacheKey(imageUrl, finalConfig);

    // Vérifier le cache
    if (this.imageCache.has(cacheKey)) {
      return of(this.imageCache.get(cacheKey)!);
    }

    // Éviter les chargements multiples de la même image
    if (this.loadingImages.has(cacheKey)) {
      return new Observable(observer => {
        const checkCache = () => {
          if (this.imageCache.has(cacheKey)) {
            observer.next(this.imageCache.get(cacheKey)!);
            observer.complete();
          } else if (!this.loadingImages.has(cacheKey)) {
            observer.error(new Error('Échec du chargement de l\'image'));
          } else {
            setTimeout(checkCache, 100);
          }
        };
        checkCache();
      });
    }

    this.loadingImages.add(cacheKey);

    return from(this.processImage(imageUrl, finalConfig)).pipe(
      map(optimizedImage => {
        this.imageCache.set(cacheKey, optimizedImage);
        this.loadingImages.delete(cacheKey);
        return optimizedImage;
      }),
      catchError(error => {
        this.loadingImages.delete(cacheKey);
        throw error;
      })
    );
  }

  /**
   * Génère des images responsives (différentes tailles)
   */
  generateResponsiveImages(
    imageUrl: string,
    sizes: number[] = [320, 640, 1024, 1920]
  ): Observable<OptimizedImage[]> {
    const optimizationPromises = sizes.map(size => 
      this.optimizeImage(imageUrl, {
        maxWidth: size,
        maxHeight: Math.round(size * 0.75) // Ratio 4:3 par défaut
      }).toPromise().then(result => result!)
    );

    return from(Promise.all(optimizationPromises));
  }

  /**
   * Précharge des images importantes
   */
  preloadImages(imageUrls: string[], config?: ImageOptimizationConfig): void {
    imageUrls.forEach(url => {
      setTimeout(() => {
        this.optimizeImage(url, config).subscribe({
          next: () => console.log(`Image préchargée: ${url}`),
          error: (error) => console.warn(`Erreur préchargement image ${url}:`, error)
        });
      }, Math.random() * 1000); // Étaler les chargements
    });
  }

  /**
   * Crée un placeholder SVG
   */
  createPlaceholder(width: number, height: number, text?: string): string {
    const placeholderText = text || 'Chargement...';
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f0f0f0"/>
        <text x="50%" y="50%" font-family="Arial" font-size="14" fill="#999" 
              text-anchor="middle" dy=".3em">${placeholderText}</text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  /**
   * Détecte le format d'image optimal supporté par le navigateur
   */
  detectOptimalFormat(): 'webp' | 'jpeg' {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    
    // Tester le support WebP
    const webpSupported = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    
    return webpSupported ? 'webp' : 'jpeg';
  }

  /**
   * Nettoie le cache des images
   */
  clearCache(): void {
    this.imageCache.clear();
    this.loadingImages.clear();
  }

  /**
   * Obtient les statistiques du cache d'images
   */
  getCacheStats(): {
    cachedImages: number;
    loadingImages: number;
    totalCacheSize: number;
  } {
    let totalSize = 0;
    this.imageCache.forEach(image => {
      totalSize += image.size;
    });

    return {
      cachedImages: this.imageCache.size,
      loadingImages: this.loadingImages.size,
      totalCacheSize: totalSize
    };
  }

  private async processImage(
    imageUrl: string, 
    config: ImageOptimizationConfig
  ): Promise<OptimizedImage> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;

          // Calculer les nouvelles dimensions
          const { width, height } = this.calculateDimensions(
            img.width, 
            img.height, 
            config.maxWidth!, 
            config.maxHeight!
          );

          canvas.width = width;
          canvas.height = height;

          // Dessiner l'image redimensionnée
          ctx.drawImage(img, 0, 0, width, height);

          // Convertir au format souhaité
          const mimeType = `image/${config.format}`;
          const dataUrl = canvas.toDataURL(mimeType, config.quality);

          // Estimer la taille
          const size = Math.round((dataUrl.length * 3) / 4); // Approximation base64

          resolve({
            url: dataUrl,
            width,
            height,
            size,
            format: config.format!
          });
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error(`Impossible de charger l'image: ${imageUrl}`));
      };

      img.src = imageUrl;
    });
  }

  private calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    let { width, height } = { width: originalWidth, height: originalHeight };

    // Redimensionner si nécessaire
    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }

    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }

    return {
      width: Math.round(width),
      height: Math.round(height)
    };
  }

  private generateCacheKey(url: string, config: ImageOptimizationConfig): string {
    return `${url}_${config.maxWidth}_${config.maxHeight}_${config.quality}_${config.format}`;
  }
}