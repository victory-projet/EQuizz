import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useQuizHistory } from '../../presentation/hooks/useQuizHistory';
import { useAuth } from '../../presentation/hooks/useAuth';
import { QuizHistoryEntry } from '../../domain/entities/QuizHistory';
import { QuizCardSkeletonList } from '../../presentation/components/QuizCardSkeleton.component';

// ─────────────────────────────────
// Utilitaires
// ─────────────────────────────────
const formatDate = (dateString: string) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatDateTime = (dateString: string) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ─────────────────────────────────
// Carte d'un quizz historique
// ─────────────────────────────────
interface HistoryCardProps {
  entry: QuizHistoryEntry;
  onPress: (entry: QuizHistoryEntry) => void;
}

function HistoryCard({ entry, onPress }: HistoryCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(entry)} activeOpacity={0.7}>
      {/* Badge sync */}
      <View style={styles.cardTopRow}>
        <View style={[
          styles.syncBadge,
          entry.synced ? styles.syncBadgeSynced : styles.syncBadgePending,
        ]}>
          <MaterialIcons
            name={entry.synced ? 'cloud-done' : 'cloud-upload'}
            size={12}
            color={entry.synced ? '#10B981' : '#F59E0B'}
          />
          <Text style={[
            styles.syncBadgeText,
            { color: entry.synced ? '#10B981' : '#F59E0B' },
          ]}>
            {entry.synced ? 'Synchronisé' : 'En attente'}
          </Text>
        </View>

        <Text style={styles.cardDate}>{formatDate(entry.completedAt)}</Text>
      </View>

      {/* Titre */}
      <Text style={styles.cardTitle} numberOfLines={2}>{entry.titre}</Text>

      {/* Cours */}
      {entry.coursNom && (
        <View style={styles.cardInfoRow}>
          <MaterialIcons name="menu-book" size={14} color="#6B7280" />
          <Text style={styles.cardInfoText}>{entry.coursNom}</Text>
        </View>
      )}

      {/* Établissement */}
      {entry.ecoleNom && (
        <View style={styles.cardInfoRow}>
          <MaterialIcons name="account-balance" size={14} color="#6B7280" />
          <Text style={styles.cardInfoText}>{entry.ecoleNom}</Text>
        </View>
      )}

      {/* Classe */}
      {entry.classeNom && (
        <View style={styles.cardInfoRow}>
          <MaterialIcons name="school" size={14} color="#6B7280" />
          <Text style={styles.cardInfoText}>{entry.classeNom}</Text>
        </View>
      )}

      {/* Pied de carte */}
      <View style={styles.cardFooter}>
        <View style={styles.cardStat}>
          <MaterialIcons name="quiz" size={14} color="#3A5689" />
          <Text style={styles.cardStatText}>
            {entry.nombreReponses} réponse{entry.nombreReponses > 1 ? 's' : ''}
            {entry.nombreQuestions ? ` / ${entry.nombreQuestions}` : ''}
          </Text>
        </View>

        <View style={styles.cardCompletedBadge}>
          <MaterialIcons name="check-circle" size={14} color="#10B981" />
          <Text style={styles.cardCompletedText}>Terminé</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────
// Modal détail d'une soumission
// ─────────────────────────────────
interface DetailModalProps {
  entry: QuizHistoryEntry;
  onClose: () => void;
}

function DetailModal({ entry, onClose }: DetailModalProps) {
  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle} numberOfLines={2}>{entry.titre}</Text>
          <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
            <MaterialIcons name="close" size={22} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
          <DetailRow icon="event" label="Soumis le" value={formatDateTime(entry.completedAt)} />
          {entry.coursNom && <DetailRow icon="menu-book" label="Cours" value={entry.coursNom} />}
          {entry.ecoleNom && <DetailRow icon="account-balance" label="Établissement" value={entry.ecoleNom} />}
          {entry.classeNom && <DetailRow icon="school" label="Classe" value={entry.classeNom} />}
          {entry.anneeScolaire && <DetailRow icon="calendar-today" label="Année scolaire" value={entry.anneeScolaire} />}
          <DetailRow
            icon="quiz"
            label="Réponses"
            value={`${entry.nombreReponses}${entry.nombreQuestions ? ` / ${entry.nombreQuestions} questions` : ' réponse(s)'}`}
          />
          <DetailRow
            icon={entry.synced ? 'cloud-done' : 'cloud-upload'}
            label="Synchronisation"
            value={entry.synced ? 'Synchronisé avec le serveur' : 'En attente de synchronisation'}
            valueColor={entry.synced ? '#10B981' : '#F59E0B'}
          />
        </ScrollView>

        <TouchableOpacity style={styles.modalCloseFullBtn} onPress={onClose}>
          <Text style={styles.modalCloseFullText}>Fermer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

interface DetailRowProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
  valueColor?: string;
}

function DetailRow({ icon, label, value, valueColor }: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailRowLeft}>
        <MaterialIcons name={icon} size={18} color="#3A5689" />
        <Text style={styles.detailLabel}>{label}</Text>
      </View>
      <Text style={[styles.detailValue, valueColor ? { color: valueColor } : null]}>
        {value}
      </Text>
    </View>
  );
}

