import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageOptimizationService {
  /**
   * Compresse une image avant l'upload
   * @param file Fichier image à compresser
   * @param maxWidth Largeur maximale
   * @param maxHeight Hauteur maximale
   * @param quality Qualité de compression (0-1)
   * @returns Promise avec le fichier compressé
   */
  async compressImage(
    file: File,
    maxWidth: number = 1920,
    maxHeight: number = 1080,
    quality: number = 0.8
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e: any) => {
        const img = new Image();
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Canvas to Blob conversion failed'));
              }
            },
            file.type,
            quality
          );
        };

        img.onerror = () => reject(new Error('Image load failed'));
        img.src = e.target.result;
      };

      reader.onerror = () => reject(new Error('File read failed'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Génère une image placeholder en base64
   * @param width Largeur
   * @param height Hauteur
   * @param text Texte à afficher
   * @returns Data URL de l'image
   */
  generatePlaceholder(width: number, height: number, text: string = ''): string {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Background
    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(0, 0, width, height);

    // Text
    if (text) {
      ctx.fillStyle = '#9ca3af';
      ctx.font = '16px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, width / 2, height / 2);
    }

    return canvas.toDataURL();
  }

  /**
   * Vérifie si un fichier est une image valide
   * @param file Fichier à vérifier
   * @returns true si c'est une image valide
   */
  isValidImage(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return validTypes.includes(file.type);
  }

  /**
   * Vérifie la taille du fichier
   * @param file Fichier à vérifier
   * @param maxSizeMB Taille maximale en MB
   * @returns true si la taille est valide
   */
  isValidSize(file: File, maxSizeMB: number = 5): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }

  /**
   * Convertit une image en WebP (si supporté)
   * @param file Fichier image
   * @param quality Qualité (0-1)
   * @returns Promise avec le blob WebP
   */
  async convertToWebP(file: File, quality: number = 0.8): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e: any) => {
        const img = new Image();
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('WebP conversion failed'));
              }
            },
            'image/webp',
            quality
          );
        };

        img.onerror = () => reject(new Error('Image load failed'));
        img.src = e.target.result;
      };

      reader.onerror = () => reject(new Error('File read failed'));
      reader.readAsDataURL(file);
    });
  }
}
