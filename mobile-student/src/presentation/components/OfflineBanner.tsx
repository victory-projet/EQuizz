import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface OfflineBannerProps {
  isOnline: boolean;
  pendingCount?: number;
  isSyncing?: boolean;
  onSyncPress?: () => void;
}

/**
 * Bannière d'état offline/online.
 *
 * - Offline sans soumissions en attente → bandeau rouge simple
 * - Offline avec soumissions en attente → bandeau orange + compteur
 * - Online avec soumissions en attente  → bandeau bleu "synchro en cours" ou bouton "Synchroniser"
 * - Online sans soumissions             → rien (null)
 */
export function OfflineBanner({
  isOnline,
  pendingCount = 0,
  isSyncing = false,
  onSyncPress,
}: OfflineBannerProps) {
  // En ligne et rien en attente → pas de bannière
  if (isOnline && pendingCount === 0) return null;

  // En ligne mais des soumissions attendent d'être envoyées
  if (isOnline && pendingCount > 0) {
    return (
      <View style={[styles.banner, styles.bannerPending]}>
        <MaterialIcons name="cloud-upload" size={16} color="#FFFFFF" />
        {isSyncing ? (
          <>
            <ActivityIndicator size="small" color="#FFFFFF" style={styles.spinner} />
            <Text style={styles.text}>Envoi des réponses en cours...</Text>
          </>
        ) : (
          <>
            <Text style={styles.text}>
              {pendingCount} réponse{pendingCount > 1 ? 's' : ''} en attente d&apos;envoi
            </Text>
            {onSyncPress && (
              <TouchableOpacity onPress={onSyncPress} style={styles.syncBtn}>
                <Text style={styles.syncBtnText}>Envoyer</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    );
  }

  // Hors ligne
  return (
    <View style={[styles.banner, pendingCount > 0 ? styles.bannerOfflinePending : styles.bannerOffline]}>
      <MaterialIcons name="wifi-off" size={16} color="#FFFFFF" />
      <Text style={styles.text}>
        {pendingCount > 0
          ? `Hors ligne · ${pendingCount} réponse${pendingCount > 1 ? 's' : ''} sera${pendingCount > 1 ? 'ont' : ''} envoyée${pendingCount > 1 ? 's' : ''} à la reconnexion`
          : 'Hors ligne · Mode consultation uniquement'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  bannerOffline: {
    backgroundColor: '#DC2626', // rouge
  },
  bannerOfflinePending: {
    backgroundColor: '#D97706', // orange
  },
  bannerPending: {
    backgroundColor: '#2563EB', // bleu
  },
  text: {
    flex: 1,
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  spinner: {
    marginLeft: 4,
  },
  syncBtn: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  syncBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
