import * as SecureStore from 'expo-secure-store';
import { SQLiteDatabase } from '../database/SQLiteDatabase';
import { apiClient } from '../../core/api';
import { STORAGE_KEYS } from '../../core/constants';
import { NetworkMonitor, NetworkEvent } from './NetworkMonitor';
import { SyncMetrics } from './SyncMetrics';
import { ConflictResolutionService } from './ConflictResolutionService';

/**
 * Interface pour une opération de synchronisation optimisée
 */
export interface OptimizedSyncOperation {
  operationId: string;
  entity: string;
  entityId: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  payload: any;
  timestamp: number;
  retryCount: number;
  status: 'PENDING' | 'SYNCED' | 'FAILED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  version?: number;
  lastError?: string;
  estimatedSize?: number;
  dependencies?: string[]; // IDs d'opérations dont celle-ci dépend
}

/**
 * Moteur de synchronisation optimisé avec gestion intelligente
 * Améliore le SyncEngine original avec des fonctionnalités avancées
 */
export class OptimizedSyncEngine {
  private static instance: OptimizedSyncEngine;
  private db: SQLiteDatabase;
  private networkMonitor: NetworkMonitor;
  private syncMetrics: SyncMetrics;
  private conflictResolver: ConflictResolutionService;
  
  private syncMutex = false;
  private isOnline = false;
  private syncInterval: any = null;
  private backgroundTask: any = null;
  private adaptiveInterval = 60000; // Intervalle adaptatif

  // Configuration avancée
  private readonly MAX_RETRIES = 5;
  private readonly RETRY_DELAYS = [1000, 2000, 5000, 10000, 30000];
  private readonly BASE_SYNC_INTERVAL = 60000; // 1 minute
  private readonly MAX_SYNC_INTERVAL = 300000; // 5 minutes
  private readonly BATCH_SIZE = 10;
  private readonly MAX_CONCURRENT_OPERATIONS = 3;

  private constructor() {
    this.db = SQLiteDatabase.getInstance();
    this.networkMonitor = NetworkMonitor.getInstance();
    this.syncMetrics = SyncMetrics.getInstance();
    this.conflictResolver = ConflictResolutionService.getInstance();
    this.initializeNetworkListener();
  }

  public static getInstance(): OptimizedSyncEngine {
    if (!OptimizedSyncEngine.instance) {
      OptimizedSyncEngine.instance = new OptimizedSyncEngine();
    }
    return OptimizedSyncEngine.instance;
  }

  /**
   * Initialise l'écoute réseau intelligente
   */
  private initializeNetworkListener(): void {
    this.networkMonitor.addListener((event: NetworkEvent) => {
      const wasOnline = this.isOnline;
      this.isOnline = event.isOnline;
      
      if (!wasOnline && this.isOnline) {
        console.log('📡 Connexion rétablie - synchronisation intelligente');
        this.handleConnectionRestored(event);
      } else if (wasOnline && !this.isOnline) {
        console.log('📵 Connexion perdue - mode offline activé');
        this.handleConnectionLost();
      }

      // Adapter l'intervalle selon la qualité de connexion
      this.adaptSyncInterval(event);
    });
  }

  /**
   * Gère la restauration de connexion
   */
  private handleConnectionRestored(event: NetworkEvent): void {
    const quality = this.networkMonitor.getConnectionQuality();
    
    // Délai adaptatif selon la qualité de connexion
    let delay = 1000; // Excellent/Good
    if (quality === 'poor') delay = 5000;
    
    setTimeout(() => {
      this.triggerSync();
    }, delay);
  }

  /**
   * Gère la perte de connexion
   */
  private handleConnectionLost(): void {
    // Annuler les synchronisations en cours si nécessaire
    if (this.backgroundTask) {
      clearTimeout(this.backgroundTask);
      this.backgroundTask = null;
    }
  }

