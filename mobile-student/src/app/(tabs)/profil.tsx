import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useAuth } from '../../presentation/hooks/useAuth';
import { useQuizHistory } from '../../presentation/hooks/useQuizHistory';
import { QuizHistoryEntry } from '../../domain/entities/QuizHistory';

// ─────────────────────────────────────────────
// Utilitaires
// ─────────────────────────────────────────────
const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

// ─────────────────────────────────────────────
// Composant : mini-carte historique
// ─────────────────────────────────────────────
function HistoryMiniCard({ entry }: { entry: QuizHistoryEntry }) {
    return (
        <View style={styles.historyCard}>
            <View style={styles.historyCardLeft}>
                <View style={[
                    styles.historyIconCircle,
                    { backgroundColor: entry.synced ? '#D1FAE5' : '#FEF3C7' },
                ]}>
                    <MaterialIcons
                        name={entry.synced ? 'check-circle' : 'cloud-upload'}
                        size={18}
                        color={entry.synced ? '#10B981' : '#F59E0B'}
                    />
                </View>
            </View>

            <View style={styles.historyCardCenter}>
                <Text style={styles.historyCardTitle} numberOfLines={1}>
                    {entry.titre}
                </Text>
                {entry.coursNom ? (
                    <Text style={styles.historyCardSub} numberOfLines={1}>
                        {entry.coursNom}
                    </Text>
                ) : null}
                {entry.ecoleNom ? (
                    <Text style={styles.historyCardSchool} numberOfLines={1}>
                        🏫 {entry.ecoleNom}
                    </Text>
                ) : null}
            </View>

            <View style={styles.historyCardRight}>
                <Text style={styles.historyCardDate}>{formatDate(entry.completedAt)}</Text>
                <Text style={styles.historyCardRep}>
                    {entry.nombreReponses} rép.
                </Text>
            </View>
        </View>
    );
}

// ─────────────────────────────────────────────
// Composant : tuile statistique
// ─────────────────────────────────────────────
interface StatTileProps {
    icon: keyof typeof MaterialIcons.glyphMap;
    value: string | number;
    label: string;
    color: string;
    bg: string;
}

