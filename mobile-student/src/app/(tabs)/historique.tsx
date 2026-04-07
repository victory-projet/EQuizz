import React, { useState, useMemo } from 'react';
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
import { useQuizzHistory } from '../../presentation/hooks/useQuizzHistory';
import { useAuth } from '../../presentation/hooks/useAuth';
import { QuizzHistory } from '../../domain/entities/QuizzHistory';

// Palette de couleurs pour différencier les établissements
const ETABLISSEMENT_COLORS = [
    { bg: '#DBEAFE', text: '#1D4ED8', border: '#93C5FD' },
    { bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7' },
    { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' },
    { bg: '#FCE7F3', text: '#9D174D', border: '#F9A8D4' },
    { bg: '#EDE9FE', text: '#5B21B6', border: '#C4B5FD' },
    { bg: '#FFE4E6', text: '#9F1239', border: '#FCA5A5' },
];

function getEtablissementColor(id: string | undefined, allIds: string[]) {
    if (!id) return ETABLISSEMENT_COLORS[0];
    const index = allIds.indexOf(id) % ETABLISSEMENT_COLORS.length;
    return ETABLISSEMENT_COLORS[index >= 0 ? index : 0];
}

function formatDate(dateStr?: string | null): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
}

function ScoreBadge({ score, scoreMax }: { score?: number | null; scoreMax?: number | null }) {
    if (score === undefined || score === null) return null;
    const max = scoreMax ?? 20;
    const pct = Math.round((score / max) * 100);
    const color = pct >= 70 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#EF4444';
    const bg = pct >= 70 ? '#D1FAE5' : pct >= 50 ? '#FEF3C7' : '#FEE2E2';
    return (
        <View style={[styles.scoreBadge, { backgroundColor: bg }]}>
            <Text style={[styles.scoreBadgeText, { color }]}>
                {score}/{max}
            </Text>
        </View>
    );
}

function HistoryCard({
    item,
    etablissementColor,
}: {
    item: QuizzHistory;
    etablissementColor: { bg: string; text: string; border: string };
}) {
    const coursNom = item.Cours?.nom ?? item.Cour?.nom ?? 'Cours inconnu';
    const etablissementNom = item.Etablissement?.nom ?? 'Établissement inconnu';
    const datePassage = item.dateFinSession ?? item.dateFin;

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                    {item.titre}
                </Text>
                <ScoreBadge score={item.score} scoreMax={item.scoreMax} />
            </View>

            <Text style={styles.cardCours}>{coursNom}</Text>

            <View style={styles.cardFooter}>
                <View
                    style={[
                        styles.etablissementBadge,
                        {
                            backgroundColor: etablissementColor.bg,
                            borderColor: etablissementColor.border,
                        },
                    ]}
                >
                    <MaterialIcons
                        name="school"
                        size={12}
                        color={etablissementColor.text}
                        style={{ marginRight: 4 }}
                    />
                    <Text
                        style={[styles.etablissementText, { color: etablissementColor.text }]}
                        numberOfLines={1}
                    >
                        {etablissementNom}
                    </Text>
                </View>

                <View style={styles.dateRow}>
                    <MaterialIcons name="check-circle" size={14} color="#9CA3AF" />
                    <Text style={styles.dateText}>{formatDate(datePassage)}</Text>
                </View>
            </View>
        </View>
    );
}

