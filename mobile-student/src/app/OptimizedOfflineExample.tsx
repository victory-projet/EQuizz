import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useOptimizedOfflineFirst, useOptimizedOfflineStatus } from '../presentation/hooks/useOptimizedOfflineFirst';
import { SyncStatusBanner } from '../presentation/components/SyncStatusBanner';
import { AdvancedSyncDiagnostics } from '../presentation/components/AdvancedSyncDiagnostics';

/**
 * Exemple d'utilisation du système offline-first optimisé
 * Démontre les nouvelles fonctionnalités avancées
 */
export default function OptimizedOfflineExample() {
  const {
    isInitialized,
    initError,
    syncStatus,
    saveAnswer,
    getAnswers,
    submitQuiz,
    forceOptimizedSync,
    getPerformanceMetrics,
    testConnectivity
  } = useOptimizedOfflineFirst();

  const [demoQuizId] = useState('optimized-quiz-123');
  const [demoUserId] = useState('user-456');
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL'>('NORMAL');
  const [savedAnswers, setSavedAnswers] = useState<Record<string, string>>({});
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);

  // Charger les données au démarrage
  useEffect(() => {
    if (isInitialized) {
      loadSavedAnswers();
      loadPerformanceMetrics();
    }
  }, [isInitialized]);

  // Mise à jour périodique des métriques
  useEffect(() => {
    if (isInitialized) {
      const interval = setInterval(loadPerformanceMetrics, 10000); // 10 secondes
      return () => clearInterval(interval);
    }
  }, [isInitialized]);

  const loadSavedAnswers = async () => {
    try {
      const answers = await getAnswers(demoQuizId, demoUserId);
      setSavedAnswers(answers);
    } catch (error) {
      console.error('Erreur chargement réponses:', error);
    }
  };

  const loadPerformanceMetrics = async () => {
    try {
      const metrics = getPerformanceMetrics();
      setPerformanceMetrics(metrics);
    } catch (error) {
      console.error('Erreur chargement métriques:', error);
    }
  };

  const handleSaveAnswer = async () => {
    if (!currentAnswer.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir une réponse');
      return;
    }

    try {
      const questionId = `question-${Date.now()}`;
      const result = await saveAnswer(questionId, demoQuizId, demoUserId, currentAnswer, selectedPriority);
      
      if (result.success) {
        Alert.alert('Succès', `Réponse sauvegardée avec priorité ${selectedPriority}`);
        setCurrentAnswer('');
        loadSavedAnswers();
        loadPerformanceMetrics();
      } else {
        Alert.alert('Erreur', result.error || 'Erreur lors de la sauvegarde');
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    }
  };

  const handleSubmitQuiz = async () => {
    if (Object.keys(savedAnswers).length === 0) {
      Alert.alert('Erreur', 'Aucune réponse à soumettre');
      return;
    }

    try {
      const responses = Object.entries(savedAnswers).map(([questionId, content]) => ({
        questionId,
        content
      }));

      const result = await submitQuiz(demoQuizId, 'eval-123', demoUserId, responses);
      
      if (result.success) {
        Alert.alert(
          'Succès', 
          `Quiz soumis avec priorité CRITIQUE !\nOpération ID: ${result.operationId}`
        );
        setSavedAnswers({});
        loadPerformanceMetrics();
      } else {
        Alert.alert('Erreur', result.error || 'Erreur lors de la soumission');
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    }
  };

  const handleForceSync = async () => {
    try {
      const result = await forceOptimizedSync();
      if (result.success) {
        Alert.alert('Succès', 'Synchronisation optimisée terminée');
        loadPerformanceMetrics();
      } else {
        Alert.alert('Erreur', result.error || 'Erreur de synchronisation');
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    }
  };

  const handleConnectivityTest = async () => {
    try {
      const startTime = Date.now();
      const result = await testConnectivity(5000);
      const duration = Date.now() - startTime;
      
      Alert.alert(
        'Test de connectivité',
        `Résultat: ${result ? 'Connecté' : 'Échec'}\nDurée: ${duration}ms`
      );
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return '#E74C3C';
      case 'HIGH': return '#FF8C42';
      case 'NORMAL': return '#007AFF';
      case 'LOW': return '#6C757D';
      default: return '#007AFF';
    }
  };

  const getQualityEmoji = (quality: string) => {
    switch (quality) {
      case 'excellent': return '🟢';
      case 'good': return '🔵';
      case 'poor': return '🟡';
      case 'offline': return '🔴';
      default: return '⚪';
    }
  };

  if (!isInitialized) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Initialisation du système optimisé...</Text>
        {initError && (
          <Text style={styles.error}>Erreur: {initError}</Text>
        )}
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Bannière de statut */}
      <SyncStatusBanner />

      <View style={styles.content}>
        <Text style={styles.title}>⚡ Démo Offline-First Optimisé</Text>
        
        {/* Statut réseau optimisé */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📡 Statut réseau optimisé</Text>
          
          <View style={styles.networkStatus}>
            <View style={styles.networkItem}>
              <Text style={styles.networkLabel}>État:</Text>
              <Text style={[styles.networkValue, { 
                color: syncStatus.isOnline ? '#27AE60' : '#E74C3C' 
              }]}>
                {syncStatus.isOnline ? '🟢 En ligne' : '🔴 Hors ligne'}
              </Text>
            </View>
            
            <View style={styles.networkItem}>
              <Text style={styles.networkLabel}>Qualité:</Text>
              <Text style={styles.networkValue}>
                {getQualityEmoji(syncStatus.networkQuality)} {syncStatus.networkQuality}
              </Text>
            </View>
            
            <View style={styles.networkItem}>
              <Text style={styles.networkLabel}>Stabilité:</Text>
              <Text style={[styles.networkValue, {
                color: syncStatus.isNetworkStable ? '#27AE60' : '#E74C3C'
              }]}>
                {syncStatus.isNetworkStable ? '✅ Stable' : '⚠️ Instable'}
              </Text>
            </View>
            
            <View style={styles.networkItem}>
              <Text style={styles.networkLabel}>Intervalle adaptatif:</Text>
              <Text style={styles.networkValue}>
                {(syncStatus.adaptiveInterval / 1000).toFixed(1)}s
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.testButton} onPress={handleConnectivityTest}>
            <Text style={styles.testButtonText}>🌐 Tester la connectivité</Text>
          </TouchableOpacity>
        </View>

        {/* Simulation de réponses avec priorité */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✏️ Simulation avec priorités</Text>
          
          {/* Sélecteur de priorité */}
          <Text style={styles.priorityLabel}>Priorité de la réponse:</Text>
          <View style={styles.prioritySelector}>
            {(['LOW', 'NORMAL', 'HIGH', 'CRITICAL'] as const).map((priority) => (
              <TouchableOpacity
                key={priority}
                style={[
                  styles.priorityButton,
                  selectedPriority === priority && styles.priorityButtonSelected,
                  { borderColor: getPriorityColor(priority) }
                ]}
                onPress={() => setSelectedPriority(priority)}
              >
                <Text style={[
                  styles.priorityButtonText,
                  selectedPriority === priority && { color: getPriorityColor(priority) }
                ]}>
                  {priority}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TextInput
            style={styles.textInput}
            placeholder="Tapez votre réponse..."
            value={currentAnswer}
            onChangeText={setCurrentAnswer}
            multiline
          />
          
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: getPriorityColor(selectedPriority) }]} 
            onPress={handleSaveAnswer}
          >
            <Text style={styles.buttonText}>
              💾 Sauvegarder ({selectedPriority})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Réponses sauvegardées */}
        {Object.keys(savedAnswers).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Réponses sauvegardées</Text>
            {Object.entries(savedAnswers).map(([questionId, content]) => (
              <View key={questionId} style={styles.answerItem}>
                <Text style={styles.answerQuestion}>{questionId}:</Text>
                <Text style={styles.answerContent}>{content}</Text>
              </View>
            ))}
            <TouchableOpacity style={styles.criticalButton} onPress={handleSubmitQuiz}>
              <Text style={styles.buttonText}>🚀 Soumettre (CRITIQUE)</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Métriques de performance */}
        {performanceMetrics && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Métriques de performance</Text>
            
            {performanceMetrics.syncStats && (
              <View style={styles.metricsGrid}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricNumber}>
                    {performanceMetrics.syncStats.totalOperations}
                  </Text>
                  <Text style={styles.metricLabel}>Opérations</Text>
                </View>
                
                <View style={styles.metricItem}>
                  <Text style={[styles.metricNumber, { color: '#27AE60' }]}>
                    {performanceMetrics.syncStats.successRate?.toFixed(1) || 0}%
                  </Text>
                  <Text style={styles.metricLabel}>Succès</Text>
                </View>
                
                <View style={styles.metricItem}>
                  <Text style={[styles.metricNumber, { color: '#4ECDC4' }]}>
                    {(performanceMetrics.syncStats.averageDuration / 1000)?.toFixed(1) || 0}s
                  </Text>
                  <Text style={styles.metricLabel}>Durée moy.</Text>
                </View>
                
                <View style={styles.metricItem}>
                  <Text style={[styles.metricNumber, { color: '#FF8C42' }]}>
                    {performanceMetrics.syncStats.syncFrequency?.toFixed(1) || 0}
                  </Text>
                  <Text style={styles.metricLabel}>Op/h</Text>
                </View>
              </View>
            )}

            {performanceMetrics.anomalies && performanceMetrics.anomalies.length > 0 && (
              <View style={styles.anomaliesContainer}>
                <Text style={styles.anomaliesTitle}>⚠️ Anomalies détectées:</Text>
                {performanceMetrics.anomalies.map((anomaly: any, index: number) => (
                  <Text key={index} style={styles.anomalyText}>
                    • {anomaly.description} ({anomaly.severity})
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Actions de synchronisation optimisées */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Actions optimisées</Text>
          
          <TouchableOpacity 
            style={[styles.button, !syncStatus.isOnline && styles.buttonDisabled]} 
            onPress={handleForceSync}
            disabled={!syncStatus.isOnline || syncStatus.isSyncing}
          >
            <Text style={styles.buttonText}>
              {syncStatus.isSyncing ? '🔄 Sync en cours...' : '⚡ Sync optimisée'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.button} onPress={loadPerformanceMetrics}>
            <Text style={styles.buttonText}>📊 Actualiser métriques</Text>
          </TouchableOpacity>
        </View>

        {/* Diagnostics avancés */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔧 Diagnostics</Text>
          <AdvancedSyncDiagnostics />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 20,
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
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  networkStatus: {
    marginBottom: 12,
  },
  networkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  networkLabel: {
    fontSize: 14,
    color: '#6C757D',
  },
  networkValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C3E50',
  },
  testButton: {
    backgroundColor: '#6C757D',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  priorityLabel: {
    fontSize: 14,
    color: '#2C3E50',
    marginBottom: 8,
    fontWeight: '500',
  },
  prioritySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priorityButton: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    marginHorizontal: 2,
    backgroundColor: '#FFFFFF',
  },
  priorityButtonSelected: {
    backgroundColor: '#F8F9FA',
  },
  priorityButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6C757D',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#DEE2E6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonDisabled: {
    backgroundColor: '#ADB5BD',
  },
  criticalButton: {
    backgroundColor: '#E74C3C',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  answerItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  answerQuestion: {
    fontSize: 12,
    color: '#6C757D',
    marginBottom: 4,
  },
  answerContent: {
    fontSize: 14,
    color: '#2C3E50',
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  metricLabel: {
    fontSize: 12,
    color: '#6C757D',
    textAlign: 'center',
  },
  anomaliesContainer: {
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  anomaliesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8,
  },
  anomalyText: {
    fontSize: 12,
    color: '#856404',
    marginBottom: 4,
  },
  error: {
    color: '#E74C3C',
    textAlign: 'center',
    marginTop: 10,
  },
});