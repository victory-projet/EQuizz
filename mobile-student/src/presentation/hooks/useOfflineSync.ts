import { useState, useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { SyncService } from '../../data/services/SyncService';
import { useNetworkStatus } from './useNetworkStatus';
import NetInfo from '@react-native-community/netinfo';

/**
 * Hook pour la gestion de la synchronisation offline/online
 * Gère la synchronisation automatique, manuelle et en arrière-plan
 */
export function useOfflineSync() {
  const { isOnline } = useNetworkStatus();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState({
    pending: 0,
    failed: 0,
    lastSync: null as number | null,
  });

  const syncService = SyncService.getInstance();

  // Démarrer la synchronisation automatique au montage
  useEffect(() => {
    console.log('🚀 Initialisation de la synchronisation automatique...');
    syncService.startAutoSync();
  }, []);

  // Synchronisation automatique lors de la reconnexion réseau
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected && state.isInternetReachable) {
        console.log('📡 Connexion rétablie, déclenchement sync prioritaire...');
        // Synchronisation immédiate avec haute priorité
        setTimeout(() => {
          syncService.forceSyncNow().then(() => {
            loadSyncStatus();
          });
        }, 1000); // 1 seconde pour stabilité
      }
    });
    
    return () => unsubscribe();
  }, []);

  // Synchronisation lors du retour en premier plan
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        console.log('📱 App en premier plan, vérification sync...');
        // Synchronisation si dernière sync > 5 minutes
        const now = Date.now();
        if (!syncStatus.lastSync || (now - syncStatus.lastSync) > 5 * 60 * 1000) {
          setTimeout(() => {
            if (isOnline) {
              syncService.forceSyncNow().then(() => {
                loadSyncStatus();
              });
            }
          }, 2000);
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [isOnline, syncStatus.lastSync]);

  // Charger le statut de synchronisation
  const loadSyncStatus = useCallback(async () => {
    try {
      const status = await syncService.getSyncStatus();
      setSyncStatus(status);
    } catch (error) {
      console.error('❌ Erreur lors du chargement du statut sync:', error);
    }
  }, []);

  // Synchronisation manuelle
  const sync = useCallback(async () => {
    if (!isOnline) {
      console.log('📵 Sync impossible: hors ligne');
      return { 
        success: false, 
        message: 'Aucune connexion réseau disponible'
      };
    }

    if (isSyncing) {
      console.log('⏸️ Sync déjà en cours');
      return { 
        success: false, 
        message: 'Synchronisation déjà en cours'
      };
    }

    setIsSyncing(true);
    try {
      console.log('🔄 Début de la synchronisation manuelle...');
      const result = await syncService.forceSyncNow();
      
      await loadSyncStatus();

      const message = result.success > 0 
        ? `${result.success} tâche(s) synchronisée(s)`
        : 'Aucune donnée à synchroniser';

      return {
        success: true,
        message,
        details: result,
      };
    } catch (error: any) {
      console.error('❌ Erreur synchronisation manuelle:', error);
      return {
        success: false,
        message: error.message || 'Erreur de synchronisation',
      };
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, loadSyncStatus]);

  // Ajouter une soumission à la queue de sync
  const queueSubmission = useCallback(async (
    quizzId: string,
    evaluationId: string,
    userId: string,
    responses: any[]
  ) => {
    try {
      await syncService.queueSubmissionForSync(quizzId, evaluationId, userId, responses);
      await loadSyncStatus();
      
      return {
        success: true,
        message: 'Soumission ajoutée à la queue de synchronisation'
      };
    } catch (error: any) {
      console.error('❌ Erreur ajout soumission:', error);
      return {
        success: false,
        message: error.message || 'Erreur lors de l\'ajout à la queue'
      };
    }
  }, [loadSyncStatus]);

  // Charger le statut au montage et périodiquement
  useEffect(() => {
    loadSyncStatus();
    
    // Rafraîchir le statut toutes les 30 secondes
    const interval = setInterval(loadSyncStatus, 30000);
    return () => clearInterval(interval);
  }, [loadSyncStatus]);

  return {
    isOnline,
    isSyncing,
    syncStatus,
    sync,
    queueSubmission,
    refreshStatus: loadSyncStatus,
  };
}