/**
 * Interface pour les métriques de synchronisation
 */
export interface SyncMetric {
  timestamp: number;
  operation: string;
  entity: string;
  duration: number;
  success: boolean;
  error?: string;
  retryCount: number;
  dataSize?: number;
}

/**
 * Interface pour les statistiques agrégées
 */
export interface SyncStats {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  averageDuration: number;
  totalDataSynced: number;
  successRate: number;
  averageRetries: number;
  lastSync: number | null;
  syncFrequency: number; // opérations par heure
}

/**
 * Service de métriques pour la synchronisation
 * Collecte et analyse les performances de synchronisation
 */
export class SyncMetrics {
  private static instance: SyncMetrics;
  private metrics: SyncMetric[] = [];
  private readonly MAX_METRICS = 1000; // Garder les 1000 dernières métriques

  private constructor() {}

  public static getInstance(): SyncMetrics {
    if (!SyncMetrics.instance) {
      SyncMetrics.instance = new SyncMetrics();
    }
    return SyncMetrics.instance;
  }

  /**
   * Enregistre une métrique de synchronisation
   */
  public recordSync(
    operation: string,
    entity: string,
    duration: number,
    success: boolean,
    retryCount: number = 0,
    error?: string,
    dataSize?: number
  ): void {
    const metric: SyncMetric = {
      timestamp: Date.now(),
      operation,
      entity,
      duration,
      success,
      error,
      retryCount,
      dataSize
    };

    this.metrics.unshift(metric);

    // Limiter la taille du tableau
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(0, this.MAX_METRICS);
    }