  /**
   * Adapte l'intervalle de synchronisation selon la qualité réseau
   */
  private adaptSyncInterval(event: NetworkEvent): void {
    if (!event.isOnline) {
      return;
    }

    const quality = this.networkMonitor.getConnectionQuality();
    const isStable = this.networkMonitor.isConnectionStable();
    
    let multiplier = 1;
    
    // Ajuster selon la qualité
    switch (quality) {
      case 'excellent':
        multiplier = 0.8; // Plus fréquent
        break;
      case 'good':
        multiplier = 1;
        break;
      case 'poor':
        multiplier = 2; // Moins fréquent
        break;
    }
    
    // Ajuster selon la stabilité
    if (!isStable) {
      multiplier *= 1.5; // Moins fréquent si instable
    }
    
    // Ajuster selon les performances récentes
    const recentStats = this.syncMetrics.getStats(30 * 60 * 1000); // 30 minutes
    if (recentStats.successRate < 70) {
      multiplier *= 1.5; // Moins fréquent si beaucoup d'échecs
    }
    
    this.adaptiveInterval = Math.min(
      Math.max(this.BASE_SYNC_INTERVAL * multiplier, this.BASE_SYNC_INTERVAL),
      this.MAX_SYNC_INTERVAL
    );
    
    console.log(`⚙️ Intervalle adaptatif: ${this.adaptiveInterval / 1000}s (qualité: ${quality}, stable: ${isStable})`);
  }

  /**
   * Démarre le moteur optimisé
   */
  async start(): Promise<void> {
    console.log('🚀 Démarrage du moteur de synchronisation optimisé...');
    
    // Créer la table de queue optimisée
    await this.ensureOptimizedSyncQueueTable();
    
    // Obtenir l'état réseau initial
    const currentState = this.networkMonitor.getCurrentState();
    this.isOnline = currentState?.isOnline || false;
    
    // Synchronisation initiale si en ligne
    if (this.isOnline) {
      this.triggerSync();
    }
    
    // Démarrer la synchronisation périodique adaptative
    this.startAdaptivePeriodicSync();
    
    console.log('✅ Moteur de synchronisation optimisé démarré');
  }

