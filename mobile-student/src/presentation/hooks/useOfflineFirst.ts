import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

import { SyncEngine } from '../../data/services/SyncEngine';
import { EntityManager } from '../../data/services/EntityManager';
import { ConflictResolutionService } from '../../data/services/ConflictResolutionService';
import { SQLiteDatabase } from '../../data/database/SQLiteDatabase';

// Nom de la tâche de synchronisation en arrière-plan
const BACKGROUND_SYNC_TASK = 'background-sync-task';

/**
 * Interface pour le statut de synchronisation
 */
export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSync: number | null;
  pendingOperations: number;
  failedOperations: number;
  conflicts: number;
}

/**
 * Hook principal pour la gestion offline-first
 * Centralise toute la logique de synchronisation, gestion réseau et stockage local
 */
export function useOfflineFirst() {
  // État de synchronisation
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: false,
    isSyncing: false,
    lastSync: null,
    pendingOperations: 0,
    failedOperations: 0,
    conflicts: 0
  });

  // Services
  const syncEngine = useRef(SyncEngine.getInstance());
  const entityManager = useRef(EntityManager.getInstance());
  const conflictResolver = useRef(ConflictResolutionService.getInstance());
  const database = useRef(SQLiteDatabase.getInstance());

  // État d'initialisation
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  // ==================== INITIALISATION ====================

  /**
   * Initialise le système offline-first
   */
  const initialize = useCallback(async () => {
    try {
      console.log('🚀 Initialisation du système offline-first...');
      
      // 1. Initialiser la base de données
      await database.current.init();
      
      // 2. Démarrer le moteur de synchronisation
      await syncEngine.current.start();
      
      // 3. Configurer la synchronisation en arrière-plan
      await setupBackgroundSync();
      
      // 4. Charger le statut initial
      await updateSyncStatus();
      
      setIsInitialized(true);
      setInitError(null);
      
      console.log('✅ Système offline-first initialisé');
      
    } catch (error: any) {
      console.error('❌ Erreur initialisation offline-first:', error);
      setInitError(error.message);
      setIsInitialized(false);
    }
  }, []);

  /**
   * Configure la synchronisation en arrière-plan
   */
  const setupBackgroundSync = useCallback(async () => {
    try {
      // Définir la tâche de synchronisation
      TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
        try {
          console.log('🔄 Synchronisation en arrière-plan déclenchée');
          
          if (syncEngine.current.online && !syncEngine.current.syncing) {
            await syncEngine.current.forcSync();
            console.log('✅ Synchronisation en arrière-plan terminée');
            return BackgroundFetch.BackgroundFetchResult.NewData;
          }
          
          return BackgroundFetch.BackgroundFetchResult.NoData;
        } catch (error) {
          console.error('❌ Erreur sync arrière-plan:', error);
          return BackgroundFetch.BackgroundFetchResult.Failed;
        }
      });

      // Enregistrer la tâche de synchronisation
      await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
        minimumInterval: 15 * 60, // 15 minutes minimum
        stopOnTerminate: false,
        startOnBoot: true,
      });

      console.log('✅ Synchronisation en arrière-plan configurée');
      
    } catch (error) {
      console.error('❌ Erreur configuration sync arrière-plan:', error);
    }
  }, []);

  // ==================== GESTION DU RÉSEAU ====================

  /**
   * Met à jour le statut de synchronisation
   */
  const updateSyncStatus = useCallback(async () => {
    try {
      const netState = await NetInfo.fetch();
      const isOnline = netState.isConnected === true && netState.isInternetReachable === true;
      
      const syncStats = await syncEngine.current.getSyncStats();
      const conflicts = conflictResolver.current.getPendingConflicts();
      
      setSyncStatus({
        isOnline,
        isSyncing: syncEngine.current.syncing,
        lastSync: syncStats.lastSync,
        pendingOperations: syncStats.pending,
        failedOperations: syncStats.failed,
        conflicts: conflicts.length
      });
      
    } catch (error) {
      console.error('❌ Erreur mise à jour statut sync:', error);
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
      syncEngine.current.stop();
    };
  }, [initialize]);

  /**
   * Écoute des changements de réseau
   */
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const wasOnline = syncStatus.isOnline;
      const isOnline = state.isConnected === true && state.isInternetReachable === true;
      
      if (!wasOnline && isOnline) {
        console.log('📡 Connexion rétablie - synchronisation automatique');
        // Déclencher une synchronisation après un court délai
        setTimeout(() => {
          syncEngine.current.forcSync().then(() => {
            updateSyncStatus();
          });
        }, 2000);
      }
      
      updateSyncStatus();
    });
    
    return () => unsubscribe();
  }, [syncStatus.isOnline, updateSyncStatus]);

  /**
   * Gestion des changements d'état de l'app
   */
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        console.log('📱 App active - vérification synchronisation');
        updateSyncStatus();
        
        // Synchronisation si en ligne et pas de sync récente
        if (syncStatus.isOnline && syncStatus.lastSync) {
          const timeSinceLastSync = Date.now() - syncStatus.lastSync;
          if (timeSinceLastSync > 5 * 60 * 1000) { // 5 minutes
            syncEngine.current.forcSync().then(() => {
              updateSyncStatus();
            });
          }
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [syncStatus.isOnline, syncStatus.lastSync, updateSyncStatus]);

  /**
   * Mise à jour périodique du statut
   */
  useEffect(() => {
    const interval = setInterval(updateSyncStatus, 30000); // 30 secondes
    return () => clearInterval(interval);
  }, [updateSyncStatus]);

  // ==================== API PUBLIQUE ====================

  /**
   * Sauvegarde une réponse brouillon
   */
  const saveAnswer = useCallback(async (
    questionId: string,
    quizzId: string,
    userId: string,
    content: string
  ) => {
    return await entityManager.current.saveAnswer(questionId, quizzId, userId, content);
  }, []);

  /**
   * Récupère les réponses brouillons
   */
  const getAnswers = useCallback(async (quizzId: string, userId: string) => {
    return await entityManager.current.getAnswers(quizzId, userId);
  }, []);

  /**
   * Soumet un quizz
   */
  const submitQuiz = useCallback(async (
    quizzId: string,
    evaluationId: string,
    userId: string,
    responses: Array<{ questionId: string; content: string }>
  ) => {
    const result = await entityManager.current.submitQuiz(quizzId, evaluationId, userId, responses);
    
    // Mettre à jour le statut après soumission
    setTimeout(updateSyncStatus, 1000);
    
    return result;
  }, [updateSyncStatus]);

  /**
   * Force une synchronisation manuelle
   */
  const forceSync = useCallback(async () => {
    if (!syncStatus.isOnline) {
      throw new Error('Impossible de synchroniser hors ligne');
    }
    
    try {
      await syncEngine.current.forcSync();
      await updateSyncStatus();
      return { success: true };
    } catch (error: any) {
      console.error('❌ Erreur synchronisation forcée:', error);
      return { success: false, error: error.message };
    }
  }, [syncStatus.isOnline, updateSyncStatus]);

  /**
   * Réessaie les opérations échouées
   */
  const retryFailedOperations = useCallback(async () => {
    try {
      await syncEngine.current.retryFailedOperations();
      await updateSyncStatus();
      return { success: true };
    } catch (error: any) {
      console.error('❌ Erreur retry opérations:', error);
      return { success: false, error: error.message };
    }
  }, [updateSyncStatus]);

  /**
   * Récupère les conflits en attente
   */
  const getPendingConflicts = useCallback(() => {
    return conflictResolver.current.getPendingConflicts();
  }, []);

  /**
   * Résout un conflit manuellement
   */
  const resolveConflict = useCallback(async (conflictKey: string, chosenData: any) => {
    try {
      await conflictResolver.current.resolveManually(conflictKey, chosenData);
      await updateSyncStatus();
      return { success: true };
    } catch (error: any) {
      console.error('❌ Erreur résolution conflit:', error);
      return { success: false, error: error.message };
    }
  }, [updateSyncStatus]);

  /**
   * Nettoie les données anciennes
   */
  const cleanupOldData = useCallback(async () => {
    try {
      await database.current.cleanOldData();
      conflictResolver.current.cleanupOldConflicts();
      await updateSyncStatus();
      return { success: true };
    } catch (error: any) {
      console.error('❌ Erreur nettoyage données:', error);
      return { success: false, error: error.message };
    }
  }, [updateSyncStatus]);

  /**
   * Récupère les statistiques détaillées
   */
  const getDetailedStats = useCallback(async () => {
    try {
      const syncStats = await syncEngine.current.getSyncStats();
      const conflictStats = conflictResolver.current.getConflictStats();
      const entityStats = await entityManager.current.getEntityStats();
      
      return {
        sync: syncStats,
        conflicts: conflictStats,
        entities: entityStats
      };
    } catch (error) {
      console.error('❌ Erreur récupération stats:', error);
      return null;
    }
  }, []);

  /**
   * Réinitialise complètement les données locales (DEBUG)
   */
  const resetLocalData = useCallback(async () => {
    if (!__DEV__) {
      throw new Error('Fonction disponible uniquement en développement');
    }
    
    try {
      await database.current.clearAll();
      await updateSyncStatus();
      return { success: true };
    } catch (error: any) {
      console.error('❌ Erreur reset données:', error);
      return { success: false, error: error.message };
    }
  }, [updateSyncStatus]);

  // ==================== RETOUR DU HOOK ====================

  return {
    // État
    isInitialized,
    initError,
    syncStatus,
    
    // Actions principales
    saveAnswer,
    getAnswers,
    submitQuiz,
    
    // Gestion de la synchronisation
    forceSync,
    retryFailedOperations,
    
    // Gestion des conflits
    getPendingConflicts,
    resolveConflict,
    
    // Utilitaires
    cleanupOldData,
    getDetailedStats,
    updateSyncStatus,
    
    // Debug (dev uniquement)
    ...__DEV__ && { resetLocalData }
  };
}

/**
 * Hook simplifié pour les composants qui n'ont besoin que du statut
 */
export function useOfflineStatus() {
  const { syncStatus, isInitialized } = useOfflineFirst();
  
  return {
    isOnline: syncStatus.isOnline,
    isSyncing: syncStatus.isSyncing,
    hasPendingData: syncStatus.pendingOperations > 0,
    hasConflicts: syncStatus.conflicts > 0,
    isInitialized
  };
}

/**
 * Hook pour les opérations de quizz uniquement
 */
export function useOfflineQuiz() {
  const { saveAnswer, getAnswers, submitQuiz, syncStatus } = useOfflineFirst();
  
  return {
    saveAnswer,
    getAnswers,
    submitQuiz,
    canSubmit: true, // Toujours possible en offline-first
    isOnline: syncStatus.isOnline,
    pendingSubmissions: syncStatus.pendingOperations
  };
}