function StatTile({ icon, value, label, color, bg }: StatTileProps) {
    return (
        <View style={[styles.statTile, { backgroundColor: bg }]}>
            <View style={[styles.statIconCircle, { backgroundColor: color + '22' }]}>
                <MaterialIcons name={icon} size={20} color={color} />
            </View>
            <Text style={[styles.statValue, { color }]}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

// ─────────────────────────────────────────────
// Écran principal
// ─────────────────────────────────────────────
export default function Profil() {
    const { utilisateur, logout } = useAuth();
    const { history, loading: histLoading } = useQuizHistory();
    const [avatarUri, setAvatarUri] = useState<string | null>(utilisateur?.avatar || null);

    // Statistiques calculées
    const totalSoumis   = history.length;
    const synced        = history.filter((e) => e.synced).length;
    const enAttente     = totalSoumis - synced;
    const recentHistory = history.slice(0, 3);

    const handleLogout = async () => {
        Alert.alert(
            'Déconnexion',
            'Êtes-vous sûr de vouloir vous déconnecter ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Se déconnecter',
                    onPress: async () => await logout(),
                    style: 'destructive',
                },
            ]
        );
    };

    const handleChangeAvatar = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                Alert.alert('Permission requise', 'Vous devez autoriser l\'accès à la galerie.');
                return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });
            if (!result.canceled && result.assets[0]) {
                setAvatarUri(result.assets[0].uri);
                Alert.alert('Succès', 'Photo de profil mise à jour localement');
            }
        } catch {
            Alert.alert('Erreur', 'Impossible de sélectionner l\'image');
        }
    };

    const getInitials = () => {
        if (!utilisateur?.nom || !utilisateur?.prenom) return 'U';
        return `${utilisateur.prenom[0]}${utilisateur.nom[0]}`.toUpperCase();
    };

    if (!utilisateur) {
        return (
            <SafeAreaView style={styles.container} edges={[]}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Aucun utilisateur connecté</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={[]}>
            {/* ── Header ── */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Mon Profil</Text>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutIconButton}>
                    <MaterialIcons name="logout" size={24} color="#DC2626" />
                </TouchableOpacity>
            </View>

            {/* ── Avatar ── */}
            <View style={styles.avatarSection}>
                <TouchableOpacity
                    style={styles.avatarContainer}
                    onPress={handleChangeAvatar}
                    activeOpacity={0.8}
                >
                    {avatarUri ? (
                        <Image source={{ uri: avatarUri }} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarInitials}>{getInitials()}</Text>
                        </View>
                    )}
                    <View style={styles.cameraIconContainer}>
                        <MaterialIcons name="camera-alt" size={20} color="#FFFFFF" />
                    </View>
                </TouchableOpacity>
            </View>

            {/* ── Carte identité ── */}
            <View style={styles.infoCard}>
                <Text style={styles.fullName}>
                    {utilisateur.prenom} {utilisateur.nom}
                </Text>
                <Text style={styles.classInfo}>
                    {(utilisateur as any).classe?.nom || utilisateur.Classe?.nom}
                </Text>
                <Text style={styles.schoolInfo}>
                    {(utilisateur as any).ecole?.nom || utilisateur.Ecole?.nom}
                </Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                {/* ── Statistiques quizz ── */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>📊 Statistiques</Text>
                    <View style={styles.statsRow}>
                        <StatTile
                            icon="quiz"
                            value={histLoading ? '…' : totalSoumis}
                            label="Soumis"
                            color="#3A5689"
                            bg="#EEF2FF"
                        />
                        <StatTile
                            icon="cloud-done"
                            value={histLoading ? '…' : synced}
                            label="Synchronisés"
                            color="#10B981"
                            bg="#ECFDF5"
                        />
                        <StatTile
                            icon="cloud-upload"
                            value={histLoading ? '…' : enAttente}
                            label="En attente"
                            color={enAttente > 0 ? '#F59E0B' : '#9CA3AF'}
                            bg={enAttente > 0 ? '#FFFBEB' : '#F9FAFB'}
                        />
                    </View>
                </View>

                {/* ── Historique récent ── */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>📋 Historique récent</Text>
                        {totalSoumis > 0 && (
                            <TouchableOpacity
                                onPress={() => router.push('./(tabs)/historique')}
                                style={styles.voirToutBtn}
                            >
                                <Text style={styles.voirToutText}>Voir tout</Text>
                                <MaterialIcons name="arrow-forward" size={15} color="#3A5689" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {histLoading ? (
                        <View style={styles.historyLoadingBox}>
                            <Text style={styles.historyLoadingText}>Chargement…</Text>
                        </View>
                    ) : recentHistory.length === 0 ? (
                        <View style={styles.historyEmptyBox}>
                            <MaterialIcons name="history" size={36} color="#D1D5DB" />
                            <Text style={styles.historyEmptyText}>
                                Aucun quizz soumis pour le moment.
                            </Text>
                        </View>
                    ) : (
                        <>
                            {recentHistory.map((entry) => (
                                <HistoryMiniCard key={entry.id} entry={entry} />
                            ))}
                            {totalSoumis > 3 && (
                                <TouchableOpacity
                                    style={styles.voirToutFullBtn}
                                    onPress={() => router.push('./(tabs)/historique')}
                                >
                                    <Text style={styles.voirToutFullText}>
                                        Voir les {totalSoumis - 3} autres quizz
                                    </Text>
                                    <MaterialIcons name="arrow-forward" size={16} color="#3A5689" />
                                </TouchableOpacity>
                            )}
                        </>
                    )}
                </View>

                {/* ── Informations personnelles ── */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>👤 Informations personnelles</Text>
                    <View style={styles.formSection}>
                        <FormField label="Nom & Prénom" value={`${utilisateur.nom} ${utilisateur.prenom}`} />
                        {utilisateur.email && <FormField label="Email" value={utilisateur.email} />}
                        <View style={styles.formField}>
                            <Text style={styles.fieldLabel}>Mot de passe</Text>
                            <View style={styles.fieldValue}>
                                <View style={styles.passwordRow}>
                                    <Text style={styles.passwordDots}>••••••••••••••••</Text>
                                    <MaterialIcons name="visibility-off" size={20} color="#9CA3AF" />
                                </View>
                            </View>
                        </View>
                        {utilisateur.matricule && <FormField label="Matricule" value={utilisateur.matricule} />}
                        {utilisateur.anneeScolaire && <FormField label="Année Académique" value={utilisateur.anneeScolaire} />}
                        {((utilisateur as any).classe?.niveau || utilisateur.Classe?.Niveau?.nom) && (
                            <FormField
                                label="Niveau"
                                value={(utilisateur as any).classe?.niveau || utilisateur.Classe?.Niveau?.nom}
                            />
                        )}
                        {((utilisateur as any).classe?.nom || utilisateur.Classe?.nom) && (
                            <FormField
                                label="Classe"
                                value={(utilisateur as any).classe?.nom || utilisateur.Classe?.nom}
                            />
                        )}
                    </View>
                </View>

                <View style={styles.bottomSpacing} />
            </ScrollView>
        </SafeAreaView>
    );
}

// ─────────────────────────────────────────────
// Composant interne : champ formulaire
// ─────────────────────────────────────────────
function FormField({ label, value }: { label: string; value: string }) {
    return (
        <View style={styles.formField}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <View style={styles.fieldValue}>
                <Text style={styles.fieldText}>{value}</Text>
            </View>
        </View>
    );
}

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        backgroundColor: '#3A5689',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 120,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    logoutIconButton: {
        padding: 8,
    },
    avatarSection: {
        alignItems: 'center',
        marginTop: -60,
        zIndex: 10,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 60,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 60,
        backgroundColor: '#3A5689',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    avatarInitials: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    cameraIconContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#3A5689',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    infoCard: {
        backgroundColor: 'rgba(58, 86, 137, 0.5)',
        marginHorizontal: 20,
        padding: 20,
        borderRadius: 8,
        alignItems: 'center',
        elevation: 3,
        borderColor: '#fff',
        top: -60,
        position: 'relative',
        borderWidth: 2,
        height: 150,
        paddingTop: 65,
    },
    fullName: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 8,
        color: 'white',
    },
    classInfo: {
        fontSize: 16,
        marginBottom: 4,
        color: 'white',
    },
    schoolInfo: {
        fontSize: 14,
        color: 'white',
    },
    content: {
        flex: 1,
        top: -40,
    },
    // ── Sections ──
    sectionContainer: {
        marginHorizontal: 20,
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 12,
    },
    // ── Statistiques ──
    statsRow: {
        flexDirection: 'row',
        gap: 10,
    },
    statTile: {
        flex: 1,
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        gap: 6,
    },
    statIconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statValue: {
        fontSize: 22,
        fontWeight: '800',
    },
    statLabel: {
        fontSize: 11,
        color: '#6B7280',
        fontWeight: '500',
        textAlign: 'center',
    },
    // ── Historique mini-cartes ──
    voirToutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        marginBottom: 12,
    },
    voirToutText: {
        fontSize: 13,
        color: '#3A5689',
        fontWeight: '600',
    },
    historyCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        gap: 12,
    },
    historyCardLeft: {
        justifyContent: 'center',
    },
    historyIconCircle: {
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: 'center',
        alignItems: 'center',
    },
    historyCardCenter: {
        flex: 1,
    },
    historyCardTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 2,
    },
    historyCardSub: {
        fontSize: 12,
        color: '#6B7280',
    },
    historyCardSchool: {
        fontSize: 11,
        color: '#9CA3AF',
        marginTop: 2,
    },
    historyCardRight: {
        alignItems: 'flex-end',
    },
    historyCardDate: {
        fontSize: 11,
        color: '#9CA3AF',
        marginBottom: 4,
    },
    historyCardRep: {
        fontSize: 12,
        color: '#3A5689',
        fontWeight: '600',
    },
    historyLoadingBox: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
    },
    historyLoadingText: {
        color: '#9CA3AF',
        fontSize: 14,
    },
    historyEmptyBox: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 24,
        alignItems: 'center',
        gap: 10,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    historyEmptyText: {
        fontSize: 13,
        color: '#9CA3AF',
        textAlign: 'center',
    },
    voirToutFullBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: '#3A5689',
        gap: 6,
        marginTop: 2,
    },
    voirToutFullText: {
        fontSize: 14,
        color: '#3A5689',
        fontWeight: '600',
    },
    // ── Formulaire ──
    formSection: {},
    formField: {
        marginBottom: 16,
    },
    fieldLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    fieldValue: {
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    fieldText: {
        fontSize: 16,
        color: '#1F2937',
    },
    passwordRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    passwordDots: {
        fontSize: 16,
        color: '#1F2937',
        letterSpacing: 2,
    },
    bottomSpacing: {
        height: 20,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    errorText: {
        fontSize: 16,
        color: '#DC2626',
        textAlign: 'center',
    },
});
