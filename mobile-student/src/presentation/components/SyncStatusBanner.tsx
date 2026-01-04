import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useOfflineSync } from '../hooks/useOfflineSync';

/**
 * Bannière d'état de synchronisation
 * Affiche le statut offline/online et permet la synchronisation manuelle
 */
export function SyncStatusBanner() {
  const { isOnline, isSyncing, syncStatus, sync } = useOfflineSync();

  // Ne pas afficher si tout est OK
  if (isOnline && syncStatus.pending === 0 && syncStatus.failed === 0 && !isSyncing) {
    return null;
  }

  const handleSync = async () => {
    if (!isSyncing && isOnline) {
      const result = await sync();
      if (result.success) {
        console.log('✅ Synchronisation manuelle réussie:', result.message);
      } else {
        console.error('❌ Synchronisation manuelle échouée:', result.message);
      }
    }
  };

  const getStatusColor = () => {
    if (!isOnline) return '#DC2626'; // Rouge pour offline
    if (isSyncing) return '#F59E0B'; // Orange pour sync en cours
    if (syncStatus.failed > 0) return '#DC2626'; // Rouge pour échecs
    if (syncStatus.pending > 0) return '#F59E0B'; // Orange pour en attente
    return '#10B981'; // Vert pour OK
  };

  const getStatusText = () => {
    if (!isOnline) return 'Hors ligne';
    if (isSyncing) return 'Synchronisation...';
    if (syncStatus.failed > 0) return `${syncStatus.failed} échec(s)`;
    if (syncStatus.pending > 0) return `${syncStatus.pending} en attente`;
    return 'Synchronisé';
  };

  const getLastSyncText = () => {
    if (!syncStatus.lastSync) return '';
    
    const now = Date.now();
    const diff = now - syncStatus.lastSync;
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes}min`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    
    const days = Math.floor(hours / 24);
    return `Il y a ${days}j`;
  };

  return (
    <View style={[styles.container, { backgroundColor: getStatusColor() }]}>
      <View style={styles.content}>
        <View style={styles.statusSection}>
          {isSyncing && <ActivityIndicator size="small" color="white" style={styles.spinner} />}
          <Text style={styles.statusText}>{getStatusText()}</Text>
          {syncStatus.lastSync && (
            <Text style={styles.lastSyncText}>{getLastSyncText()}</Text>
          )}
        </View>
        
        {isOnline && !isSyncing && (syncStatus.pending > 0 || syncStatus.failed > 0) && (
          <TouchableOpacity style={styles.syncButton} onPress={handleSync}>
            <Text style={styles.syncButtonText}>Synchroniser</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  spinner: {
    marginRight: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  lastSyncText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginLeft: 8,
  },
  syncButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  syncButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});