// ─────────────────────────────────
// Écran principal
// ─────────────────────────────────
export default function HistoriqueScreen() {
  const { history, loading, error, reload } = useQuizHistory();
  const { utilisateur } = useAuth();

  const [search, setSearch] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<QuizHistoryEntry | null>(null);

  // Filtrage par recherche
  const filtered = useMemo(() => {
    if (!search.trim()) return history;
    const q = search.toLowerCase();
    return history.filter(
      (e) =>
        e.titre.toLowerCase().includes(q) ||
        e.coursNom?.toLowerCase().includes(q) ||
        e.ecoleNom?.toLowerCase().includes(q) ||
        e.classeNom?.toLowerCase().includes(q)
    );
  }, [history, search]);

  // Grouper par année scolaire ou par année civile
  const grouped = useMemo(() => {
    const groups: Record<string, QuizHistoryEntry[]> = {};
    for (const entry of filtered) {
      const label = entry.anneeScolaire
        ? entry.anneeScolaire
        : new Date(entry.completedAt).getFullYear().toString();
      if (!groups[label]) groups[label] = [];
      groups[label].push(entry);
    }
    // Trier les groupes du plus récent au plus ancien
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  const pendingCount = history.filter((e) => !e.synced).length;

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>📋 Historique</Text>
          {utilisateur && (
            <Text style={styles.headerSubtitle}>
              {utilisateur.prenom} {utilisateur.nom}
            </Text>
          )}
        </View>
        {history.length > 0 && (
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{history.length}</Text>
          </View>
        )}
      </View>

      {/* Bannière soumissions en attente */}
      {pendingCount > 0 && (
        <View style={styles.pendingBanner}>
          <MaterialIcons name="cloud-upload" size={16} color="#92400E" />
          <Text style={styles.pendingBannerText}>
            {pendingCount} soumission{pendingCount > 1 ? 's' : ''} en attente de synchronisation
          </Text>
        </View>
      )}

      {/* Barre de recherche */}
      {history.length > 0 && (
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un quizz, cours, établissement…"
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
            clearButtonMode="while-editing"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <MaterialIcons name="cancel" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Contenu */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} />}
      >
        {loading && history.length === 0 ? (
          <QuizCardSkeletonList count={4} />
        ) : error ? (
          <View style={styles.centerContainer}>
            <MaterialIcons name="error-outline" size={64} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={reload}>
              <Text style={styles.retryButtonText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        ) : history.length === 0 ? (
          <View style={styles.centerContainer}>
            <MaterialIcons name="history" size={72} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>Aucun historique</Text>
            <Text style={styles.emptySubtitle}>
              Les quizz que vous soumettez apparaîtront ici,{'\n'}
              même après un changement d&apos;établissement.
            </Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.centerContainer}>
            <MaterialIcons name="search-off" size={56} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>Aucun résultat</Text>
            <Text style={styles.emptySubtitle}>Aucun quizz ne correspond à votre recherche.</Text>
          </View>
        ) : (
          grouped.map(([year, entries]) => (
            <View key={year} style={styles.group}>
              <View style={styles.groupHeader}>
                <Text style={styles.groupTitle}>{year}</Text>
                <Text style={styles.groupCount}>
                  {entries.length} quiz{entries.length > 1 ? 'z' : ''}
                </Text>
              </View>
              {entries.map((entry) => (
                <HistoryCard
                  key={entry.id}
                  entry={entry}
                  onPress={setSelectedEntry}
                />
              ))}
            </View>
          ))
        )}

        {/* Note sur la portabilité inter-établissements */}
        {history.length > 0 && (
          <View style={styles.infoNote}>
            <MaterialIcons name="info-outline" size={16} color="#6B7280" />
            <Text style={styles.infoNoteText}>
              Cet historique inclut tous les quizz soumis, quel que soit votre établissement.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Modal détail */}
      {selectedEntry && (
        <DetailModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
        />
      )}
    </SafeAreaView>
  );
}

// ─────────────────────────────────
// Styles
// ─────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#3A5689',
    paddingHorizontal: 20,
    paddingTop: 70,
    paddingBottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#C7D2FE',
  },
  headerBadge: {
    backgroundColor: '#FFFFFF22',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  headerBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  pendingBanner: {
    backgroundColor: '#FEF3C7',
    borderBottomWidth: 1,
    borderBottomColor: '#FCD34D',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  pendingBannerText: {
    color: '#92400E',
    fontSize: 13,
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchIcon: {
    marginRight: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  // Groupes par année
  group: {
    marginBottom: 20,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  groupTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
  },
  groupCount: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  // Carte
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    gap: 4,
  },
  syncBadgeSynced: {
    backgroundColor: '#D1FAE5',
  },
  syncBadgePending: {
    backgroundColor: '#FEF3C7',
  },
  syncBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 22,
  },
  cardInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  cardInfoText: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  cardStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  cardStatText: {
    fontSize: 13,
    color: '#3A5689',
    fontWeight: '500',
  },
  cardCompletedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardCompletedText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  // États vides / erreur
  centerContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
  },
  errorText: {
    fontSize: 15,
    color: '#DC2626',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3A5689',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  // Note info
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 12,
    gap: 8,
    marginTop: 4,
  },
  infoNoteText: {
    flex: 1,
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
  // Modal détail
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '75%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginRight: 12,
    lineHeight: 24,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  detailRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
    maxWidth: '55%',
    textAlign: 'right',
  },
  modalCloseFullBtn: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: '#3A5689',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCloseFullText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
