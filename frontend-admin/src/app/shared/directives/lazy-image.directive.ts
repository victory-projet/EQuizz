import { 
  Directive, 
  ElementRef, 
  Input, 
  OnInit, 
  OnDestroy, 
  Renderer2,
  inject
} from '@angular/core';
import { ImageOptimizationService } from '../../core/services/image-optimization.service';

@Directive({
  selector: '[appLazyImage]',
  standalone: true
})
export class LazyImageDirective implements OnInit, OnDestroy {
  @Input('appLazyImage') imageSrc!: string;
  @Input() placeholder?: string;
  @Input() errorImage?: string;
  @Input() loadingClass = 'loading';
  @Input() loadedClass = 'loaded';
  @Input() errorClass = 'error';
  @Input() optimizeImage = true;
  @Input() maxWidth?: number;
  @Input() maxHeight?: number;
  @Input() quality?: number;

  private elementRef = inject(ElementRef);
  private renderer = inject(Renderer2);
  private imageOptimizationService = inject(ImageOptimizationService);
  
  private intersectionObserver?: IntersectionObserver;
  private isLoaded = false;
  private isLoading = false;

  ngOnInit(): void {
    this.setupIntersectionObserver();
    this.setPlaceholder();
  }

  ngOnDestroy(): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
  }

  private setupIntersectionObserver(): void {
    if ('IntersectionObserver' in window) {
      const options = {
        root: null,
        rootMargin: '50px', // Commencer à charger 50px avant que l'image soit visible
        threshold: 0.1
      };

      this.intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.isLoaded && !this.isLoading) {
            this.loadImage();
          }
        });
      }, options);

      this.intersectionObserver.observe(this.elementRef.nativeElement);
    } else {
      // Fallback pour les navigateurs qui ne supportent pas IntersectionObserver
      this.loadImage();
    }
  }

  private setPlaceholder(): void {
    const element = this.elementRef.nativeElement;
    
    if (this.placeholder) {
      this.renderer.setAttribute(element, 'src', this.placeholder);
    } else {
      // Générer un placeholder par défaut
      const width = this.maxWidth || element.offsetWidth || 300;
      const height = this.maxHeight || element.offsetHeight || 200;
      const defaultPlaceholder = this.imageOptimizationService.createPlaceholder(width, height);
      this.renderer.setAttribute(element, 'src', defaultPlaceholder);
    }
    
    this.renderer.addClass(element, this.loadingClass);
  }

  private loadImage(): void {
    if (this.isLoading || this.isLoaded) return;
    
    this.isLoading = true;
    const element = this.elementRef.nativeElement;

    if (this.optimizeImage) {
      // Utiliser le service d'optimisation d'images
      const config = {
        maxWidth: this.maxWidth,
        maxHeight: this.maxHeight,
        quality: this.quality
      };

      this.imageOptimizationService.optimizeImage(this.imageSrc, config).subscribe({
        next: (optimizedImage) => {
          this.setImageSrc(optimizedImage.url);
        },
        error: (error) => {
          console.warn('Erreur lors de l\'optimisation de l\'image:', error);
          this.setImageSrc(this.imageSrc); // Fallback vers l'image originale
        }
      });
    } else {
      this.setImageSrc(this.imageSrc);
    }
  }

  private setImageSrc(src: string): void {
    const element = this.elementRef.nativeElement;
    const img = new Image();

    img.onload = () => {
      this.renderer.setAttribute(element, 'src', src);
      this.renderer.removeClass(element, this.loadingClass);
      this.renderer.addClass(element, this.loadedClass);
      this.isLoaded = true;
      this.isLoading = false;

      // Déconnecter l'observer une fois l'image chargée
      if (this.intersectionObserver) {
        this.intersectionObserver.disconnect();
      }
    };

    img.onerror = () => {
      this.handleImageError();
    };

    img.src = src;
  }

  private handleImageError(): void {
    const element = this.elementRef.nativeElement;
    
    if (this.errorImage) {
      this.renderer.setAttribute(element, 'src', this.errorImage);
    } else {
      // Générer une image d'erreur par défaut
      const width = this.maxWidth || element.offsetWidth || 300;
      const height = this.maxHeight || element.offsetHeight || 200;
      const errorPlaceholder = this.imageOptimizationService.createPlaceholder(
        width, 
        height, 
        'Erreur de chargement'
      );
      this.renderer.setAttribute(element, 'src', errorPlaceholder);
    }
    
    this.renderer.removeClass(element, this.loadingClass);
    this.renderer.addClass(element, this.errorClass);
    this.isLoading = false;

    // Déconnecter l'observer
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
  }
}