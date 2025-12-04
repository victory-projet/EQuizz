import { TestBed } from '@angular/core/testing';
import { ImageOptimizationService } from './image-optimization.service';

describe('ImageOptimizationService', () => {
  let service: ImageOptimizationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ImageOptimizationService]
    });
    service = TestBed.inject(ImageOptimizationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('isValidImage', () => {
    it('should return true for valid image types', () => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      
      validTypes.forEach(type => {
        const file = new File([''], 'test.jpg', { type });
        expect(service.isValidImage(file)).toBe(true);
      });
    });

    it('should return false for invalid image types', () => {
      const invalidTypes = ['application/pdf', 'text/plain', 'video/mp4'];
      
      invalidTypes.forEach(type => {
        const file = new File([''], 'test.pdf', { type });
        expect(service.isValidImage(file)).toBe(false);
      });
    });
  });

  describe('isValidSize', () => {
    it('should return true for files within size limit', () => {
      const file = new File(['x'.repeat(1024 * 1024)], 'test.jpg', { type: 'image/jpeg' }); // 1MB
      expect(service.isValidSize(file, 5)).toBe(true);
    });

    it('should return false for files exceeding size limit', () => {
      const file = new File(['x'.repeat(6 * 1024 * 1024)], 'test.jpg', { type: 'image/jpeg' }); // 6MB
      expect(service.isValidSize(file, 5)).toBe(false);
    });

    it('should use default max size of 5MB', () => {
      const file = new File(['x'.repeat(4 * 1024 * 1024)], 'test.jpg', { type: 'image/jpeg' }); // 4MB
      expect(service.isValidSize(file)).toBe(true);
    });
  });

  describe('generatePlaceholder', () => {
    it('should generate a placeholder image', () => {
      const placeholder = service.generatePlaceholder(400, 300, 'Loading...');
      expect(placeholder).toContain('data:image/png;base64');
    });

    it('should generate placeholder without text', () => {
      const placeholder = service.generatePlaceholder(400, 300);
      expect(placeholder).toContain('data:image/png;base64');
    });

    it('should handle different dimensions', () => {
      const placeholder1 = service.generatePlaceholder(100, 100);
      const placeholder2 = service.generatePlaceholder(800, 600);
      
      expect(placeholder1).toBeTruthy();
      expect(placeholder2).toBeTruthy();
      expect(placeholder1).not.toEqual(placeholder2);
    });
  });

  describe('compressImage', () => {
    it('should compress an image', async () => {
      // Create a simple test image
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'red';
        ctx.fillRect(0, 0, 100, 100);
      }

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/jpeg');
      });

      const file = new File([blob], 'test.jpg', { type: 'image/jpeg' });
      const compressed = await service.compressImage(file, 50, 50, 0.8);

      expect(compressed).toBeTruthy();
      expect(compressed.size).toBeLessThanOrEqual(file.size);
    });
  });
});
