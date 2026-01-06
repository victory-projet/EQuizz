import * as SecureStore from 'expo-secure-store';
import NetInfo from '@react-native-community/netinfo';
import { SQLiteDatabase } from '../database/SQLiteDatabase';
import { apiClient } from '../../core/api';
import { STORAGE_KEYS } from '../../core/constants';

/**
 * Types pour la queue d'opérations
 */
export interface SyncOperation {
  operationId: string;
  entity: string;
  entityId: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  payload: any;
  timestamp: number;
  retryCount: number;
  status: 'PENDING' | 'SYNCED' | 'FAILED';
  version?: number;
  lastError?: string;
}

/**
 * Moteur de synchronisation offline-first
 * Implémente la logique de synchronisation bidirectionnelle avec gestion des conflits
 */
export class SyncEngine {
  private static instance: SyncEngine;
  private db: SQLiteDatabase;
  private syncMutex = false;
  private isOnline = false;
  private syncInterval: any = null;
  private backgroundTask: any = null;

  // Configuration
  private readonly MAX_RETRIES = 5;
  private readonly RETRY_DELAYS = [1000, 2000, 5000, 10000, 30000]; // Backoff exponentiel
  private readonly SYNC_INTERVAL = 60000; // 1 minute
  private readonly BATCH_SIZE = 10;

  private constructor() {
    this.db = SQLiteDatabase.getInstance();
    this.initializeNetworkListener();
  }

  public static getInstance(): SyncEngine {
    if (!SyncEngine.instance) {
      SyncEngine.instance = new SyncEngine();
    }
    return SyncEngine.instance;
  }

