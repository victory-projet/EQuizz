import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useOfflineSync } from '../hooks/useOfflineSync';

/**
 * Bannière d'état de synchronisation automatique
 * Affiche le statut offline/online (pas de synchronisation manuelle)
 */
export function SyncStatusBanner() {
  const { isOnline, isSyncing, syncStatus } = useOfflineSync();

  // Ne pas afficher si tout est OK
  if (isOnline && syncStatus.pending === 0 && syncStatus.failed === 0 && !isSyncing) {
    return null;
  }

  const getStatusColor = () => {
    if (!isOnline) return '#DC2626'; // Rouge pour offline
    if (isSyncing) return '#F59E0B'; // Orange pour sync en cours
    if (syncStatus.failed > 0) return '#DC2626'; // Rouge pour échecs
    if (syncStatus.pending > 0) return '#F59E0B'; // Orange pour en attente
    return '#10B981'; // Vert pour OK
  };

  const getStatusText = () => {
    if (!isOnline) return 'Hors ligne - Synchronisation automatique suspendue';
    if (isSyncing) return 'Synchronisation automatique en cours...';
    if (syncStatus.failed > 0) return `${syncStatus.failed} échec(s) - Nouvelle tentative automatique prévue`;
    if (syncStatus.pending > 0) return `${syncStatus.pending} élément(s) en attente de synchronisation`;
    return 'Synchronisé automatiquement';
  };

  const getLastSyncText = () => {
    if (!syncStatus.lastSync) return '';
    
    const now = Date.now();
    const diff = now - syncStatus.lastSync;
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Dernière sync: À l\'instant';
    if (minutes < 60) return `Dernière sync: Il y a ${minutes}min`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Dernière sync: Il y a ${hours}h`;
    
    const days = Math.floor(hours / 24);
    return `Dernière sync: Il y a ${days}j`;
  };

  return (
    <View style={[styles.container, { backgroundColor: getStatusColor() }]}>
      <View style={styles.content}>
        <View style={styles.statusSection}>
          {isSyncing && <ActivityIndicator size="small" color="white" style={styles.spinner} />}
          <View style={styles.textContainer}>
            <Text style={styles.statusText}>{getStatusText()}</Text>
            {syncStatus.lastSync && (
              <Text style={styles.lastSyncText}>{getLastSyncText()}</Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  textContainer: {
    flex: 1,
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  lastSyncText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 2,
  },
});