import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native';
import { useOfflineFirst, useOfflineStatus } from '../hooks/useOfflineFirst';

/**
 * Bannière d'état de synchronisation améliorée
 * Affiche l'état de connexion, les informations de synchronisation et gère les conflits
 */
export function SyncStatusBanner() {
  const { syncStatus, forceSync, retryFailedOperations, getPendingConflicts, resolveConflict, getDetailedStats } = useOfflineFirst();
  const [showDetails, setShowDetails] = useState(false);
  const [detailedStats, setDetailedStats] = useState<any>(null);

  // Ne pas afficher si tout va bien et en ligne
  if (syncStatus.isOnline && !syncStatus.isSyncing && 
      syncStatus.pendingOperations === 0 && syncStatus.failedOperations === 0 && 
      syncStatus.conflicts === 0) {
    return null;
  }

  const getStatusText = () => {
    if (!syncStatus.isOnline) {
      return 'Mode hors ligne';
    }
    
    if (syncStatus.isSyncing) {
      return 'Synchronisation en cours...';
    }
    
    if (syncStatus.conflicts > 0) {
      return `${syncStatus.conflicts} conflit(s) détecté(s)`;
    }
    
    if (syncStatus.failedOperations > 0) {
      return `${syncStatus.failedOperations} élément(s) en échec`;
    }
    
    if (syncStatus.pendingOperations > 0) {
      return `${syncStatus.pendingOperations} élément(s) en attente`;
    }
    
    return 'Synchronisé';
  };

  const getStatusColor = () => {
    if (!syncStatus.isOnline) return '#FF6B6B'; // Rouge pour offline
    if (syncStatus.isSyncing) return '#4ECDC4'; // Bleu pour sync en cours
    if (syncStatus.conflicts > 0) return '#FF8C42'; // Orange pour conflits
    if (syncStatus.failedOperations > 0) return '#FFE66D'; // Jaune pour échecs
    if (syncStatus.pendingOperations > 0) return '#A8E6CF'; // Vert clair pour en attente
    return '#4ECDC4'; // Bleu pour synchronisé
  };

  const getStatusIcon = () => {
    if (!syncStatus.isOnline) return '📵';
    if (syncStatus.isSyncing) return '🔄';
    if (syncStatus.conflicts > 0) return '⚠️';
    if (syncStatus.failedOperations > 0) return '❌';
    if (syncStatus.pendingOperations > 0) return '⏳';
    return '✅';
  };

  const handleShowDetails = async () => {
    const stats = await getDetailedStats();
    setDetailedStats(stats);
    setShowDetails(true);
  };

  const handleForceSync = async () => {
    if (!syncStatus.isOnline) {
      Alert.alert('Hors ligne', 'Impossible de synchroniser sans connexion internet');
      return;
    }

    try {
      await forceSync();
      Alert.alert('Succès', 'Synchronisation terminée');
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Erreur lors de la synchronisation');
    }
  };

  const handleRetryFailed = async () => {
    try {
      await retryFailedOperations();
      Alert.alert('Succès', 'Opérations relancées');
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Erreur lors du retry');
    }
  };

  const handleResolveConflicts = () => {
    const conflicts = getPendingConflicts();
    if (conflicts.length === 0) {
      Alert.alert('Info', 'Aucun conflit en attente');
      return;
    }

    // Pour l'instant, résolution automatique avec stratégie serveur
    Alert.alert(
      'Conflits détectés',
      `${conflicts.length} conflit(s) détecté(s). Résoudre automatiquement en faveur du serveur ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Résoudre',
          onPress: async () => {
            try {
              for (const conflict of conflicts) {
                await resolveConflict(`${conflict.entity}:${conflict.entityId}`, conflict.serverData);
              }
              Alert.alert('Succès', 'Conflits résolus');
            } catch (error: any) {
              Alert.alert('Erreur', error.message || 'Erreur lors de la résolution');
            }
          }
        }
      ]
    );
  };

  return (
    <>
      <View style={[styles.banner, { backgroundColor: getStatusColor() }]}>
        <View style={styles.content}>
          <View style={styles.statusRow}>
            <Text style={styles.statusIcon}>{getStatusIcon()}</Text>
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>
          
          {!syncStatus.isOnline && (
            <Text style={styles.subText}>
              Vos données seront synchronisées dès le retour de la connexion
            </Text>
          )}
          
          {syncStatus.lastSync && (
            <Text style={styles.lastSyncText}>
              Dernière sync: {new Date(syncStatus.lastSync).toLocaleTimeString()}
            </Text>
          )}
        </View>
        
        <View style={styles.actions}>
          {(syncStatus.pendingOperations > 0 || syncStatus.failedOperations > 0 || syncStatus.conflicts > 0) && (
            <TouchableOpacity style={styles.actionButton} onPress={handleShowDetails}>
              <Text style={styles.actionButtonText}>Détails</Text>
            </TouchableOpacity>
          )}
          
          {syncStatus.isOnline && !syncStatus.isSyncing && (
            <TouchableOpacity style={styles.actionButton} onPress={handleForceSync}>
              <Text style={styles.actionButtonText}>Sync</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Modal de détails */}
      <Modal
        visible={showDetails}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetails(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>État de synchronisation</Text>
            <TouchableOpacity onPress={() => setShowDetails(false)}>
              <Text style={styles.closeButton}>Fermer</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {/* Statut général */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Statut général</Text>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Connexion:</Text>
                <Text style={[styles.statValue, { color: syncStatus.isOnline ? '#4ECDC4' : '#FF6B6B' }]}>
                  {syncStatus.isOnline ? 'En ligne' : 'Hors ligne'}
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Synchronisation:</Text>
                <Text style={styles.statValue}>
                  {syncStatus.isSyncing ? 'En cours...' : 'Inactive'}
                </Text>
              </View>
              {syncStatus.lastSync && (
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Dernière sync:</Text>
                  <Text style={styles.statValue}>
                    {new Date(syncStatus.lastSync).toLocaleString()}
                  </Text>
                </View>
              )}
            </View>

            {/* Opérations */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Opérations</Text>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>En attente:</Text>
                <Text style={[styles.statValue, { color: syncStatus.pendingOperations > 0 ? '#FFE66D' : '#4ECDC4' }]}>
                  {syncStatus.pendingOperations}
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Échouées:</Text>
                <Text style={[styles.statValue, { color: syncStatus.failedOperations > 0 ? '#FF6B6B' : '#4ECDC4' }]}>
                  {syncStatus.failedOperations}
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Conflits:</Text>
                <Text style={[styles.statValue, { color: syncStatus.conflicts > 0 ? '#FF8C42' : '#4ECDC4' }]}>
                  {syncStatus.conflicts}
                </Text>
              </View>
            </View>

            {/* Statistiques détaillées */}
            {detailedStats && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Détails techniques</Text>
                <Text style={styles.jsonText}>
                  {JSON.stringify(detailedStats, null, 2)}
                </Text>
              </View>
            )}

            {/* Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Actions</Text>
              
              {syncStatus.isOnline && !syncStatus.isSyncing && (
                <TouchableOpacity style={styles.modalActionButton} onPress={handleForceSync}>
                  <Text style={styles.modalActionButtonText}>🔄 Forcer la synchronisation</Text>
                </TouchableOpacity>
              )}
              
              {syncStatus.failedOperations > 0 && (
                <TouchableOpacity style={styles.modalActionButton} onPress={handleRetryFailed}>
                  <Text style={styles.modalActionButtonText}>🔁 Réessayer les échecs</Text>
                </TouchableOpacity>
              )}
              
              {syncStatus.conflicts > 0 && (
                <TouchableOpacity style={styles.modalActionButton} onPress={handleResolveConflicts}>
                  <Text style={styles.modalActionButtonText}>⚠️ Résoudre les conflits</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

/**
 * Indicateur simple de statut offline
 */
export function OfflineIndicator() {
  const { isOnline, hasPendingData } = useOfflineStatus();

  if (isOnline && !hasPendingData) {
    return null;
  }

  return (
    <View style={styles.offlineIndicator}>
      <Text style={styles.offlineText}>
        {!isOnline ? '📵 Hors ligne' : '⏳ Données en attente'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  statusIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  subText: {
    fontSize: 12,
    color: '#34495E',
    opacity: 0.8,
    marginTop: 2,
  },
  lastSyncText: {
    fontSize: 11,
    color: '#34495E',
    opacity: 0.6,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2C3E50',
  },
  
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  closeButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6C757D',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C3E50',
  },
  jsonText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#6C757D',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
  },
  modalActionButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  modalActionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Offline indicator
  offlineIndicator: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  offlineText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});