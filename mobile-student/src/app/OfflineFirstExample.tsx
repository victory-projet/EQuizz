import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useOfflineFirst, useOfflineStatus } from '../presentation/hooks/useOfflineFirst';
import { SyncStatusBanner } from '../presentation/components/SyncStatusBanner';

/**
 * Exemple d'utilisation du système offline-first
 * Démontre les fonctionnalités principales et les bonnes pratiques
 */
export default function OfflineFirstExample() {
  const {
    isInitialized,
    initError,
    syncStatus,
    saveAnswer,
    getAnswers,
    submitQuiz,
    forceSync,
    retryFailedOperations,
    getDetailedStats
  } = useOfflineFirst();

  const [demoQuizId] = useState('demo-quiz-123');
  const [demoUserId] = useState('user-456');
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [savedAnswers, setSavedAnswers] = useState<Record<string, string>>({});
  const [stats, setStats] = useState<any>(null);

  // Charger les réponses sauvegardées au démarrage
  useEffect(() => {
    if (isInitialized) {
      loadSavedAnswers();
      loadStats();
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

  const loadStats = async () => {
    try {
      const detailedStats = await getDetailedStats();
      setStats(detailedStats);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  };

  const handleSaveAnswer = async () => {
    if (!currentAnswer.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir une réponse');
      return;
    }

    try {
      const questionId = `question-${Date.now()}`;
      const result = await saveAnswer(questionId, demoQuizId, demoUserId, currentAnswer);
      
      if (result.success) {
        Alert.alert('Succès', 'Réponse sauvegardée localement');
        setCurrentAnswer('');
        loadSavedAnswers();
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
        Alert.alert('Succès', 'Quiz soumis ! Il sera synchronisé automatiquement.');
        setSavedAnswers({});
        loadStats();
      } else {
        Alert.alert('Erreur', result.error || 'Erreur lors de la soumission');
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    }
  };

  const handleForceSync = async () => {
    try {
      const result = await forceSync();
      if (result.success) {
        Alert.alert('Succès', 'Synchronisation terminée');
        loadStats();
      } else {
        Alert.alert('Erreur', result.error || 'Erreur de synchronisation');
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    }
  };

  const handleRetryFailed = async () => {
    try {
      const result = await retryFailedOperations();
      if (result.success) {
        Alert.alert('Succès', 'Opérations relancées');
        loadStats();
      } else {
        Alert.alert('Erreur', result.error || 'Erreur lors du retry');
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    }
  };

  if (!isInitialized) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Initialisation...</Text>
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
        <Text style={styles.title}>🔄 Démo Offline-First</Text>
        
        {/* Statut de connexion */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📡 Statut de connexion</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>État:</Text>
            <Text style={[styles.statusValue, { 
              color: syncStatus.isOnline ? '#27AE60' : '#E74C3C' 
            }]}>
              {syncStatus.isOnline ? '🟢 En ligne' : '🔴 Hors ligne'}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Synchronisation:</Text>
            <Text style={styles.statusValue}>
              {syncStatus.isSyncing ? '🔄 En cours...' : '⏸️ Inactive'}
            </Text>
          </View>
          {syncStatus.lastSync && (
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Dernière sync:</Text>
              <Text style={styles.statusValue}>
                {new Date(syncStatus.lastSync).toLocaleString()}
              </Text>
            </View>
          )}
        </View>

        {/* Simulation de réponses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✏️ Simulation de réponses</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Tapez votre réponse..."
            value={currentAnswer}
            onChangeText={setCurrentAnswer}
            multiline
          />
          <TouchableOpacity style={styles.button} onPress={handleSaveAnswer}>
            <Text style={styles.buttonText}>💾 Sauvegarder réponse</Text>
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
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmitQuiz}>
              <Text style={styles.buttonText}>🚀 Soumettre le quiz</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Statistiques */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Statistiques de synchronisation</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{syncStatus.pendingOperations}</Text>
              <Text style={styles.statusLabel}>En attente</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#E74C3C' }]}>
                {syncStatus.failedOperations}
              </Text>
              <Text style={styles.statusLabel}>Échecs</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#FF8C42' }]}>
                {syncStatus.conflicts}
              </Text>
              <Text style={styles.statusLabel}>Conflits</Text>
            </View>
          </View>
        </View>

        {/* Actions de synchronisation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Actions de synchronisation</Text>
          
          <TouchableOpacity 
            style={[styles.button, !syncStatus.isOnline && styles.buttonDisabled]} 
            onPress={handleForceSync}
            disabled={!syncStatus.isOnline || syncStatus.isSyncing}
          >
            <Text style={styles.buttonText}>🔄 Forcer la synchronisation</Text>
          </TouchableOpacity>
          
          {syncStatus.failedOperations > 0 && (
            <TouchableOpacity style={styles.button} onPress={handleRetryFailed}>
              <Text style={styles.buttonText}>🔁 Réessayer les échecs</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.button} onPress={loadStats}>
            <Text style={styles.buttonText}>📊 Actualiser les stats</Text>
          </TouchableOpacity>
        </View>

        {/* Détails techniques (dev) */}
        {__DEV__ && stats && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔧 Détails techniques (DEV)</Text>
            <ScrollView style={styles.jsonContainer} horizontal>
              <Text style={styles.jsonText}>
                {JSON.stringify(stats, null, 2)}
              </Text>
            </ScrollView>
          </View>
        )}
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
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  statusLabel: {
    fontSize: 14,
    color: '#6C757D',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C3E50',
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
  submitButton: {
    backgroundColor: '#28A745',
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
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  jsonContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    maxHeight: 200,
  },
  jsonText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#6C757D',
  },
  error: {
    color: '#E74C3C',
    textAlign: 'center',
    marginTop: 10,
  },
});