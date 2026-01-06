import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { OptimizedSyncEngine } from '../../data/services/OptimizedSyncEngine';
import { NetworkMonitor, NetworkEvent } from '../../data/services/NetworkMonitor';
import { SyncMetrics } from '../../data/services/SyncMetrics';
import { EntityManager } from '../../data/services/EntityManager';
import { SQLiteDatabase } from '../../data/database/SQLiteDatabase';

/**
 * Interface pour le statut de synchronisation optimisé
 */
export interface OptimizedSyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSync: number | null;
  pendingOperations: number;
  failedOperations: number;
  conflicts: number;
  networkQuality: 'excellent' | 'good' | 'poor' | 'offline';
  isNetworkStable: boolean;
  adaptiveInterval: number;
  performanceMetrics?: any;
}

/**
 * Hook optimisé pour la gestion offline-first avec fonctionnalités avancées
 * Améliore useOfflineFirst avec des métriques et une synchronisation intelligente
 */
export function useOptimizedOfflineFirst() {
  // État de synchronisation optimisé
  const [syncStatus, setSyncStatus] = useState<OptimizedSyncStatus>({
    isOnline: false,
    isSyncing: false,
    lastSync: null,
    pendingOperations: 0,
    failedOperations: 0,
    conflicts: 0,
    networkQuality: 'offline',
    isNetworkStable: true,
    adaptiveInterval: 60000
  });

  // Services optimisés
  const optimizedSyncEngine = useRef(OptimizedSyncEngine.getInstance());
  const networkMonitor = useRef(NetworkMonitor.getInstance());
  const syncMetrics = useRef(SyncMetrics.getInstance());
  const entityManager = useRef(EntityManager.getInstance());
  const database = useRef(SQLiteDatabase.getInstance());

  // État d'initialisation
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  // ==================== INITIALISATION ====================

  /**
   * Initialise le système offline-first optimisé
   */
  const initialize = useCallback(async () => {
    try {
      console.log('🚀 Initialisation du système offline-first optimisé...');
      
      // 1. Initialiser la base de données
      await database.current.init();
      
      // 2. Démarrer le moteur de synchronisation optimisé
      await optimizedSyncEngine.current.start();
      
      // 3. Charger le statut initial
      await updateOptimizedSyncStatus();
      
      setIsInitialized(true);
      setInitError(null);
      
      console.log('✅ Système offline-first optimisé initialisé');
      
    } catch (error: any) {
      console.error('❌ Erreur initialisation offline-first optimisé:', error);
      setInitError(error.message);
      setIsInitialized(false);
    }
  }, []);

  // ==================== GESTION DU RÉSEAU OPTIMISÉE ====================

  /**
   * Met à jour le statut de synchronisation optimisé
   */
  const updateOptimizedSyncStatus = useCallback(async () => {
    try {
      const networkState = networkMonitor.current.getCurrentState();
      const networkStats = networkMonitor.current.getConnectionStats();
      const performanceMetrics = optimizedSyncEngine.current.getPerformanceMetrics();
      
      // Obtenir les statistiques de base (compatible avec l'ancien système)
      const basicStats = await entityManager.current.getEntityStats();
      
      setSyncStatus({
        isOnline: networkState?.isOnline || false,
        isSyncing: false, // TODO: Obtenir depuis OptimizedSyncEngine
        lastSync: performanceMetrics.syncStats.lastSync,
        pendingOperations: basicStats.pending,
        failedOperations: basicStats.failed,
        conflicts: 0, // TODO: Obtenir depuis ConflictResolutionService
        networkQuality: networkMonitor.current.getConnectionQuality(),
        isNetworkStable: networkMonitor.current.isConnectionStable(),
        adaptiveInterval: performanceMetrics.adaptiveInterval,
        performanceMetrics
      });
      
    } catch (error) {
      console.error('❌ Erreur mise à jour statut sync optimisé:', error);
    }
  }, []);

  // ==================== EFFETS ====================

  /**
   * Initialisation au montage
   */
  useEffect(() => {
    initialize();
    
    return () => {
      // Nettoyage au démontage
      optimizedSyncEngine.current.stop();
    };
  }, [initialize]);

  /**
   * Écoute des changements de réseau optimisée
   */
  useEffect(() => {
    const unsubscribe = networkMonitor.current.addListener((event: NetworkEvent) => {
      updateOptimizedSyncStatus();
      
      // Log des changements de qualité réseau
      if (event.isOnline) {
        const quality = networkMonitor.current.getConnectionQuality();
        const isStable = networkMonitor.current.isConnectionStable();
        console.log(`📡 Réseau: ${quality} (${isStable ? 'stable' : 'instable'})`);
      }
    });
    
    return unsubscribe;
  }, [updateOptimizedSyncStatus]);

  /**
   * Gestion des changements d'état de l'app avec métriques
   */
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        console.log('📱 App active - vérification synchronisation optimisée');
        updateOptimizedSyncStatus();
        
        // Analyser les performances depuis la dernière ouverture
        const anomalies = syncMetrics.current.detectAnomalies();
        if (anomalies.length > 0) {
          console.warn('⚠️ Anomalies détectées:', anomalies);
        }
        
        // Synchronisation intelligente basée sur les métriques
        if (syncStatus.isOnline && syncStatus.lastSync) {
          const timeSinceLastSync = Date.now() - syncStatus.lastSync;
          const shouldSync = timeSinceLastSync > syncStatus.adaptiveInterval;
          
          if (shouldSync) {
            optimizedSyncEngine.current.forceOptimizedSync().then(() => {
              updateOptimizedSyncStatus();
            }).catch(error => {
              console.error('❌ Erreur sync au retour app:', error);
            });
          }
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [syncStatus.isOnline, syncStatus.lastSync, syncStatus.adaptiveInterval, updateOptimizedSyncStatus]);

  /**
   * Mise à jour périodique du statut avec intervalle adaptatif
   */
  useEffect(() => {
    const interval = setInterval(updateOptimizedSyncStatus, syncStatus.adaptiveInterval / 2);
    return () => clearInterval(interval);
  }, [updateOptimizedSyncStatus, syncStatus.adaptiveInterval]);

  // ==================== API PUBLIQUE OPTIMISÉE ====================

  /**
   * Sauvegarde une réponse avec priorité
   */
  const saveAnswer = useCallback(async (
    questionId: string,
    quizzId: string,
    userId: string,
    content: string,
    priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL' = 'NORMAL'
  ) => {
    const result = await entityManager.current.saveAnswer(questionId, quizzId, userId, content);
    
    // Enregistrer l'opération avec priorité si nécessaire
    if (result.success && priority !== 'NORMAL') {
      await optimizedSyncEngine.current.addOperation(
        'answer_draft',
        `${questionId}_${quizzId}_${userId}`,
        'CREATE',
        { questionId, quizzId, userId, content },
        priority
      );
    }
    
    return result;
  }, []);

  /**
   * Récupère les réponses brouillons
   */
  const getAnswers = useCallback(async (quizzId: string, userId: string) => {
    return await entityManager.current.getAnswers(quizzId, userId);
  }, []);

  /**
   * Soumet un quizz avec priorité élevée
   */
  const submitQuiz = useCallback(async (
    quizzId: string,
    evaluationId: string,
    userId: string,
    responses: Array<{ questionId: string; content: string }>
  ) => {
    // Utiliser le moteur optimisé pour les soumissions critiques
    const operationId = await optimizedSyncEngine.current.addOperation(
      'submission',
      quizzId,
      'CREATE',
      { quizzId, evaluationId, userId, responses },
      'CRITICAL' // Priorité critique pour les soumissions
    );
    
    // Sauvegarder localement aussi
    const result = await entityManager.current.submitQuiz(quizzId, evaluationId, userId, responses);
    
    // Mettre à jour le statut après soumission
    setTimeout(updateOptimizedSyncStatus, 1000);
    
    return { ...result, operationId };
  }, [updateOptimizedSyncStatus]);

  /**
   * Force une synchronisation optimisée
   */
  const forceOptimizedSync = useCallback(async () => {
    if (!syncStatus.isOnline) {
      throw new Error('Impossible de synchroniser hors ligne');
    }
    
    try {
      await optimizedSyncEngine.current.forceOptimizedSync();
      await updateOptimizedSyncStatus();
      return { success: true };
    } catch (error: any) {
      console.error('❌ Erreur synchronisation optimisée forcée:', error);
      return { success: false, error: error.message };
    }
  }, [syncStatus.isOnline, updateOptimizedSyncStatus]);

  /**
   * Obtient les métriques de performance détaillées
   */
  const getPerformanceMetrics = useCallback(() => {
    return optimizedSyncEngine.current.getPerformanceMetrics();
  }, []);

  /**
   * Obtient les statistiques de synchronisation avancées
   */
  const getAdvancedStats = useCallback(() => {
    const networkStats = networkMonitor.current.getConnectionStats();
    const syncStats = syncMetrics.current.getStats();
    const syncStatsByEntity = syncMetrics.current.getStatsByEntity();
    const topErrors = syncMetrics.current.getTopErrors();
    const anomalies = syncMetrics.current.detectAnomalies();
    const performanceTrends = syncMetrics.current.getPerformanceTrends();
    
    return {
      network: networkStats,
      sync: syncStats,
      syncByEntity: syncStatsByEntity,
      topErrors,
      anomalies,
      performanceTrends
    };
  }, []);

  /**
   * Teste la connectivité réseau
   */
  const testConnectivity = useCallback(async (timeout: number = 5000) => {
    return await networkMonitor.current.testConnectivity(timeout);
  }, []);

  /**
   * Nettoie les métriques anciennes
   */
  const cleanupMetrics = useCallback(async (maxAge: number = 7 * 24 * 60 * 60 * 1000) => {
    try {
      syncMetrics.current.cleanup(maxAge);
      networkMonitor.current.clearHistory();
      await database.current.cleanOldData();
      await updateOptimizedSyncStatus();
      return { success: true };
    } catch (error: any) {
      console.error('❌ Erreur nettoyage métriques:', error);
      return { success: false, error: error.message };
    }
  }, [updateOptimizedSyncStatus]);

  /**
   * Exporte les données de diagnostic
   */
  const exportDiagnostics = useCallback(() => {
    const metrics = syncMetrics.current.exportMetrics();
    const networkStats = networkMonitor.current.getConnectionStats();
    const performanceMetrics = optimizedSyncEngine.current.getPerformanceMetrics();
    
    return {
      timestamp: Date.now(),
      syncMetrics: metrics,
      networkStats,
      performanceMetrics,
      syncStatus
    };
  }, [syncStatus]);

  /**
   * Réinitialise complètement le système (DEBUG)
   */
  const resetOptimizedSystem = useCallback(async () => {
    if (!__DEV__) {
      throw new Error('Fonction disponible uniquement en développement');
    }
    
    try {
      await database.current.clearAll();
      syncMetrics.current.reset();
      networkMonitor.current.clearHistory();
      await updateOptimizedSyncStatus();
      return { success: true };
    } catch (error: any) {
      console.error('❌ Erreur reset système optimisé:', error);
      return { success: false, error: error.message };
    }
  }, [updateOptimizedSyncStatus]);

  // ==================== RETOUR DU HOOK ====================

  return {
    // État optimisé
    isInitialized,
    initError,
    syncStatus,
    
    // Actions principales optimisées
    saveAnswer,
    getAnswers,
    submitQuiz,
    
    // Gestion de la synchronisation optimisée
    forceOptimizedSync,
    
    // Métriques et diagnostics
    getPerformanceMetrics,
    getAdvancedStats,
    testConnectivity,
    cleanupMetrics,
    exportDiagnostics,
    
    // Utilitaires
    updateOptimizedSyncStatus,
    
    // Debug (dev uniquement)
    ...__DEV__ && { resetOptimizedSystem }
  };
}

/**
 * Hook simplifié pour les composants qui n'ont besoin que du statut optimisé
 */
export function useOptimizedOfflineStatus() {
  const { syncStatus, isInitialized } = useOptimizedOfflineFirst();
  
  return {
    isOnline: syncStatus.isOnline,
    isSyncing: syncStatus.isSyncing,
    hasPendingData: syncStatus.pendingOperations > 0,
    hasConflicts: syncStatus.conflicts > 0,
    networkQuality: syncStatus.networkQuality,
    isNetworkStable: syncStatus.isNetworkStable,
    adaptiveInterval: syncStatus.adaptiveInterval,
    isInitialized
  };
}

/**
 * Hook pour les métriques de performance uniquement
 */
export function usePerformanceMetrics() {
  const { getPerformanceMetrics, getAdvancedStats } = useOptimizedOfflineFirst();
  
  return {
    getPerformanceMetrics,
    getAdvancedStats
  };
}