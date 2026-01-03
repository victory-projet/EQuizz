// mobile-student/src/app/(tabs)/notifications.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNotifications } from '../../presentation/hooks/useNotifications';
import { NotificationPreferences } from '../../core/services/push-notification.service';
import { COLORS, STORAGE_KEYS } from '../../core/constants';
import * as SecureStore from 'expo-secure-store';

const NotificationSettingsScreen: React.FC = () => {
  const router = useRouter();
  const {
    isInitialized,
    isEnabled,
    preferences,
    loading,
    error,
    initialize,
    updatePreferences,
    testNotification,
    unregister,
  } = useNotifications();

  const [localPreferences, setLocalPreferences] = useState(preferences);

  React.useEffect(() => {
    setLocalPreferences(preferences);
  }, [preferences]);

  /**
   * Active les notifications push
   */
  const handleEnableNotifications = async () => {
    try {
      const success = await initialize();
      if (!success) {
        Alert.alert(
          'Erreur',
          'Impossible d\'activer les notifications. Vérifiez les permissions dans les paramètres de votre appareil.',
          [{ text: 'OK' }]
        );
      }
    } catch (err) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'activation des notifications.');
    }
  };

  /**
   * Désactive les notifications push
   */
  const handleDisableNotifications = async () => {
    Alert.alert(
      'Désactiver les notifications',
      'Êtes-vous sûr de vouloir désactiver toutes les notifications push ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Désactiver',
          style: 'destructive',
          onPress: async () => {
            try {
              await unregister();
            } catch (err) {
              Alert.alert('Erreur', 'Une erreur est survenue lors de la désactivation.');
            }
          },
        },
      ]
    );
  };

  /**
   * Met à jour une préférence
   */
  const handlePreferenceChange = async (key: keyof NotificationPreferences, value: any) => {
    if (!localPreferences) return;

    const newPreferences = { ...localPreferences, [key]: value };
    setLocalPreferences(newPreferences);

    try {
      await updatePreferences({ [key]: value });
    } catch (err) {
      // Revenir à l'ancienne valeur en cas d'erreur
      setLocalPreferences(localPreferences);
      Alert.alert('Erreur', 'Impossible de sauvegarder les préférences.');
    }
  };

  /**
   * Teste une notification
   */
  const handleTestNotification = async () => {
    try {
      await testNotification('Test EQuizz', 'Ceci est une notification de test !');
      Alert.alert('Test envoyé', 'Une notification de test a été envoyée.');
    } catch (err) {
      Alert.alert('Erreur', 'Impossible d\'envoyer la notification de test.');
    }
  };

  /**
   * Affiche les logs de debug
   */
  const handleShowDebugLogs = async () => {
    try {
      const debugLog = await SecureStore.getItemAsync('PUSH_DEBUG_LOG');
      const pushToken = await SecureStore.getItemAsync(STORAGE_KEYS.PUSH_TOKEN);
      
      const logData = debugLog ? JSON.parse(debugLog) : null;
      
      Alert.alert(
        'Debug Push Notifications',
        `Token stocké: ${pushToken ? pushToken.substring(0, 20) + '...' : 'Aucun'}\n\n` +
        `Dernier log:\n${logData ? JSON.stringify(logData, null, 2) : 'Aucun log'}`
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de lire les logs de debug');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Statut des notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statut</Text>
          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <Ionicons 
                name={isEnabled ? "notifications" : "notifications-off"} 
                size={24} 
                color={isEnabled ? COLORS.success : COLORS.error} 
              />
              <View style={styles.statusText}>
                <Text style={styles.statusTitle}>
                  {isEnabled ? 'Notifications activées' : 'Notifications désactivées'}
                </Text>
                <Text style={styles.statusSubtitle}>
                  {isEnabled 
                    ? 'Vous recevrez des notifications push' 
                    : 'Activez pour recevoir des notifications'
                  }
                </Text>
              </View>
            </View>
            
            {!isEnabled && (
              <TouchableOpacity 
                style={styles.enableButton} 
                onPress={handleEnableNotifications}
              >
                <Text style={styles.enableButtonText}>Activer</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Préférences de notification */}
        {isEnabled && isInitialized && localPreferences && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Types de notifications</Text>
              
              <View style={styles.preferenceItem}>
                <View style={styles.preferenceText}>
                  <Text style={styles.preferenceTitle}>Nouvelles évaluations</Text>
                  <Text style={styles.preferenceSubtitle}>
                    Quand une nouvelle évaluation est disponible
                  </Text>
                </View>
                <Switch
                  value={localPreferences.nouvelleEvaluation}
                  onValueChange={(value) => handlePreferenceChange('nouvelleEvaluation', value)}
                  trackColor={{ false: '#767577', true: COLORS.primaryLight }}
                  thumbColor={localPreferences.nouvelleEvaluation ? COLORS.primary : '#f4f3f4'}
                />
              </View>

              <View style={styles.preferenceItem}>
                <View style={styles.preferenceText}>
                  <Text style={styles.preferenceTitle}>Rappels d'évaluation</Text>
                  <Text style={styles.preferenceSubtitle}>
                    Rappels avant la fermeture d'une évaluation
                  </Text>
                </View>
                <Switch
                  value={localPreferences.rappelEvaluation}
                  onValueChange={(value) => handlePreferenceChange('rappelEvaluation', value)}
                  trackColor={{ false: '#767577', true: COLORS.primaryLight }}
                  thumbColor={localPreferences.rappelEvaluation ? COLORS.primary : '#f4f3f4'}
                />
              </View>

              <View style={styles.preferenceItem}>
                <View style={styles.preferenceText}>
                  <Text style={styles.preferenceTitle}>Évaluations fermées</Text>
                  <Text style={styles.preferenceSubtitle}>
                    Quand une évaluation se ferme
                  </Text>
                </View>
                <Switch
                  value={localPreferences.evaluationFermee}
                  onValueChange={(value) => handlePreferenceChange('evaluationFermee', value)}
                  trackColor={{ false: '#767577', true: COLORS.primaryLight }}
                  thumbColor={localPreferences.evaluationFermee ? COLORS.primary : '#f4f3f4'}
                />
              </View>

              <View style={styles.preferenceItem}>
                <View style={styles.preferenceText}>
                  <Text style={styles.preferenceTitle}>Résultats disponibles</Text>
                  <Text style={styles.preferenceSubtitle}>
                    Quand les résultats sont publiés
                  </Text>
                </View>
                <Switch
                  value={localPreferences.resultatsDisponibles}
                  onValueChange={(value) => handlePreferenceChange('resultatsDisponibles', value)}
                  trackColor={{ false: '#767577', true: COLORS.primaryLight }}
                  thumbColor={localPreferences.resultatsDisponibles ? COLORS.primary : '#f4f3f4'}
                />
              </View>

              <View style={styles.preferenceItem}>
                <View style={styles.preferenceText}>
                  <Text style={styles.preferenceTitle}>Confirmations de soumission</Text>
                  <Text style={styles.preferenceSubtitle}>
                    Confirmation après soumission d'un quiz
                  </Text>
                </View>
                <Switch
                  value={localPreferences.confirmationSoumission}
                  onValueChange={(value) => handlePreferenceChange('confirmationSoumission', value)}
                  trackColor={{ false: '#767577', true: COLORS.primaryLight }}
                  thumbColor={localPreferences.confirmationSoumission ? COLORS.primary : '#f4f3f4'}
                />
              </View>

              <View style={styles.preferenceItem}>
                <View style={styles.preferenceText}>
                  <Text style={styles.preferenceTitle}>Notifications de sécurité</Text>
                  <Text style={styles.preferenceSubtitle}>
                    Changements de mot de passe, etc.
                  </Text>
                </View>
                <Switch
                  value={localPreferences.securite}
                  onValueChange={(value) => handlePreferenceChange('securite', value)}
                  trackColor={{ false: '#767577', true: COLORS.primaryLight }}
                  thumbColor={localPreferences.securite ? COLORS.primary : '#f4f3f4'}
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Canaux de notification</Text>
              
              <View style={styles.preferenceItem}>
                <View style={styles.preferenceText}>
                  <Text style={styles.preferenceTitle}>Notifications push</Text>
                  <Text style={styles.preferenceSubtitle}>
                    Notifications sur votre appareil
                  </Text>
                </View>
                <Switch
                  value={localPreferences.pushNotifications}
                  onValueChange={(value) => handlePreferenceChange('pushNotifications', value)}
                  trackColor={{ false: '#767577', true: COLORS.primaryLight }}
                  thumbColor={localPreferences.pushNotifications ? COLORS.primary : '#f4f3f4'}
                />
              </View>

              <View style={styles.preferenceItem}>
                <View style={styles.preferenceText}>
                  <Text style={styles.preferenceTitle}>Notifications par email</Text>
                  <Text style={styles.preferenceSubtitle}>
                    Notifications dans votre boîte mail
                  </Text>
                </View>
                <Switch
                  value={localPreferences.emailNotifications}
                  onValueChange={(value) => handlePreferenceChange('emailNotifications', value)}
                  trackColor={{ false: '#767577', true: COLORS.primaryLight }}
                  thumbColor={localPreferences.emailNotifications ? COLORS.primary : '#f4f3f4'}
                />
              </View>
            </View>

            {/* Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Actions</Text>
              <TouchableOpacity 
                style={[styles.actionButton, styles.dangerButton]} 
                onPress={handleDisableNotifications}
              >
                <Ionicons name="notifications-off" size={20} color={COLORS.error} />
                <Text style={[styles.actionButtonText, styles.dangerText]}>
                  Désactiver toutes les notifications
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="warning" size={20} color={COLORS.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.textLight,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 15,
  },
  statusCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 15,
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  statusSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 2,
  },
  enableButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 15,
    alignItems: 'center',
  },
  enableButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  preferenceText: {
    flex: 1,
    marginRight: 15,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  preferenceSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.primary,
    marginLeft: 10,
  },
  dangerButton: {
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  dangerText: {
    color: COLORS.error,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    borderRadius: 8,
    padding: 15,
    marginTop: 20,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.error,
    marginLeft: 10,
    flex: 1,
  },
});

export default NotificationSettingsScreen;