import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  category: 'navigation' | 'resource' | 'custom' | 'memory';
  unit?: string;
}

export interface PerformanceReport {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  resourceTimings: Array<{
    name: string;
    duration: number;
    size: number;
  }>;
  customMetrics: PerformanceMetric[];
}

@Injectable({
  providedIn: 'root'
})
export class PerformanceMonitorService {
  private metrics: PerformanceMetric[] = [];
  private metricsSubject = new BehaviorSubject<PerformanceMetric[]>([]);
  private performanceObserver?: PerformanceObserver;
  private isMonitoring = false;

  constructor() {
    this.initializePerformanceObserver();
    this.collectInitialMetrics();
  }

  /**
   * Démarre le monitoring des performances
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.collectWebVitals();
    this.monitorMemoryUsage();
    this.monitorResourceTimings();
  }

  /**
   * Arrête le monitoring des performances
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
  }

  /**
   * Ajoute une métrique personnalisée
   */
  addCustomMetric(name: string, value: number, unit?: string): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      category: 'custom',
      unit
    };

    this.metrics.push(metric);
    this.metricsSubject.next([...this.metrics]);
  }

  /**
   * Mesure le temps d'exécution d'une fonction
   */
  measureFunction<T>(name: string, fn: () => T): T {
    const startTime = performance.now();
    const result = fn();
    const endTime = performance.now();
    
    this.addCustomMetric(`${name}_execution_time`, endTime - startTime, 'ms');
    return result;
  }

  /**
   * Mesure le temps d'exécution d'une fonction asynchrone
   */
  async measureAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const startTime = performance.now();
    const result = await fn();
    const endTime = performance.now();
    
    this.addCustomMetric(`${name}_execution_time`, endTime - startTime, 'ms');
    return result;
  }

  /**
   * Marque le début d'une mesure
   */
  markStart(name: string): void {
    performance.mark(`${name}_start`);
  }

  /**
   * Marque la fin d'une mesure et calcule la durée
   */
  markEnd(name: string): void {
    const endMarkName = `${name}_end`;
    const startMarkName = `${name}_start`;
    
    performance.mark(endMarkName);
    
    try {
      performance.measure(name, startMarkName, endMarkName);
      const measure = performance.getEntriesByName(name, 'measure')[0];
      
      this.addCustomMetric(name, measure.duration, 'ms');
      
      // Nettoyer les marks
      performance.clearMarks(startMarkName);
      performance.clearMarks(endMarkName);
      performance.clearMeasures(name);
    } catch (error) {
      console.warn(`Erreur lors de la mesure ${name}:`, error);
    }
  }

  /**
   * Obtient toutes les métriques
   */
  getMetrics(): Observable<PerformanceMetric[]> {
    return this.metricsSubject.asObservable();
  }

  /**
   * Obtient les métriques par catégorie
   */
  getMetricsByCategory(category: PerformanceMetric['category']): PerformanceMetric[] {
    return this.metrics.filter(metric => metric.category === category);
  }

  /**
   * Génère un rapport de performance complet
   */
  generateReport(): PerformanceReport {
    const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paintTimings = performance.getEntriesByType('paint');
    const resourceTimings = performance.getEntriesByType('resource');

    // Métriques de navigation
    const pageLoadTime = navigationTiming ? navigationTiming.loadEventEnd - navigationTiming.fetchStart : 0;
    
    // Métriques de peinture
    const firstContentfulPaint = paintTimings.find(p => p.name === 'first-contentful-paint')?.startTime || 0;
    
    // Métriques Web Vitals (approximatives)
    const largestContentfulPaint = this.getLargestContentfulPaint();
    const firstInputDelay = this.getFirstInputDelay();
    const cumulativeLayoutShift = this.getCumulativeLayoutShift();

    // Utilisation mémoire
    const memoryUsage = this.getMemoryUsage();

    // Timings des ressources
    const resourceTimingsData = resourceTimings.map(resource => ({
      name: resource.name,
      duration: resource.duration,
      size: (resource as any).transferSize || 0
    }));

    return {
      pageLoadTime,
      firstContentfulPaint,
      largestContentfulPaint,
      firstInputDelay,
      cumulativeLayoutShift,
      memoryUsage,
      resourceTimings: resourceTimingsData,
      customMetrics: this.getMetricsByCategory('custom')
    };
  }

  /**
   * Exporte les métriques au format JSON
   */
  exportMetrics(): string {
    const report = this.generateReport();
    return JSON.stringify(report, null, 2);
  }

  /**
   * Nettoie les anciennes métriques
   */
  clearOldMetrics(olderThanMs: number = 300000): void { // 5 minutes par défaut
    const cutoffTime = Date.now() - olderThanMs;
    this.metrics = this.metrics.filter(metric => metric.timestamp > cutoffTime);
    this.metricsSubject.next([...this.metrics]);
  }

  /**
   * Obtient les statistiques de performance
   */
  getPerformanceStats(): {
    totalMetrics: number;
    averagePageLoadTime: number;
    memoryUsagePercentage: number;
    slowestResources: Array<{ name: string; duration: number }>;
  } {
    const report = this.generateReport();
    const resourceTimings = report.resourceTimings;
    
    // Ressources les plus lentes
    const slowestResources = resourceTimings
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5);

    return {
      totalMetrics: this.metrics.length,
      averagePageLoadTime: report.pageLoadTime,
      memoryUsagePercentage: report.memoryUsage.percentage,
      slowestResources
    };
  }

  private initializePerformanceObserver(): void {
    if ('PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach(entry => {
          let category: PerformanceMetric['category'] = 'custom';
          
          if (entry.entryType === 'navigation') category = 'navigation';
          else if (entry.entryType === 'resource') category = 'resource';
          
          const metric: PerformanceMetric = {
            name: entry.name,
            value: entry.duration || entry.startTime,
            timestamp: Date.now(),
            category,
            unit: 'ms'
          };
          
          this.metrics.push(metric);
        });
        
        this.metricsSubject.next([...this.metrics]);
      });
    }
  }

  private collectInitialMetrics(): void {
    // Collecter les métriques de navigation initiales
    setTimeout(() => {
      const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigationTiming) {
        this.addCustomMetric('dom_content_loaded', navigationTiming.domContentLoadedEventEnd - navigationTiming.fetchStart, 'ms');
        this.addCustomMetric('page_load_complete', navigationTiming.loadEventEnd - navigationTiming.fetchStart, 'ms');
      }
    }, 1000);
  }

  private collectWebVitals(): void {
    // Collecter les Core Web Vitals si disponibles
    if ('PerformanceObserver' in window) {
      try {
        // LCP (Largest Contentful Paint)
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.addCustomMetric('largest_contentful_paint', lastEntry.startTime, 'ms');
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // FID (First Input Delay)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            this.addCustomMetric('first_input_delay', (entry as any).processingStart - entry.startTime, 'ms');
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // CLS (Cumulative Layout Shift)
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (!(entry as any).hadRecentInput) {
              this.addCustomMetric('cumulative_layout_shift', (entry as any).value, 'score');
            }
          });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (error) {
        console.warn('Erreur lors de la collecte des Web Vitals:', error);
      }
    }
  }

  private monitorMemoryUsage(): void {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        const usagePercentage = (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100;
        
        this.addCustomMetric('memory_usage_percentage', usagePercentage, '%');
        this.addCustomMetric('memory_used_mb', memory.usedJSHeapSize / 1048576, 'MB');
      }, 30000); // Toutes les 30 secondes
    }
  }

  private monitorResourceTimings(): void {
    if (this.performanceObserver) {
      try {
        this.performanceObserver.observe({ entryTypes: ['resource'] });
      } catch (error) {
        console.warn('Erreur lors du monitoring des ressources:', error);
      }
    }
  }

  private getLargestContentfulPaint(): number {
    const lcpMetrics = this.metrics.filter(m => m.name === 'largest_contentful_paint');
    return lcpMetrics.length > 0 ? lcpMetrics[lcpMetrics.length - 1].value : 0;
  }

  private getFirstInputDelay(): number {
    const fidMetrics = this.metrics.filter(m => m.name === 'first_input_delay');
    return fidMetrics.length > 0 ? fidMetrics[0].value : 0;
  }

  private getCumulativeLayoutShift(): number {
    const clsMetrics = this.metrics.filter(m => m.name === 'cumulative_layout_shift');
    return clsMetrics.reduce((sum, metric) => sum + metric.value, 0);
  }

  private getMemoryUsage(): { used: number; total: number; percentage: number } {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
      };
    }
    
    return { used: 0, total: 0, percentage: 0 };
  }
}