export default function HistoriqueScreen() {
    const { history, loading, error, reload } = useQuizzHistory();
    const { utilisateur } = useAuth();

    const [search, setSearch] = useState('');
    const [selectedEtablissementId, setSelectedEtablissementId] = useState<string | null>(null);

    // Extraire la liste unique des établissements
    const etablissements = useMemo(() => {
        const map = new Map<string, string>();
        history.forEach((q) => {
            if (q.Etablissement?.id) {
                map.set(q.Etablissement.id, q.Etablissement.nom);
            }
        });
        return Array.from(map.entries()).map(([id, nom]) => ({ id, nom }));
    }, [history]);

    const etablissementIds = useMemo(
        () => etablissements.map((e) => e.id),
        [etablissements]
    );

    // Filtrer l'historique selon la recherche et l'établissement sélectionné
    const filtered = useMemo(() => {
        let result = history;
        if (selectedEtablissementId) {
            result = result.filter(
                (q) => q.Etablissement?.id === selectedEtablissementId
            );
        }
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                (item) =>
                    item.titre.toLowerCase().includes(q) ||
                    (item.Cours?.nom ?? item.Cour?.nom ?? '').toLowerCase().includes(q) ||
                    (item.Etablissement?.nom ?? '').toLowerCase().includes(q)
            );
        }
        return result;
    }, [history, selectedEtablissementId, search]);

    // Grouper par année
    const grouped = useMemo(() => {
        const map = new Map<string, QuizzHistory[]>();
        filtered.forEach((item) => {
            const date = item.dateFinSession ?? item.dateFin;
            const year = date ? new Date(date).getFullYear().toString() : 'Inconnu';
            if (!map.has(year)) map.set(year, []);
            map.get(year)!.push(item);
        });
        // Trier les années de la plus récente à la plus ancienne
        return Array.from(map.entries()).sort((a, b) => {
            if (a[0] === 'Inconnu') return 1;
            if (b[0] === 'Inconnu') return -1;
            return parseInt(b[0]) - parseInt(a[0]);
        });
    }, [filtered]);

    return (
        <SafeAreaView style={styles.container} edges={[]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>📚 Mon Historique</Text>
                {utilisateur && (
                    <Text style={styles.headerSubtitle}>
                        {history.length} quizz terminé{history.length !== 1 ? 's' : ''}
                    </Text>
                )}
            </View>

            {/* Barre de recherche */}
            <View style={styles.searchContainer}>
                <MaterialIcons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Rechercher un quizz, cours, établissement..."
                    placeholderTextColor="#9CA3AF"
                    value={search}
                    onChangeText={setSearch}
                    clearButtonMode="while-editing"
                />
            </View>

            {/* Filtres par établissement */}
            {etablissements.length > 1 && (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filterScroll}
                    contentContainerStyle={styles.filterContent}
                >
                    <TouchableOpacity
                        style={[
                            styles.filterChip,
                            selectedEtablissementId === null && styles.filterChipActive,
                        ]}
                        onPress={() => setSelectedEtablissementId(null)}
                    >
                        <Text
                            style={[
                                styles.filterChipText,
                                selectedEtablissementId === null && styles.filterChipTextActive,
                            ]}
                        >
                            Tous
                        </Text>
                    </TouchableOpacity>
                    {etablissements.map((etab) => {
                        const color = getEtablissementColor(etab.id, etablissementIds);
                        const isActive = selectedEtablissementId === etab.id;
                        return (
                            <TouchableOpacity
                                key={etab.id}
                                style={[
                                    styles.filterChip,
                                    isActive && {
                                        backgroundColor: color.bg,
                                        borderColor: color.border,
                                    },
                                ]}
                                onPress={() =>
                                    setSelectedEtablissementId(
                                        isActive ? null : etab.id
                                    )
                                }
                            >
                                <MaterialIcons
                                    name="school"
                                    size={13}
                                    color={isActive ? color.text : '#6B7280'}
                                    style={{ marginRight: 4 }}
                                />
                                <Text
                                    style={[
                                        styles.filterChipText,
                                        isActive && { color: color.text, fontWeight: '600' },
                                    ]}
                                    numberOfLines={1}
                                >
                                    {etab.nom}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            )}

            {/* Contenu principal */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={reload} />
                }
            >
                {loading && history.length === 0 ? (
                    <View style={styles.loadingContainer}>
                        {[1, 2, 3].map((i) => (
                            <View key={i} style={styles.skeletonCard}>
                                <View style={styles.skeletonTitle} />
                                <View style={styles.skeletonSubtitle} />
                                <View style={styles.skeletonFooter} />
                            </View>
                        ))}
                    </View>
                ) : error ? (
                    <View style={styles.centeredContainer}>
                        <MaterialIcons name="error-outline" size={64} color="#DC2626" />
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity style={styles.retryButton} onPress={reload}>
                            <MaterialIcons name="refresh" size={18} color="#FFFFFF" />
                            <Text style={styles.retryText}>Réessayer</Text>
                        </TouchableOpacity>
                    </View>
                ) : filtered.length === 0 ? (
                    <View style={styles.centeredContainer}>
                        <MaterialIcons name="history" size={64} color="#D1D5DB" />
                        <Text style={styles.emptyTitle}>
                            {history.length === 0
                                ? 'Aucun quizz terminé'
                                : 'Aucun résultat'}
                        </Text>
                        <Text style={styles.emptySubtitle}>
                            {history.length === 0
                                ? 'Votre historique apparaîtra ici une fois que vous aurez complété des quizz.'
                                : 'Essayez de modifier vos critères de recherche.'}
                        </Text>
                    </View>
                ) : (
                    <>
                        {/* Note informative */}
                        {etablissements.length > 1 && (
                            <View style={styles.infoBanner}>
                                <MaterialIcons name="info-outline" size={16} color="#3A5689" />
                                <Text style={styles.infoText}>
                                    Votre historique inclut tous vos quizz, même ceux passés dans d&apos;anciens établissements.
                                </Text>
                            </View>
                        )}

                        {/* Groupes par année */}
                        {grouped.map(([year, items]) => (
                            <View key={year} style={styles.yearGroup}>
                                <View style={styles.yearHeader}>
                                    <View style={styles.yearLine} />
                                    <Text style={styles.yearLabel}>{year}</Text>
                                    <View style={styles.yearLine} />
                                </View>
                                {items.map((item) => (
                                    <HistoryCard
                                        key={item.id}
                                        item={item}
                                        etablissementColor={getEtablissementColor(
                                            item.Etablissement?.id,
                                            etablissementIds
                                        )}
                                    />
                                ))}
                            </View>
                        ))}

                        <Text style={styles.footerNote}>
                            {filtered.length} quizz affiché{filtered.length !== 1 ? 's' : ''}
                        </Text>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        backgroundColor: '#3A5689',
        paddingHorizontal: 16,
        paddingVertical: 16,
        height: 120,
        paddingTop: 75,
        justifyContent: 'flex-end',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 2,
    },
    headerSubtitle: {
        fontSize: 13,
        color: '#C7D2FE',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        paddingHorizontal: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#111827',
        paddingVertical: 12,
    },
    filterScroll: {
        maxHeight: 48,
        marginBottom: 4,
    },
    filterContent: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        gap: 8,
        flexDirection: 'row',
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginRight: 6,
    },
    filterChipActive: {
        backgroundColor: '#EEF2FF',
        borderColor: '#3A5689',
    },
    filterChipText: {
        fontSize: 13,
        color: '#6B7280',
    },
    filterChipTextActive: {
        color: '#3A5689',
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 32,
    },
    infoBanner: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#EEF2FF',
        borderRadius: 10,
        padding: 12,
        marginBottom: 16,
        gap: 8,
        borderWidth: 1,
        borderColor: '#C7D2FE',
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: '#3A5689',
        lineHeight: 18,
    },
    yearGroup: {
        marginBottom: 8,
    },
    yearHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        marginTop: 4,
    },
    yearLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E7EB',
    },
    yearLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#9CA3AF',
        marginHorizontal: 10,
        letterSpacing: 1,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 6,
        gap: 8,
    },
    cardTitle: {
        flex: 1,
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
        lineHeight: 20,
    },
    cardCours: {
        fontSize: 13,
        color: '#6B7280',
        marginBottom: 12,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
    },
    etablissementBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        borderWidth: 1,
        maxWidth: '60%',
    },
    etablissementText: {
        fontSize: 12,
        fontWeight: '600',
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    dateText: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    scoreBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    scoreBadgeText: {
        fontSize: 13,
        fontWeight: '700',
    },
    centeredContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        paddingHorizontal: 32,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
        marginTop: 16,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 8,
        textAlign: 'center',
        lineHeight: 20,
    },
    errorText: {
        fontSize: 15,
        color: '#DC2626',
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 20,
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3A5689',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        gap: 6,
    },
    retryText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    },
    loadingContainer: {
        gap: 12,
    },
    skeletonCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 4,
    },
    skeletonTitle: {
        height: 16,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        marginBottom: 10,
        width: '75%',
    },
    skeletonSubtitle: {
        height: 12,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        marginBottom: 14,
        width: '45%',
    },
    skeletonFooter: {
        height: 24,
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
        width: '55%',
    },
    footerNote: {
        textAlign: 'center',
        fontSize: 12,
        color: '#D1D5DB',
        marginTop: 8,
    },
});
