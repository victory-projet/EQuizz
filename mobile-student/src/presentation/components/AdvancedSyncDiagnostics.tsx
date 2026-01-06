import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { useOptimizedOfflineFirst, usePerformanceMetrics } from '../hooks/useOptimizedOfflineFirst';

/**
 * Composant de diagnostic avancé pour la synchronisation
 * Affiche des métriques détaillées et des outils de diagnostic
 */
export function AdvancedSyncDiagnostics() {
  const { 
    syncStatus, 
    getAdvancedStats, 
    testConnectivity, 
    cleanupMetrics, 
    exportDiagnostics 
  } = useOptimizedOfflineFirst();
  
  const [showModal, setShowModal] = useState(false);
  const [advancedStats, setAdvancedStats] = useState<any>(null);
  const [connectivityTest, setConnectivityTest] = useState<{
    testing: boolean;
    result: boolean | null;
    duration: number | null;
  }>({
    testing: false,
    result: null,
    duration: null
  });

  // Charger les stats au montage et périodiquement
  useEffect(() => {
    loadAdvancedStats();
    const interval = setInterval(loadAdvancedStats, 30000); // 30 secondes
    return () => clearInterval(interval);
  }, []);

  const loadAdvancedStats = async () => {
    try {
      const stats = getAdvancedStats();
      setAdvancedStats(stats);
    } catch (error) {
      console.error('Erreur chargement stats avancées:', error);
    }
  };

  const handleConnectivityTest = async () => {
    setConnectivityTest({ testing: true, result: null, duration: null });
    
    const startTime = Date.now();
    try {
      const result = await testConnectivity(10000); // 10 secondes timeout
      const duration = Date.now() - startTime;
      
      setConnectivityTest({
        testing: false,
        result,
        duration
      });
    } catch (error) {
      setConnectivityTest({
        testing: false,
        result: false,
        duration: Date.now() - startTime
      });
    }
  };

  const handleCleanupMetrics = async () => {
    Alert.alert(
      'Nettoyer les métriques',
      'Supprimer les métriques de plus de 7 jours ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Nettoyer',
          onPress: async () => {
            try {
              const result = await cleanupMetrics();
              if (result.success) {
                Alert.alert('Succès', 'Métriques nettoyées');
                loadAdvancedStats();
              } else {
                Alert.alert('Erreur', result.error || 'Erreur lors du nettoyage');
              }
            } catch (error: any) {
              Alert.alert('Erreur', error.message);
            }
          }
        }
      ]
    );
  };

  const handleExportDiagnostics = async () => {
    try {
      const diagnostics = exportDiagnostics();
      
      // En production, on pourrait envoyer ces données à un service de diagnostic
      // ou les sauvegarder localement pour support technique
      console.log('📊 Diagnostics exportés:', diagnostics);
      
      Alert.alert(
        'Diagnostics exportés',
        'Les données de diagnostic ont été exportées dans la console. En production, elles seraient envoyées au support technique.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return '#27AE60';
      case 'good': return '#4ECDC4';
      case 'poor': return '#FFE66D';
      case 'offline': return '#E74C3C';
      default: return '#6C757D';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return '#E74C3C';
      case 'medium': return '#FF8C42';
      case 'low': return '#FFE66D';
      default: return '#6C757D';
    }
  };

  return (
    <>
      <TouchableOpacity style={styles.diagnosticButton} onPress={() => setShowModal(true)}>
        <Text style={styles.diagnosticButtonText}>🔧 Diagnostics avancés</Text>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Diagnostics de synchronisation</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.closeButton}>Fermer</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Statut réseau avancé */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📡 Réseau</Text>
              
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Qualité:</Text>
                <View style={styles.qualityBadge}>
                  <View style={[
                    styles.qualityIndicator, 
                    { backgroundColor: getQualityColor(syncStatus.networkQuality) }
                  ]} />
                  <Text style={styles.statValue}>{syncStatus.networkQuality}</Text>
                </View>
              </View>
              
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Stabilité:</Text>
                <Text style={[styles.statValue, { 
                  color: syncStatus.isNetworkStable ? '#27AE60' : '#E74C3C' 
                }]}>
                  {syncStatus.isNetworkStable ? 'Stable' : 'Instable'}
                </Text>
              </View>
              
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Intervalle adaptatif:</Text>
                <Text style={styles.statValue}>
                  {(syncStatus.adaptiveInterval / 1000).toFixed(1)}s
                </Text>
              </View>

              {/* Test de connectivité */}
              <View style={styles.actionRow}>
                <TouchableOpacity 
                  style={[styles.actionButton, connectivityTest.testing && styles.actionButtonDisabled]}
                  onPress={handleConnectivityTest}
                  disabled={connectivityTest.testing}
                >
                  <Text style={styles.actionButtonText}>
                    {connectivityTest.testing ? '🔄 Test en cours...' : '🌐 Tester la connectivité'}
                  </Text>
                </TouchableOpacity>
                
                {connectivityTest.result !== null && (
                  <View style={styles.testResult}>
                    <Text style={[styles.testResultText, {
                      color: connectivityTest.result ? '#27AE60' : '#E74C3C'
                    }]}>
                      {connectivityTest.result ? '✅ Connecté' : '❌ Échec'}
                      {connectivityTest.duration && ` (${connectivityTest.duration}ms)`}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Statistiques de synchronisation */}
            {advancedStats?.sync && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🔄 Synchronisation</Text>
                
                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{advancedStats.sync.totalOperations}</Text>
                    <Text style={styles.statLabel}>Total</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: '#27AE60' }]}>
                      {advancedStats.sync.successfulOperations}
                    </Text>
                    <Text style={styles.statLabel}>Succès</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: '#E74C3C' }]}>
                      {advancedStats.sync.failedOperations}
                    </Text>
                    <Text style={styles.statLabel}>Échecs</Text>
                  </View>
                </View>

                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Taux de succès:</Text>
                  <Text style={[styles.statValue, {
                    color: advancedStats.sync.successRate > 90 ? '#27AE60' : 
                           advancedStats.sync.successRate > 70 ? '#FFE66D' : '#E74C3C'
                  }]}>
                    {advancedStats.sync.successRate.toFixed(1)}%
                  </Text>
                </View>

                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Durée moyenne:</Text>
                  <Text style={styles.statValue}>
                    {(advancedStats.sync.averageDuration / 1000).toFixed(2)}s
                  </Text>
                </View>

                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Fréquence:</Text>
                  <Text style={styles.statValue}>
                    {advancedStats.sync.syncFrequency.toFixed(1)} op/h
                  </Text>
                </View>
              </View>
            )}

            {/* Anomalies détectées */}
            {advancedStats?.anomalies && advancedStats.anomalies.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>⚠️ Anomalies détectées</Text>
                {advancedStats.anomalies.map((anomaly: any, index: number) => (
                  <View key={index} style={styles.anomalyItem}>
                    <View style={styles.anomalyHeader}>
                      <Text style={[styles.anomalyType, {
                        color: getSeverityColor(anomaly.severity)
                      }]}>
                        {anomaly.type.replace(/_/g, ' ').toUpperCase()}
                      </Text>
                      <Text style={styles.anomalySeverity}>
                        {anomaly.severity.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.anomalyDescription}>
                      {anomaly.description}
                    </Text>
                    <Text style={styles.anomalyTime}>
                      {new Date(anomaly.timestamp).toLocaleString()}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Erreurs fréquentes */}
            {advancedStats?.topErrors && advancedStats.topErrors.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>❌ Erreurs fréquentes</Text>
                {advancedStats.topErrors.slice(0, 5).map((error: any, index: number) => (
                  <View key={index} style={styles.errorItem}>
                    <View style={styles.errorHeader}>
                      <Text style={styles.errorCount}>{error.count}x</Text>
                      <Text style={styles.errorTime}>
                        {new Date(error.lastOccurrence).toLocaleString()}
                      </Text>
                    </View>
                    <Text style={styles.errorMessage} numberOfLines={2}>
                      {error.error}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Synchronisation par entité */}
            {advancedStats?.syncByEntity && Object.keys(advancedStats.syncByEntity).length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📊 Sync par entité</Text>
                {Object.entries(advancedStats.syncByEntity).map(([entity, stats]: [string, any]) => (
                  <View key={entity} style={styles.entityItem}>
                    <Text style={styles.entityName}>{entity}</Text>
                    <View style={styles.entityStats}>
                      <Text style={styles.entityStat}>
                        {stats.totalOperations} ops
                      </Text>
                      <Text style={[styles.entityStat, {
                        color: stats.successRate > 90 ? '#27AE60' : '#E74C3C'
                      }]}>
                        {stats.successRate.toFixed(1)}%
                      </Text>
                      <Text style={styles.entityStat}>
                        {(stats.averageDuration / 1000).toFixed(1)}s
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Actions de maintenance */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🛠️ Maintenance</Text>
              
              <TouchableOpacity style={styles.actionButton} onPress={loadAdvancedStats}>
                <Text style={styles.actionButtonText}>🔄 Actualiser les stats</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton} onPress={handleCleanupMetrics}>
                <Text style={styles.actionButtonText}>🧹 Nettoyer les métriques</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton} onPress={handleExportDiagnostics}>
                <Text style={styles.actionButtonText}>📤 Exporter diagnostics</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  diagnosticButton: {
    backgroundColor: '#6C757D',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginVertical: 8,
  },
  diagnosticButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  qualityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qualityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  actionRow: {
    marginTop: 12,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  actionButtonDisabled: {
    backgroundColor: '#ADB5BD',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  testResult: {
    marginTop: 8,
    alignItems: 'center',
  },
  testResultText: {
    fontSize: 14,
    fontWeight: '500',
  },
  anomalyItem: {
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF8C42',
  },
  anomalyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  anomalyType: {
    fontSize: 12,
    fontWeight: '600',
  },
  anomalySeverity: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6C757D',
  },
  anomalyDescription: {
    fontSize: 14,
    color: '#2C3E50',
    marginBottom: 4,
  },
  anomalyTime: {
    fontSize: 12,
    color: '#6C757D',
  },
  errorItem: {
    backgroundColor: '#F8D7DA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#E74C3C',
  },
  errorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  errorCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E74C3C',
  },
  errorTime: {
    fontSize: 10,
    color: '#6C757D',
  },
  errorMessage: {
    fontSize: 12,
    color: '#2C3E50',
  },
  entityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  entityName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C3E50',
    flex: 1,
  },
  entityStats: {
    flexDirection: 'row',
    gap: 12,
  },
  entityStat: {
    fontSize: 12,
    color: '#6C757D',
  },
});