  /**
   * Initialise l'écoute du réseau
   */
  private initializeNetworkListener(): void {
    NetInfo.addEventListener(state => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected === true && state.isInternetReachable === true;
      
      if (!wasOnline && this.isOnline) {
        console.log('📡 Connexion rétablie - déclenchement sync');
        this.triggerSync();
      }
    });
  }

  /**
   * Démarre le moteur de synchronisation
   */
  async start(): Promise<void> {
    console.log('🚀 Démarrage du moteur de synchronisation...');
    
    // Vérifier l'état réseau initial
    const netState = await NetInfo.fetch();
    this.isOnline = netState.isConnected === true && netState.isInternetReachable === true;
    
    // Créer la table de queue si elle n'existe pas
    await this.ensureSyncQueueTable();
    
    // Synchronisation initiale
    if (this.isOnline) {
      this.triggerSync();
    }
    
    // Démarrer la synchronisation périodique
    this.startPeriodicSync();
    
    console.log('✅ Moteur de synchronisation démarré');
  }

  /**
   * Arrête le moteur de synchronisation
   */
  stop(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    
    if (this.backgroundTask) {
      clearTimeout(this.backgroundTask);
      this.backgroundTask = null;
    }
    
    console.log('🛑 Moteur de synchronisation arrêté');
  }

  /**
   * Assure que la table sync_queue existe avec le bon schéma
   */
  private async ensureSyncQueueTable(): Promise<void> {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS sync_queue (
        operationId TEXT PRIMARY KEY,
        entity TEXT NOT NULL,
        entityId TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('CREATE', 'UPDATE', 'DELETE')),
        payload TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        retryCount INTEGER DEFAULT 0,
        status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SYNCED', 'FAILED')),
        version INTEGER DEFAULT 1,
        lastError TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await this.db.executeUpdate(createTableQuery);
    
    // Index pour optimiser les requêtes
    await this.db.executeUpdate(`
      CREATE INDEX IF NOT EXISTS idx_sync_queue_status_timestamp 
      ON sync_queue(status, timestamp)
    `);
  }

  /**
   * Ajoute une opération à la queue de synchronisation
   */
  async addOperation(
    entity: string,
    entityId: string,
    type: 'CREATE' | 'UPDATE' | 'DELETE',
    payload: any,
    version?: number
  ): Promise<string> {
    const operationId = `${entity}_${entityId}_${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const operation: SyncOperation = {
      operationId,
      entity,
      entityId,
      type,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
      status: 'PENDING',
      version: version || 1
    };

    const query = `
      INSERT INTO sync_queue 
      (operationId, entity, entityId, type, payload, timestamp, retryCount, status, version)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      operation.version || 1
    ]);

    console.log(`📝 Opération ajoutée à la queue: ${operationId}`);
    
    // Déclencher la synchronisation si en ligne
    if (this.isOnline) {
      this.triggerSync();
    }
    
    return operationId;
  }

  /**
   * Déclenche une synchronisation
   */
  private triggerSync(): void {
    if (this.backgroundTask) {
      clearTimeout(this.backgroundTask);
    }
    
    this.backgroundTask = setTimeout(() => {
      this.performSync().catch(error => {
        console.error('❌ Erreur lors de la synchronisation:', error);
      });
    }, 1000);
  }

  /**
   * Démarre la synchronisation périodique
   */
  private startPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.syncMutex) {
        this.performSync().catch(error => {
          console.error('❌ Erreur sync périodique:', error);
        });
      }
    }, this.SYNC_INTERVAL);
  }

  /**
   * Effectue la synchronisation complète
   */
  private async performSync(): Promise<void> {
    // Verrou pour éviter les synchronisations concurrentes
    if (this.syncMutex) {
      console.log('⏸️ Synchronisation déjà en cours, ignorée');
      return;
    }

    if (!this.isOnline) {
      console.log('📵 Hors ligne, synchronisation reportée');
      return;
    }

    this.syncMutex = true;
    
    try {
      console.log('🔄 Début de la synchronisation...');
      
      // 1. Push des opérations locales vers le serveur
      await this.pushLocalOperations();
      
      // 2. Pull des changements depuis le serveur
      await this.pullServerChanges();
      
      // 3. Nettoyer les opérations synchronisées
      await this.cleanupSyncedOperations();
      
      // 4. Mettre à jour l'heure de dernière sync
      await this.updateLastSyncTime();
      
      console.log('✅ Synchronisation terminée avec succès');
      
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation:', error);
    } finally {
      this.syncMutex = false;
    }
  }

  /**
   * Push des opérations locales vers le serveur
   */
  private async pushLocalOperations(): Promise<void> {
    const pendingOps = await this.getPendingOperations();
    
    if (pendingOps.length === 0) {
      console.log('📤 Aucune opération en attente');
      return;
    }

    console.log(`📤 Push de ${pendingOps.length} opération(s)...`);

    // Traiter par batch pour éviter la surcharge
    for (let i = 0; i < pendingOps.length; i += this.BATCH_SIZE) {
      const batch = pendingOps.slice(i, i + this.BATCH_SIZE);
      await this.processBatch(batch);
    }
  }

  /**
   * Traite un batch d'opérations
   */
  private async processBatch(operations: SyncOperation[]): Promise<void> {
    for (const operation of operations) {
      try {
        await this.processOperation(operation);
      } catch (error) {
        console.error(`❌ Erreur traitement opération ${operation.operationId}:`, error);
        await this.handleOperationError(operation, error);
      }
    }
  }

  /**
   * Traite une opération individuelle
   */
  private async processOperation(operation: SyncOperation): Promise<void> {
    console.log(`🔄 Traitement: ${operation.entity} ${operation.type} ${operation.entityId}`);
    
    let endpoint = '';
    let method = '';
    let data = operation.payload;

    // Construire l'endpoint et la méthode selon l'entité et le type
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
        
      case 'answer':
        // Les réponses brouillons ne sont pas synchronisées individuellement
        await this.markOperationAsProcessed(operation.operationId);
        return;
        
      default:
        throw new Error(`Type d'entité non supporté: ${operation.entity}`);
    }

    // Effectuer la requête
    const response = await this.makeApiRequest(method, endpoint, data);
    
    if (response.success) {
      await this.markOperationAsProcessed(operation.operationId);
      
      // Traitement spécifique selon le type d'opération
      if (operation.entity === 'submission') {
        await this.handleSubmissionSuccess(operation);
      }
      
      console.log(`✅ Opération ${operation.operationId} synchronisée`);
    } else {
      throw new Error(response.error || 'Erreur API inconnue');
    }
  }

  /**
   * Effectue une requête API avec gestion des erreurs
   */
  private async makeApiRequest(method: string, endpoint: string, data?: any): Promise<{success: boolean, data?: any, error?: string}> {
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
      // Gestion spéciale pour l'erreur 401 (token expiré)
      if (error.response?.status === 401) {
        const refreshed = await this.refreshAuthToken();
        if (refreshed) {
          // Réessayer une fois avec le nouveau token
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
   * Gère le succès d'une soumission
   */
  private async handleSubmissionSuccess(operation: SyncOperation): Promise<void> {
    // Supprimer les réponses brouillons associées
    const deleteAnswersQuery = `
      DELETE FROM answers 
      WHERE quizz_id = ? AND user_id = ?
    `;
    
    await this.db.executeUpdate(deleteAnswersQuery, [
      operation.payload.quizzId,
      operation.payload.userId
    ]);
    
    // Marquer la soumission comme synchronisée dans la table submissions
    const updateSubmissionQuery = `
      UPDATE submissions 
      SET synced = 1, synced_at = CURRENT_TIMESTAMP
      WHERE quizz_id = ? AND user_id = ?
    `;
    
    await this.db.executeUpdate(updateSubmissionQuery, [
      operation.payload.quizzId,
      operation.payload.userId
    ]);
  }

  /**
   * Gère les erreurs d'opération
   */
  private async handleOperationError(operation: SyncOperation, error: any): Promise<void> {
    const newRetryCount = operation.retryCount + 1;
    const errorMessage = error.message || 'Erreur inconnue';
    
    if (newRetryCount >= this.MAX_RETRIES) {
      // Marquer comme échoué définitivement
      await this.markOperationAsFailed(operation.operationId, errorMessage);
      console.error(`❌ Opération ${operation.operationId} échouée définitivement`);
    } else {
      // Programmer un retry avec backoff exponentiel
      await this.scheduleRetry(operation.operationId, newRetryCount, errorMessage);
      console.warn(`⚠️ Opération ${operation.operationId} programmée pour retry ${newRetryCount}/${this.MAX_RETRIES}`);
    }
  }

  /**
   * Programme un retry avec délai
   */
  private async scheduleRetry(operationId: string, retryCount: number, errorMessage: string): Promise<void> {
    const delay = this.RETRY_DELAYS[Math.min(retryCount - 1, this.RETRY_DELAYS.length - 1)];
    
    const updateQuery = `
      UPDATE sync_queue 
      SET retryCount = ?, lastError = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE operationId = ?
    `;
    
    await this.db.executeUpdate(updateQuery, [retryCount, errorMessage, operationId]);
    
    // Programmer le retry
    setTimeout(() => {
      if (this.isOnline && !this.syncMutex) {
        this.triggerSync();
      }
    }, delay);
  }

  /**
   * Pull des changements depuis le serveur
   */
  private async pullServerChanges(): Promise<void> {
    try {
      console.log('📥 Pull des changements serveur...');
      
      const lastSyncTime = await this.getLastSyncTime();
      
      // Récupérer les évaluations mises à jour
      const evaluationsResponse = await apiClient.get('/evaluations', {
        params: lastSyncTime ? { since: new Date(lastSyncTime).toISOString() } : {}
      });
      
      if (evaluationsResponse.data?.evaluations) {
        await this.updateLocalEvaluations(evaluationsResponse.data.evaluations);
      }
      
      // Récupérer le profil utilisateur mis à jour
      const profileResponse = await apiClient.get('/auth/me');
      if (profileResponse.data) {
        await this.updateLocalUserProfile(profileResponse.data);
      }
      
      console.log('✅ Pull des changements terminé');
      
    } catch (error) {
      console.error('❌ Erreur lors du pull:', error);
      // Ne pas throw pour ne pas bloquer la sync complète
    }
  }

  /**
   * Met à jour les évaluations locales
   */
  private async updateLocalEvaluations(evaluations: any[]): Promise<void> {
    for (const evaluation of evaluations) {
      const query = `
        INSERT OR REPLACE INTO evaluations 
        (id, titre, description, cours_id, date_debut, date_fin, duree_minutes, status, synced, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
      `;
      
      await this.db.executeUpdate(query, [
        evaluation.id,
        evaluation.titre,
        evaluation.description || null,
        evaluation.coursId || null,
        evaluation.dateDebut || null,
        evaluation.dateFin || null,
        evaluation.dureeMinutes || null,
        evaluation.status || 'active'
      ]);
    }
    
    console.log(`📚 ${evaluations.length} évaluation(s) mise(s) à jour localement`);
  }

  /**
   * Met à jour le profil utilisateur local
   */
  private async updateLocalUserProfile(userData: any): Promise<void> {
    const query = `
      INSERT OR REPLACE INTO users 
      (id, nom, prenom, email, matricule, role, classe_id, classe_nom, classe_niveau, synced, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
    `;
    
    await this.db.executeUpdate(query, [
      userData.id,
      userData.nom,
      userData.prenom,
      userData.email,
      userData.matricule || null,
      userData.role,
      userData.classe?.id || null,
      userData.classe?.nom || null,
      userData.classe?.niveau || null
    ]);
    
    console.log('👤 Profil utilisateur mis à jour localement');
  }

  // ==================== MÉTHODES UTILITAIRES ====================

  /**
   * Récupère les opérations en attente
   */
  private async getPendingOperations(): Promise<SyncOperation[]> {
    const query = `
      SELECT * FROM sync_queue 
      WHERE status = 'PENDING' AND retryCount < ?
      ORDER BY timestamp ASC
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
      version: row.version,
      lastError: row.lastError
    }));
  }

  /**
   * Marque une opération comme traitée
   */
  private async markOperationAsProcessed(operationId: string): Promise<void> {
    const query = `
      UPDATE sync_queue 
      SET status = 'SYNCED', updatedAt = CURRENT_TIMESTAMP
      WHERE operationId = ?
    `;
    
    await this.db.executeUpdate(query, [operationId]);
  }

  /**
   * Marque une opération comme échouée
   */
  private async markOperationAsFailed(operationId: string, errorMessage: string): Promise<void> {
    const query = `
      UPDATE sync_queue 
      SET status = 'FAILED', lastError = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE operationId = ?
    `;
    
    await this.db.executeUpdate(query, [errorMessage, operationId]);
  }

  /**
   * Nettoie les opérations synchronisées
   */
  private async cleanupSyncedOperations(): Promise<void> {
    // Supprimer les opérations synchronisées de plus de 24h
    const query = `
      DELETE FROM sync_queue 
      WHERE status = 'SYNCED' 
      AND updatedAt < datetime('now', '-1 day')
    `;
    
    await this.db.executeUpdate(query);
  }

  /**
   * Récupère l'heure de dernière synchronisation
   */
  private async getLastSyncTime(): Promise<number | null> {
    try {
      const lastSyncStr = await SecureStore.getItemAsync(STORAGE_KEYS.LAST_SYNC);
      return lastSyncStr ? parseInt(lastSyncStr) : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Met à jour l'heure de dernière synchronisation
   */
  private async updateLastSyncTime(): Promise<void> {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.LAST_SYNC, Date.now().toString());
    } catch (error) {
      console.error('❌ Erreur sauvegarde heure sync:', error);
    }
  }

  // ==================== API PUBLIQUE ====================

  /**
   * Ajoute une soumission de quizz à la queue
   */
  async queueSubmission(quizzId: string, evaluationId: string, userId: string, responses: any[]): Promise<string> {
    // D'abord sauvegarder localement
    const submissionQuery = `
      INSERT INTO submissions (quizz_id, evaluation_id, user_id, responses, completed_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;
    
    await this.db.executeUpdate(submissionQuery, [
      quizzId,
      evaluationId,
      userId,
      JSON.stringify(responses)
    ]);

    // Puis ajouter à la queue de sync
    return await this.addOperation('submission', quizzId, 'CREATE', {
      quizzId,
      evaluationId,
      userId,
      responses
    });
  }

  /**
   * Récupère les statistiques de synchronisation
   */
  async getSyncStats(): Promise<{
    pending: number;
    failed: number;
    synced: number;
    lastSync: number | null;
  }> {
    const [pendingResult, failedResult, syncedResult] = await Promise.all([
      this.db.executeQuery("SELECT COUNT(*) as count FROM sync_queue WHERE status = 'PENDING'"),
      this.db.executeQuery("SELECT COUNT(*) as count FROM sync_queue WHERE status = 'FAILED'"),
      this.db.executeQuery("SELECT COUNT(*) as count FROM sync_queue WHERE status = 'SYNCED'")
    ]);

    const lastSync = await this.getLastSyncTime();

    return {
      pending: pendingResult[0]?.count || 0,
      failed: failedResult[0]?.count || 0,
      synced: syncedResult[0]?.count || 0,
      lastSync
    };
  }

  /**
   * Force une synchronisation immédiate
   */
  async forcSync(): Promise<void> {
    if (!this.isOnline) {
      throw new Error('Impossible de synchroniser hors ligne');
    }
    
    await this.performSync();
  }

  /**
   * Réinitialise les opérations échouées
   */
  async retryFailedOperations(): Promise<void> {
    const query = `
      UPDATE sync_queue 
      SET status = 'PENDING', retryCount = 0, lastError = NULL, updatedAt = CURRENT_TIMESTAMP
      WHERE status = 'FAILED'
    `;
    
    await this.db.executeUpdate(query);
    
    if (this.isOnline) {
      this.triggerSync();
    }
  }

  /**
   * Vérifie si le moteur est en ligne
   */
  get online(): boolean {
    return this.isOnline;
  }

  /**
   * Vérifie si une synchronisation est en cours
   */
  get syncing(): boolean {
    return this.syncMutex;
  }
}