import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../presentation/hooks/useAuth';
import { PrimaryButton } from '../../presentation/components/PrimaryButton';

export default function Profil() {
    const { utilisateur, logout } = useAuth();
    const [avatarUri, setAvatarUri] = useState<string | null>(utilisateur?.avatar || null);

    console.log('👤 Utilisateur connecté:', utilisateur);

    const handleLogout = async () => {
        Alert.alert(
            'Déconnexion',
            'Êtes-vous sûr de vouloir vous déconnecter ?',
            [
                { text: 'Annuler', style: 'cancel' },
                { text: 'Se déconnecter', onPress: async () => await logout(), style: 'destructive' }
            ]
        );
    };

    const handleChangeAvatar = async () => {
        try {
            // Demander la permission d'accéder à la galerie
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            
            if (!permissionResult.granted) {
                Alert.alert(
                    'Permission requise',
                    'Vous devez autoriser l\'accès à la galerie pour changer votre photo de profil.'
                );
                return;
            }

            // Ouvrir le sélecteur d'images
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                const imageUri = result.assets[0].uri;
                setAvatarUri(imageUri);
                console.log('📸 Image sélectionnée:', imageUri);
                // TODO: Uploader l'image vers le backend quand l'endpoint sera prêt
                Alert.alert('Succès', 'Photo de profil mise à jour localement');
            }
        } catch (error) {
            console.error('Erreur lors de la sélection de l\'image:', error);
            Alert.alert('Erreur', 'Impossible de sélectionner l\'image');
        }
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
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Mon Profil</Text>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutIconButton}>
                    <MaterialIcons name="logout" size={24} color="#DC2626" />
                </TouchableOpacity>
            </View>
            <View >
                <Text>Mon Profil</Text>                
            </View>
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
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
    },
    logoutIconButton: {
        padding: 8,
    },
    content: {
        flex: 1,
    },
    avatarSection: {
        alignItems: 'center',
        paddingVertical: 32,
        backgroundColor: '#FFFFFF',
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: '#3A5689',
    },
    avatarPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#3A5689',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
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
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        marginTop: 16,
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    fullName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
    },
    classInfo: {
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 4,
    },
    schoolInfo: {
        fontSize: 14,
        color: '#9CA3AF',
    },
    formSection: {
        marginHorizontal: 20,
        marginTop: 24,
    },
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
    logoutButton: {
        marginHorizontal: 20,
        marginTop: 32,
        backgroundColor: '#DC2626',
    },
    bottomSpacing: {
        height: 40,
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