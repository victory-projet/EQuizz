import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

/**
 * Menu principal pour les démos offline-first
 */
export default function OfflineDemoMenu() {
  const router = useRouter();

  const demoOptions = [
    {
      id: 'basic',
      title: '🔄 Démo Offline-First Basique',
      description: 'Fonctionnalités de base : sauvegarde, synchronisation, gestion des conflits',
      route: '/OfflineFirstExample',
      color: '#007AFF'
    },
    {
      id: 'optimized',
      title: '⚡ Démo Offline-First Optimisée',
      description: 'Fonctionnalités avancées : priorités, métriques, diagnostics intelligents',
      route: '/OptimizedOfflineExample',
      color: '#28A745'
    }
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🔄 Système Offline-First</Text>
        <Text style={styles.subtitle}>
          Testez les fonctionnalités de synchronisation offline/online
        </Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>💡 Comment tester :</Text>
          <Text style={styles.infoText}>
            • Activez/désactivez le WiFi pour simuler les changements de connexion{'\n'}
            • Sauvegardez des réponses hors ligne{'\n'}
            • Observez la synchronisation automatique au retour de connexion{'\n'}
            • Consultez les métriques de performance
          </Text>
        </View>

        {demoOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[styles.demoCard, { borderLeftColor: option.color }]}
            onPress={() => router.push(option.route as any)}
          >
            <Text style={styles.demoTitle}>{option.title}</Text>
            <Text style={styles.demoDescription}>{option.description}</Text>
            <View style={styles.demoFooter}>
              <Text style={[styles.demoButton, { color: option.color }]}>
                Tester →
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.featuresBox}>
          <Text style={styles.featuresTitle}>✨ Fonctionnalités implémentées :</Text>
          <View style={styles.featuresList}>
            <Text style={styles.featureItem}>✅ Stockage local persistant (SQLite)</Text>
            <Text style={styles.featureItem}>✅ Queue d&apos;opérations avec retry automatique</Text>
            <Text style={styles.featureItem}>✅ Synchronisation bidirectionnelle</Text>
            <Text style={styles.featureItem}>✅ Résolution automatique des conflits</Text>
            <Text style={styles.featureItem}>✅ Détection intelligente du réseau</Text>
            <Text style={styles.featureItem}>✅ Métriques de performance temps réel</Text>
            <Text style={styles.featureItem}>✅ Priorisation des opérations</Text>
            <Text style={styles.featureItem}>✅ Diagnostics avancés</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
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
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
    marginBottom: 24,
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
  },
  demoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  demoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  demoDescription: {
    fontSize: 14,
    color: '#6C757D',
    lineHeight: 20,
    marginBottom: 12,
  },
  demoFooter: {
    alignItems: 'flex-end',
  },
  demoButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  featuresBox: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginVertical: 24,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  featuresList: {
    gap: 6,
  },
  featureItem: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
  },
  backButton: {
    backgroundColor: '#6C757D',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});