    // Log pour debug
    const status = success ? '✅' : '❌';
    const retryInfo = retryCount > 0 ? ` (retry ${retryCount})` : '';
    console.log(`📊 Sync ${status} ${operation}:${entity} ${duration}ms${retryInfo}`);
  }

  /**
   * Obtient les statistiques globales
   */
  public getStats(timeRange?: number): SyncStats {
    const now = Date.now();
    const cutoff = timeRange ? now - timeRange : 0;
    const relevantMetrics = this.metrics.filter(m => m.timestamp > cutoff);

    if (relevantMetrics.length === 0) {
      return {
        totalOperations: 0,
        successfulOperations: 0,
        failedOperations: 0,
        averageDuration: 0,
        totalDataSynced: 0,
        successRate: 0,
        averageRetries: 0,
        lastSync: null,
        syncFrequency: 0
      };
    }

    const successful = relevantMetrics.filter(m => m.success);
    const failed = relevantMetrics.filter(m => !m.success);
    const totalDuration = relevantMetrics.reduce((sum, m) => sum + m.duration, 0);
    const totalRetries = relevantMetrics.reduce((sum, m) => sum + m.retryCount, 0);
    const totalDataSynced = relevantMetrics.reduce((sum, m) => sum + (m.dataSize || 0), 0);
    
    const oldestMetric = relevantMetrics[relevantMetrics.length - 1];
    const timeSpanHours = oldestMetric ? (now - oldestMetric.timestamp) / (1000 * 60 * 60) : 1;

    return {
      totalOperations: relevantMetrics.length,
      successfulOperations: successful.length,
      failedOperations: failed.length,
      averageDuration: totalDuration / relevantMetrics.length,
      totalDataSynced,
      successRate: (successful.length / relevantMetrics.length) * 100,
      averageRetries: totalRetries / relevantMetrics.length,
      lastSync: relevantMetrics[0]?.timestamp || null,
      syncFrequency: relevantMetrics.length / timeSpanHours
    };
  }

  /**
   * Obtient les statistiques par entité
   */
  public getStatsByEntity(timeRange?: number): Record<string, SyncStats> {
    const now = Date.now();
    const cutoff = timeRange ? now - timeRange : 0;
    const relevantMetrics = this.metrics.filter(m => m.timestamp > cutoff);

    const entitiesMap = new Map<string, SyncMetric[]>();
    
    relevantMetrics.forEach(metric => {
      if (!entitiesMap.has(metric.entity)) {
        entitiesMap.set(metric.entity, []);
      }
      entitiesMap.get(metric.entity)!.push(metric);
    });

    const result: Record<string, SyncStats> = {};
    
    entitiesMap.forEach((metrics, entity) => {
      const successful = metrics.filter(m => m.success);
      const totalDuration = metrics.reduce((sum, m) => sum + m.duration, 0);
      const totalRetries = metrics.reduce((sum, m) => sum + m.retryCount, 0);
      const totalDataSynced = metrics.reduce((sum, m) => sum + (m.dataSize || 0), 0);
      
      const oldestMetric = metrics[metrics.length - 1];
      const timeSpanHours = oldestMetric ? (now - oldestMetric.timestamp) / (1000 * 60 * 60) : 1;

      result[entity] = {
        totalOperations: metrics.length,
        successfulOperations: successful.length,
        failedOperations: metrics.length - successful.length,
        averageDuration: totalDuration / metrics.length,
        totalDataSynced,
        successRate: (successful.length / metrics.length) * 100,
        averageRetries: totalRetries / metrics.length,
        lastSync: metrics[0]?.timestamp || null,
        syncFrequency: metrics.length / timeSpanHours
      };
    });

    return result;
  }

  /**
   * Obtient les erreurs les plus fréquentes
   */
  public getTopErrors(limit: number = 10, timeRange?: number): Array<{
    error: string;
    count: number;
    lastOccurrence: number;
  }> {
    const now = Date.now();
    const cutoff = timeRange ? now - timeRange : 0;
    const failedMetrics = this.metrics.filter(m => !m.success && m.error && m.timestamp > cutoff);

    const errorCounts = new Map<string, { count: number; lastOccurrence: number }>();
    
    failedMetrics.forEach(metric => {
      const error = metric.error!;
      if (!errorCounts.has(error)) {
        errorCounts.set(error, { count: 0, lastOccurrence: 0 });
      }
      const errorData = errorCounts.get(error)!;
      errorData.count++;
      errorData.lastOccurrence = Math.max(errorData.lastOccurrence, metric.timestamp);
    });

    return Array.from(errorCounts.entries())
      .map(([error, data]) => ({
        error,
        count: data.count,
        lastOccurrence: data.lastOccurrence
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Obtient les tendances de performance
   */
  public getPerformanceTrends(bucketSize: number = 60 * 60 * 1000): Array<{
    timestamp: number;
    successRate: number;
    averageDuration: number;
    operationCount: number;
  }> {
    if (this.metrics.length === 0) return [];

    const now = Date.now();
    const oldestMetric = this.metrics[this.metrics.length - 1];
    const timeSpan = now - oldestMetric.timestamp;
    const bucketCount = Math.ceil(timeSpan / bucketSize);

    const buckets: Array<{
      timestamp: number;
      successRate: number;
      averageDuration: number;
      operationCount: number;
    }> = [];

    for (let i = 0; i < bucketCount; i++) {
      const bucketStart = now - (i + 1) * bucketSize;
      const bucketEnd = now - i * bucketSize;
      
      const bucketMetrics = this.metrics.filter(m => 
        m.timestamp >= bucketStart && m.timestamp < bucketEnd
      );

      if (bucketMetrics.length > 0) {
        const successful = bucketMetrics.filter(m => m.success);
        const totalDuration = bucketMetrics.reduce((sum, m) => sum + m.duration, 0);

        buckets.unshift({
          timestamp: bucketStart,
          successRate: (successful.length / bucketMetrics.length) * 100,
          averageDuration: totalDuration / bucketMetrics.length,
          operationCount: bucketMetrics.length
        });
      }
    }

    return buckets;
  }

  /**
   * Détecte les anomalies de performance
   */
  public detectAnomalies(): Array<{
    type: 'high_failure_rate' | 'slow_sync' | 'frequent_retries';
    description: string;
    severity: 'low' | 'medium' | 'high';
    timestamp: number;
  }> {
    const anomalies: Array<{
      type: 'high_failure_rate' | 'slow_sync' | 'frequent_retries';
      description: string;
      severity: 'low' | 'medium' | 'high';
      timestamp: number;
    }> = [];

    const recentStats = this.getStats(60 * 60 * 1000); // Dernière heure

    // Taux d'échec élevé
    if (recentStats.successRate < 80 && recentStats.totalOperations > 5) {
      anomalies.push({
        type: 'high_failure_rate',
        description: `Taux de succès faible: ${recentStats.successRate.toFixed(1)}%`,
        severity: recentStats.successRate < 50 ? 'high' : 'medium',
        timestamp: Date.now()
      });
    }

    // Synchronisation lente
    if (recentStats.averageDuration > 10000 && recentStats.totalOperations > 3) {
      anomalies.push({
        type: 'slow_sync',
        description: `Synchronisation lente: ${(recentStats.averageDuration / 1000).toFixed(1)}s en moyenne`,
        severity: recentStats.averageDuration > 30000 ? 'high' : 'medium',
        timestamp: Date.now()
      });
    }

    // Retries fréquents
    if (recentStats.averageRetries > 1.5 && recentStats.totalOperations > 3) {
      anomalies.push({
        type: 'frequent_retries',
        description: `Retries fréquents: ${recentStats.averageRetries.toFixed(1)} en moyenne`,
        severity: recentStats.averageRetries > 3 ? 'high' : 'medium',
        timestamp: Date.now()
      });
    }

    return anomalies;
  }

  /**
   * Exporte les métriques pour analyse
   */
  public exportMetrics(timeRange?: number): SyncMetric[] {
    if (!timeRange) return [...this.metrics];
    
    const cutoff = Date.now() - timeRange;
    return this.metrics.filter(m => m.timestamp > cutoff);
  }

  /**
   * Nettoie les anciennes métriques
   */
  public cleanup(maxAge: number = 7 * 24 * 60 * 60 * 1000): void {
    const cutoff = Date.now() - maxAge;
    this.metrics = this.metrics.filter(m => m.timestamp > cutoff);
    console.log(`🧹 Métriques nettoyées, ${this.metrics.length} métriques conservées`);
  }

  /**
   * Réinitialise toutes les métriques
   */
  public reset(): void {
    this.metrics = [];
    console.log('🔄 Métriques réinitialisées');
  }
}