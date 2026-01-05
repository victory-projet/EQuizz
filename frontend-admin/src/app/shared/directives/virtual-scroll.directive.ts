import {
  Directive,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
  EmbeddedViewRef,
  inject,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

export interface VirtualScrollItem {
  index: number;
  data: any;
}

export interface VirtualScrollConfig {
  itemHeight: number;
  bufferSize?: number; // Nombre d'éléments à rendre en plus (défaut: 5)
  scrollDebounceTime?: number; // Temps de debounce pour le scroll (défaut: 16ms)
}

@Directive({
  selector: '[appVirtualScroll]',
  standalone: true
})
export class VirtualScrollDirective implements OnInit, OnDestroy, OnChanges {
  @Input('appVirtualScroll') items: any[] = [];
  @Input() itemTemplate!: TemplateRef<any>;
  @Input() config: VirtualScrollConfig = { itemHeight: 50 };
  @Input() trackByFn?: (index: number, item: any) => any;

  @Output() scrolled = new EventEmitter<{ startIndex: number; endIndex: number }>();
  @Output() itemsRendered = new EventEmitter<VirtualScrollItem[]>();

  private elementRef = inject(ElementRef);
  private viewContainer = inject(ViewContainerRef);
  
  private destroy$ = new Subject<void>();
  private renderedViews: EmbeddedViewRef<any>[] = [];
  private containerHeight = 0;
  private scrollTop = 0;
  private visibleItemsCount = 0;
  private startIndex = 0;
  private endIndex = 0;

  private get bufferSize(): number {
    return this.config.bufferSize || 5;
  }

  private get scrollDebounceTime(): number {
    return this.config.scrollDebounceTime || 16;
  }

  ngOnInit(): void {
    this.setupScrollListener();
    this.calculateVisibleItems();
    this.renderItems();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items'] && !changes['items'].firstChange) {
      this.renderItems();
    }
    
    if (changes['config'] && !changes['config'].firstChange) {
      this.calculateVisibleItems();
      this.renderItems();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.clearRenderedViews();
  }

  /**
   * Fait défiler vers un index spécifique
   */
  scrollToIndex(index: number): void {
    const scrollTop = index * this.config.itemHeight;
    this.elementRef.nativeElement.scrollTop = scrollTop;
  }

  /**
   * Fait défiler vers le haut
   */
  scrollToTop(): void {
    this.scrollToIndex(0);
  }

  /**
   * Fait défiler vers le bas
   */
  scrollToBottom(): void {
    this.scrollToIndex(this.items.length - 1);
  }

  /**
   * Actualise le rendu des éléments
   */
  refresh(): void {
    this.calculateVisibleItems();
    this.renderItems();
  }

  private setupScrollListener(): void {
    const element = this.elementRef.nativeElement;
    
    fromEvent(element, 'scroll')
      .pipe(
        debounceTime(this.scrollDebounceTime),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.onScroll();
      });

    // Écouter les changements de taille
    if ('ResizeObserver' in window) {
      const resizeObserver = new ResizeObserver(() => {
        this.calculateVisibleItems();
        this.renderItems();
      });
      
      resizeObserver.observe(element);
      
      // Nettoyer l'observer
      this.destroy$.subscribe(() => {
        resizeObserver.disconnect();
      });
    }
  }

  private onScroll(): void {
    const element = this.elementRef.nativeElement;
    this.scrollTop = element.scrollTop;
    
    this.calculateVisibleRange();
    this.renderItems();
    
    this.scrolled.emit({
      startIndex: this.startIndex,
      endIndex: this.endIndex
    });
  }

  private calculateVisibleItems(): void {
    const element = this.elementRef.nativeElement;
    this.containerHeight = element.clientHeight;
    this.visibleItemsCount = Math.ceil(this.containerHeight / this.config.itemHeight);
  }

  private calculateVisibleRange(): void {
    const startIndex = Math.floor(this.scrollTop / this.config.itemHeight);
    
    // Ajouter un buffer pour un rendu plus fluide
    this.startIndex = Math.max(0, startIndex - this.bufferSize);
    this.endIndex = Math.min(
      this.items.length - 1,
      startIndex + this.visibleItemsCount + this.bufferSize
    );
  }

  private renderItems(): void {
    if (!this.itemTemplate || !this.items.length) {
      this.clearRenderedViews();
      return;
    }

    this.calculateVisibleRange();
    this.clearRenderedViews();
    
    // Créer un conteneur avec la hauteur totale
    this.createVirtualContainer();
    
    // Rendre les éléments visibles
    const renderedItems: VirtualScrollItem[] = [];
    
    for (let i = this.startIndex; i <= this.endIndex; i++) {
      if (i >= 0 && i < this.items.length) {
        const item = this.items[i];
        const viewRef = this.createItemView(item, i);
        
        if (viewRef) {
          this.renderedViews.push(viewRef);
          renderedItems.push({ index: i, data: item });
        }
      }
    }
    
    this.itemsRendered.emit(renderedItems);
  }

  private createVirtualContainer(): void {
    const element = this.elementRef.nativeElement;
    const totalHeight = this.items.length * this.config.itemHeight;
    
    // Définir la hauteur totale pour maintenir la barre de défilement
    element.style.position = 'relative';
    element.style.height = `${this.containerHeight}px`;
    element.style.overflowY = 'auto';
    
    // Créer un élément fantôme pour maintenir la hauteur totale
    let spacer = element.querySelector('.virtual-scroll-spacer');
    if (!spacer) {
      spacer = document.createElement('div');
      spacer.className = 'virtual-scroll-spacer';
      element.appendChild(spacer);
    }
    
    (spacer as HTMLElement).style.height = `${totalHeight}px`;
    (spacer as HTMLElement).style.position = 'absolute';
    (spacer as HTMLElement).style.top = '0';
    (spacer as HTMLElement).style.left = '0';
    (spacer as HTMLElement).style.width = '1px';
    (spacer as HTMLElement).style.pointerEvents = 'none';
  }

  private createItemView(item: any, index: number): EmbeddedViewRef<any> | null {
    try {
      const context = {
        $implicit: item,
        index: index,
        first: index === 0,
        last: index === this.items.length - 1,
        even: index % 2 === 0,
        odd: index % 2 === 1
      };
      
      const viewRef = this.viewContainer.createEmbeddedView(this.itemTemplate, context);
      
      // Positionner l'élément
      const element = viewRef.rootNodes[0] as HTMLElement;
      if (element) {
        element.style.position = 'absolute';
        element.style.top = `${index * this.config.itemHeight}px`;
        element.style.left = '0';
        element.style.right = '0';
        element.style.height = `${this.config.itemHeight}px`;
        element.style.zIndex = '1';
      }
      
      return viewRef;
    } catch (error) {
      console.error('Erreur lors de la création de la vue:', error);
      return null;
    }
  }

  private clearRenderedViews(): void {
    this.renderedViews.forEach(viewRef => {
      try {
        viewRef.destroy();
      } catch (error) {
        console.warn('Erreur lors de la destruction de la vue:', error);
      }
    });
    
    this.renderedViews = [];
    this.viewContainer.clear();
  }
}