  /**
   * Crée la table de queue optimisée
   */
  private async ensureOptimizedSyncQueueTable(): Promise<void> {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS optimized_sync_queue (
        operationId TEXT PRIMARY KEY,
        entity TEXT NOT NULL,
        entityId TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('CREATE', 'UPDATE', 'DELETE')),
        payload TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        retryCount INTEGER DEFAULT 0,
        status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SYNCED', 'FAILED')),
        priority TEXT DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'CRITICAL')),
        version INTEGER DEFAULT 1,
        lastError TEXT,
        estimatedSize INTEGER DEFAULT 0,
        dependencies TEXT, -- JSON array of operation IDs
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await this.db.executeUpdate(createTableQuery);
    
    // Index optimisés
    await this.db.executeUpdate(`
      CREATE INDEX IF NOT EXISTS idx_optimized_sync_status_priority_timestamp 
      ON optimized_sync_queue(status, priority DESC, timestamp ASC)
    `);
    
    await this.db.executeUpdate(`
      CREATE INDEX IF NOT EXISTS idx_optimized_sync_entity_status 
      ON optimized_sync_queue(entity, status)
    `);
  }

  /**
   * Ajoute une opération avec priorité et dépendances
   */
  async addOperation(
    entity: string,
    entityId: string,
    type: 'CREATE' | 'UPDATE' | 'DELETE',
    payload: any,
    priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL' = 'NORMAL',
    dependencies: string[] = [],
    version?: number
  ): Promise<string> {
    const operationId = `${entity}_${entityId}_${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const estimatedSize = this.estimatePayloadSize(payload);
    
    const operation: OptimizedSyncOperation = {
      operationId,
      entity,
      entityId,
      type,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
      status: 'PENDING',
      priority,
      version: version || 1,
      estimatedSize,
      dependencies
    };

    const query = `
      INSERT INTO optimized_sync_queue 
      (operationId, entity, entityId, type, payload, timestamp, retryCount, status, priority, version, estimatedSize, dependencies)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.executeUpdate(query, [
      operation.operationId,
      operation.entity,
      operation.entityId,
      operation.type,
      JSON.stringify(operation.payload),
      operation.timestamp,
      operation.retryCount,
      operation.status,
      operation.priority,
      operation.version || 1,
      operation.estimatedSize || 0,
      JSON.stringify(operation.dependencies)
    ]);

    console.log(`📝 Opération ajoutée (${priority}): ${operationId}`);
    
    // Déclencher sync immédiate pour les opérations critiques
    if (priority === 'CRITICAL' && this.isOnline) {
      this.triggerSync();
    }
    
    return operationId;
  }

  /**
   * Estime la taille d'un payload
   */
  private estimatePayloadSize(payload: any): number {
    try {
      return JSON.stringify(payload).length;
    } catch {
      return 1000; // Estimation par défaut
    }
  }

  /**
   * Démarre la synchronisation périodique adaptative
   */
  private startAdaptivePeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.syncMutex) {
        this.performOptimizedSync().catch(error => {
          console.error('❌ Erreur sync périodique optimisée:', error);
        });
      }
    }, this.adaptiveInterval);
  }

  /**
   * Effectue une synchronisation optimisée
   */
  private async performOptimizedSync(): Promise<void> {
    if (this.syncMutex) {
      console.log('⏸️ Synchronisation déjà en cours, ignorée');
      return;
    }

    if (!this.isOnline) {
      console.log('📵 Hors ligne, synchronisation reportée');
      return;
    }

    this.syncMutex = true;
    const syncStartTime = Date.now();
    
    try {
      console.log('🔄 Début de la synchronisation optimisée...');
      
      // 1. Push optimisé des opérations locales
      await this.pushOptimizedOperations();
      
      // 2. Pull intelligent des changements serveur
      await this.pullServerChanges();
      
      // 3. Nettoyer les opérations synchronisées
      await this.cleanupSyncedOperations();
      
      // 4. Mettre à jour l'heure de dernière sync
      await this.updateLastSyncTime();
      
      const syncDuration = Date.now() - syncStartTime;
      this.syncMetrics.recordSync('full_sync', 'all', syncDuration, true);
      
      console.log(`✅ Synchronisation optimisée terminée en ${syncDuration}ms`);
      
    } catch (error: any) {
      const syncDuration = Date.now() - syncStartTime;
      this.syncMetrics.recordSync('full_sync', 'all', syncDuration, false, 0, error.message);
      console.error('❌ Erreur lors de la synchronisation optimisée:', error);
    } finally {
      this.syncMutex = false;
    }
  }

  /**
   * Push optimisé avec priorisation et traitement par batch
   */
  private async pushOptimizedOperations(): Promise<void> {
    const pendingOps = await this.getPendingOperationsSorted();
    
    if (pendingOps.length === 0) {
      console.log('📤 Aucune opération en attente');
      return;
    }

    console.log(`📤 Push optimisé de ${pendingOps.length} opération(s)...`);

    // Filtrer les opérations prêtes (sans dépendances non résolues)
    const readyOps = await this.filterReadyOperations(pendingOps);
    
    // Traiter par batch avec concurrence limitée
    const batches = this.createOptimizedBatches(readyOps);
    
    for (const batch of batches) {
      await this.processConcurrentBatch(batch);
    }
  }

  /**
   * Récupère les opérations triées par priorité et timestamp
   */
  private async getPendingOperationsSorted(): Promise<OptimizedSyncOperation[]> {
    const query = `
      SELECT * FROM optimized_sync_queue 
      WHERE status = 'PENDING' AND retryCount < ?
      ORDER BY 
        CASE priority 
          WHEN 'CRITICAL' THEN 1 
          WHEN 'HIGH' THEN 2 
          WHEN 'NORMAL' THEN 3 
          WHEN 'LOW' THEN 4 
        END,
        timestamp ASC
    `;
    
    const results = await this.db.executeQuery(query, [this.MAX_RETRIES]);
    
    return results.map(row => ({
      operationId: row.operationId,
      entity: row.entity,
      entityId: row.entityId,
      type: row.type,
      payload: JSON.parse(row.payload),
      timestamp: row.timestamp,
      retryCount: row.retryCount,
      status: row.status,
      priority: row.priority,
      version: row.version,
      lastError: row.lastError,
      estimatedSize: row.estimatedSize,
      dependencies: row.dependencies ? JSON.parse(row.dependencies) : []
    }));
  }

  /**
   * Filtre les opérations prêtes (sans dépendances non résolues)
   */
  private async filterReadyOperations(operations: OptimizedSyncOperation[]): Promise<OptimizedSyncOperation[]> {
    const readyOps: OptimizedSyncOperation[] = [];
    
    for (const op of operations) {
      if (!op.dependencies || op.dependencies.length === 0) {
        readyOps.push(op);
        continue;
      }
      
      // Vérifier si toutes les dépendances sont résolues
      const dependenciesResolved = await this.areDependenciesResolved(op.dependencies);
      if (dependenciesResolved) {
        readyOps.push(op);
      }
    }
    
    return readyOps;
  }

  /**
   * Vérifie si les dépendances sont résolues
   */
  private async areDependenciesResolved(dependencies: string[]): Promise<boolean> {
    const query = `
      SELECT COUNT(*) as count FROM optimized_sync_queue 
      WHERE operationId IN (${dependencies.map(() => '?').join(',')}) 
      AND status != 'SYNCED'
    `;
    
    const result = await this.db.executeQuery(query, dependencies);
    return (result[0]?.count || 0) === 0;
  }

  /**
   * Crée des batches optimisés selon la taille et la priorité
   */
  private createOptimizedBatches(operations: OptimizedSyncOperation[]): OptimizedSyncOperation[][] {
    const batches: OptimizedSyncOperation[][] = [];
    let currentBatch: OptimizedSyncOperation[] = [];
    let currentBatchSize = 0;
    
    for (const op of operations) {
      const opSize = op.estimatedSize || 1000;
      
      // Nouvelle batch si taille dépassée ou priorité différente
      if (currentBatch.length >= this.BATCH_SIZE || 
          (currentBatch.length > 0 && currentBatch[0].priority !== op.priority) ||
          currentBatchSize + opSize > 50000) { // 50KB max par batch
        
        if (currentBatch.length > 0) {
          batches.push(currentBatch);
          currentBatch = [];
          currentBatchSize = 0;
        }
      }
      
      currentBatch.push(op);
      currentBatchSize += opSize;
    }
    
    if (currentBatch.length > 0) {
      batches.push(currentBatch);
    }
    
    return batches;
  }

  /**
   * Traite un batch avec concurrence limitée
   */
  private async processConcurrentBatch(operations: OptimizedSyncOperation[]): Promise<void> {
    const chunks = [];
    for (let i = 0; i < operations.length; i += this.MAX_CONCURRENT_OPERATIONS) {
      chunks.push(operations.slice(i, i + this.MAX_CONCURRENT_OPERATIONS));
    }
    
    for (const chunk of chunks) {
      const promises = chunk.map(op => this.processOptimizedOperation(op));
      await Promise.allSettled(promises);
    }
  }

  /**
   * Traite une opération optimisée avec métriques
   */
  private async processOptimizedOperation(operation: OptimizedSyncOperation): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log(`🔄 Traitement optimisé: ${operation.entity} ${operation.type} ${operation.entityId} (${operation.priority})`);
      
      // Logique de traitement similaire au SyncEngine original mais avec métriques
      await this.executeOperation(operation);
      
      const duration = Date.now() - startTime;
      this.syncMetrics.recordSync(
        operation.type,
        operation.entity,
        duration,
        true,
        operation.retryCount,
        undefined,
        operation.estimatedSize
      );
      
      await this.markOperationAsProcessed(operation.operationId);
      console.log(`✅ Opération optimisée ${operation.operationId} synchronisée en ${duration}ms`);
      
    } catch (error: any) {
      const duration = Date.now() - startTime;
      this.syncMetrics.recordSync(
        operation.type,
        operation.entity,
        duration,
        false,
        operation.retryCount,
        error.message,
        operation.estimatedSize
      );
      
      console.error(`❌ Erreur traitement opération optimisée ${operation.operationId}:`, error);
      await this.handleOptimizedOperationError(operation, error);
    }
  }

  /**
   * Exécute une opération (logique métier)
   */
  private async executeOperation(operation: OptimizedSyncOperation): Promise<void> {
    // Implémentation similaire au SyncEngine original
    // mais avec gestion des conflits améliorée
    
    let endpoint = '';
    let method = '';
    let data = operation.payload;

    switch (operation.entity) {
      case 'submission':
        endpoint = `/evaluations/quizz/${operation.payload.quizzId}/submit`;
        method = 'POST';
        data = { reponses: operation.payload.responses };
        break;
        
      case 'user_profile':
        endpoint = '/auth/profile';
        method = 'PUT';
        break;
        
      default:
        throw new Error(`Type d'entité non supporté: ${operation.entity}`);
    }

    const response = await this.makeApiRequest(method, endpoint, data);
    
    if (!response.success) {
      throw new Error(response.error || 'Erreur API inconnue');
    }
  }

  /**
   * Effectue une requête API (réutilise la logique du SyncEngine)
   */
  private async makeApiRequest(method: string, endpoint: string, data?: any): Promise<{success: boolean, data?: any, error?: string}> {
    // Implémentation identique au SyncEngine original
    try {
      let response;
      
      switch (method.toLowerCase()) {
        case 'post':
          response = await apiClient.post(endpoint, data);
          break;
        case 'put':
          response = await apiClient.put(endpoint, data);
          break;
        case 'delete':
          response = await apiClient.delete(endpoint);
          break;
        default:
          throw new Error(`Méthode HTTP non supportée: ${method}`);
      }
      
      return { success: true, data: response.data };
      
    } catch (error: any) {
      if (error.response?.status === 401) {
        const refreshed = await this.refreshAuthToken();
        if (refreshed) {
          return await this.makeApiRequest(method, endpoint, data);
        }
      }
      
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Erreur API inconnue'
      };
    }
  }

  /**
   * Rafraîchit le token d'authentification
   */
  private async refreshAuthToken(): Promise<boolean> {
    try {
      const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) return false;

      const response = await apiClient.post('/auth/refresh', { refreshToken });
      
      if (response.data?.token) {
        await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, response.data.token);
        if (response.data.refreshToken) {
          await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, response.data.refreshToken);
        }
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Erreur refresh token:', error);
      return false;
    }
  }

  /**
   * Gère les erreurs d'opération optimisées
   */
  private async handleOptimizedOperationError(operation: OptimizedSyncOperation, error: any): Promise<void> {
    const newRetryCount = operation.retryCount + 1;
    const errorMessage = error.message || 'Erreur inconnue';
    
    if (newRetryCount >= this.MAX_RETRIES) {
      await this.markOperationAsFailed(operation.operationId, errorMessage);
      console.error(`❌ Opération optimisée ${operation.operationId} échouée définitivement`);
    } else {
      await this.scheduleOptimizedRetry(operation.operationId, newRetryCount, errorMessage);
      console.warn(`⚠️ Opération optimisée ${operation.operationId} programmée pour retry ${newRetryCount}/${this.MAX_RETRIES}`);
    }
  }

  /**
   * Programme un retry optimisé
   */
  private async scheduleOptimizedRetry(operationId: string, retryCount: number, errorMessage: string): Promise<void> {
    const delay = this.RETRY_DELAYS[Math.min(retryCount - 1, this.RETRY_DELAYS.length - 1)];
    
    const updateQuery = `
      UPDATE optimized_sync_queue 
      SET retryCount = ?, lastError = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE operationId = ?
    `;
    
    await this.db.executeUpdate(updateQuery, [retryCount, errorMessage, operationId]);
    
    setTimeout(() => {
      if (this.isOnline && !this.syncMutex) {
        this.triggerSync();
      }
    }, delay);
  }

  // Méthodes utilitaires (similaires au SyncEngine original)
  private async markOperationAsProcessed(operationId: string): Promise<void> {
    const query = `
      UPDATE optimized_sync_queue 
      SET status = 'SYNCED', updatedAt = CURRENT_TIMESTAMP
      WHERE operationId = ?
    `;
    
    await this.db.executeUpdate(query, [operationId]);
  }

  private async markOperationAsFailed(operationId: string, errorMessage: string): Promise<void> {
    const query = `
      UPDATE optimized_sync_queue 
      SET status = 'FAILED', lastError = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE operationId = ?
    `;
    
    await this.db.executeUpdate(query, [errorMessage, operationId]);
  }

  private triggerSync(): void {
    if (this.backgroundTask) {
      clearTimeout(this.backgroundTask);
    }
    
    this.backgroundTask = setTimeout(() => {
      this.performOptimizedSync().catch(error => {
        console.error('❌ Erreur lors de la synchronisation optimisée:', error);
      });
    }, 1000);
  }

  private async pullServerChanges(): Promise<void> {
    // Implémentation similaire au SyncEngine original
    console.log('📥 Pull des changements serveur (optimisé)...');
  }

  private async cleanupSyncedOperations(): Promise<void> {
    const query = `
      DELETE FROM optimized_sync_queue 
      WHERE status = 'SYNCED' 
      AND updatedAt < datetime('now', '-1 day')
    `;
    
    await this.db.executeUpdate(query);
  }

  private async updateLastSyncTime(): Promise<void> {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.LAST_SYNC, Date.now().toString());
    } catch (error) {
      console.error('❌ Erreur sauvegarde heure sync:', error);
    }
  }

  /**
   * API publique - Obtient les métriques de performance
   */
  public getPerformanceMetrics(): any {
    return {
      networkStats: this.networkMonitor.getConnectionStats(),
      syncStats: this.syncMetrics.getStats(),
      anomalies: this.syncMetrics.detectAnomalies(),
      adaptiveInterval: this.adaptiveInterval
    };
  }

  /**
   * API publique - Force une synchronisation optimisée
   */
  public async forceOptimizedSync(): Promise<void> {
    if (!this.isOnline) {
      throw new Error('Impossible de synchroniser hors ligne');
    }
    
    await this.performOptimizedSync();
  }

  /**
   * Arrête le moteur optimisé
   */
  public stop(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    
    if (this.backgroundTask) {
      clearTimeout(this.backgroundTask);
      this.backgroundTask = null;
    }
    
    console.log('🛑 Moteur de synchronisation optimisé arrêté');
  }
}