import { useState, useEffect, useCallback } from 'react';
import { SyncService } from '../../data/services/SyncService';
import { useNetworkStatus } from './useNetworkStatus';
import NetInfo from '@react-native-community/netinfo';

/**
 * Hook pour la gestion de la synchronisation offline/online
 * Gère la synchronisation automatique et manuelle
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

  // Synchronisation automatique lors de la reconnexion
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected && state.isInternetReachable) {
        console.log('📡 Connexion détectée, déclenchement de l\'auto-sync...');
        // Délai de 2 secondes pour stabilité de la connexion
        setTimeout(() => {
          if (!syncService.isCurrentlySyncing) {
            syncService.syncAll().then(() => {
              loadSyncStatus();
            });
          }
        }, 2000);
      }
    });
    
    return () => unsubscribe();
  }, []);

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
    if (!isOnline || isSyncing) {
      console.log('⏸️ Sync impossible: hors ligne ou déjà en cours');
      return { 
        success: false, 
        message: isOnline ? 'Synchronisation déjà en cours' : 'Hors ligne' 
      };
    }

    setIsSyncing(true);
    try {
      console.log('🔄 Début de la synchronisation manuelle...');
      const result = await syncService.syncAll();
      
      if (result.success > 0) {
        await syncService.setLastSyncTime();
      }

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

  // Auto-sync quand connexion rétablie et éléments en attente
  useEffect(() => {
    if (isOnline && syncStatus.pending > 0 && !isSyncing) {
      console.log('📡 Connexion rétablie avec éléments en attente, auto-sync...');
      const timer = setTimeout(() => {
        sync();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, syncStatus.pending, isSyncing, sync]);

  // Charger le statut au montage
  useEffect(() => {
    loadSyncStatus();
  }, [loadSyncStatus]);

  return {
    isOnline,
    isSyncing,
    syncStatus,
    sync,
    refreshStatus: loadSyncStatus,
  };
}