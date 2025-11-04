import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../presentation/hooks/useAuth';
import { PrimaryButton } from '../../presentation/components/PrimaryButton';

export default function Profil() {
    const { utilisateur, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
    };

    return (
        <SafeAreaView style={styles.container} edges={[]}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>👤 Profil</Text>
            </View>
            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.title}>Profil Étudiant</Text>
                    
                    {utilisateur && (
                        <View style={styles.infoContainer}>
                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Nom:</Text>
                                <Text style={styles.value}>{utilisateur.nom}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Prénom:</Text>
                                <Text style={styles.value}>{utilisateur.prenom}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Email:</Text>
                                <Text style={styles.value}>{utilisateur.email}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Rôle:</Text>
                                <Text style={styles.value}>{utilisateur.role}</Text>
                            </View>
                        </View>
                    )}

                    <PrimaryButton
                        title="Se déconnecter"
                        onPress={handleLogout}
                        style={styles.logoutButton}
                    />
                </View>
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
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#111827',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    section: {
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 24,
    },
    infoContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    },
    value: {
        fontSize: 16,
        color: '#6B7280',
    },
    logoutButton: {
        marginTop: 16,
    },
});