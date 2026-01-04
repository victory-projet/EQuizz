import { useState, useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { SyncService } from '../../data/services/SyncService';
import { useNetworkStatus } from './useNetworkStatus';
import NetInfo from '@react-native-community/netinfo';

/**
 * Hook pour la gestion de la synchronisation offline/online automatique
 * Gère uniquement la synchronisation automatique (pas de sync manuelle)
 */
export function useOfflineSync() {
  const { isOnline } = useNetworkStatus();
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
    
    // Nettoyer au démontage
    return () => {
      syncService.stopAutoSync();
    };
  }, []);

  // Synchronisation automatique lors de la reconnexion réseau
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected && state.isInternetReachable) {
        console.log('📡 Connexion rétablie, déclenchement sync automatique...');
        // Synchronisation immédiate avec haute priorité
        setTimeout(() => {
          syncService.triggerNetworkSync().then(() => {
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
        setTimeout(() => {
          if (isOnline) {
            syncService.triggerForegroundSync().then(() => {
              loadSyncStatus();
            });
          }
        }, 2000);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [isOnline]);

  // Charger le statut de synchronisation
  const loadSyncStatus = useCallback(async () => {
    try {
      const status = await syncService.getSyncStatus();
      setSyncStatus(status);
    } catch (error) {
      console.error('❌ Erreur lors du chargement du statut sync:', error);
    }
  }, []);

  // Ajouter une soumission à la queue de sync (automatique)
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
        message: 'Soumission ajoutée à la synchronisation automatique'
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
    isSyncing: syncService.isCurrentlySyncing,
    syncStatus,
    queueSubmission,
    refreshStatus: loadSyncStatus,
  };
}