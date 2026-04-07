import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../presentation/hooks/useAuth';

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
                { 
                    text: 'Se déconnecter', 
                    onPress: async () => await logout(), 
                    style: 'destructive' 
                }
            ]
        );
    };

    const handleChangeAvatar = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            
            if (!permissionResult.granted) {
                Alert.alert(
                    'Permission requise',
                    'Vous devez autoriser l\'accès à la galerie pour changer votre photo de profil.'
                );
                return;
            }

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
                Alert.alert('Succès', 'Photo de profil mise à jour localement');
            }
        } catch (error) {
            console.error('Erreur lors de la sélection de l\'image:', error);
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
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Mon Profil</Text>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutIconButton}>
                    <MaterialIcons name="logout" size={24} color="#DC2626" />
                </TouchableOpacity>
            </View>

            {/* Avatar positionné au-dessus du header */}
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

            {/* Carte d'information principale */}
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

                

                {/* Section des champs de formulaire */}
                <View style={styles.formSection}>
                    {/* Nom & Prénom */}
                    <View style={styles.formField}>
                        <Text style={styles.fieldLabel}>Nom & Prénom</Text>
                        <View style={styles.fieldValue}>
                            <Text style={styles.fieldText}>
                                {utilisateur.nom} {utilisateur.prenom}
                            </Text>
                        </View>
                    </View>

                    {/* Email */}
                    {utilisateur.email && (
                        <View style={styles.formField}>
                            <Text style={styles.fieldLabel}>Email</Text>
                            <View style={styles.fieldValue}>
                                <Text style={styles.fieldText}>
                                    {utilisateur.email}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Mot de passe (masqué) */}
                    <View style={styles.formField}>
                        <Text style={styles.fieldLabel}>Mot de passe</Text>
                        <View style={styles.fieldValue}>
                            <View style={styles.passwordRow}>
                                <Text style={styles.passwordDots}>••••••••••••••••</Text>
                                <MaterialIcons name="visibility-off" size={20} color="#9CA3AF" />
                            </View>
                        </View>
                    </View>

                    {/* Matricule */}
                    <View style={styles.formField}>
                        <Text style={styles.fieldLabel}>Matricule</Text>
                        <View style={styles.fieldValue}>
                            <Text style={styles.fieldText}>
                                {utilisateur.matricule}
                            </Text>
                        </View>
                    </View>

                    {/* Année Académique */}
                    {utilisateur.anneeScolaire && (
                        <View style={styles.formField}>
                            <Text style={styles.fieldLabel}>Année Académique</Text>
                            <View style={styles.fieldValue}>
                                <Text style={styles.fieldText}>
                                    {utilisateur.anneeScolaire}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Niveau */}
                    {((utilisateur as any).classe?.niveau || utilisateur.Classe?.Niveau?.nom) && (
                        <View style={styles.formField}>
                            <Text style={styles.fieldLabel}>Niveau</Text>
                            <View style={styles.fieldValue}>
                                <Text style={styles.fieldText}>
                                    {(utilisateur as any).classe?.niveau || utilisateur.Classe?.Niveau?.nom}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Classe */}
                    {((utilisateur as any).classe?.nom || utilisateur.Classe?.nom) && (
                        <View style={styles.formField}>
                            <Text style={styles.fieldLabel}>Classe</Text>
                            <View style={styles.fieldValue}>
                                <Text style={styles.fieldText}>
                                    {(utilisateur as any).classe?.nom || utilisateur.Classe?.nom}
                                </Text>
                            </View>
                        </View>
                    )}
                </View>

                <View style={styles.bottomSpacing} />
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
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
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
    content: {
        flex: 1,
        top:-40
    },
    avatarSection: {
        alignItems: 'center',
        marginTop: -60,
        zIndex: 10,
        //marginBottom: 20,
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
        //marginTop: 16,
        padding: 20,
        borderRadius: 8,
        alignItems: 'center',
        elevation: 3,
        color: 'white',
        borderColor: '#fff',
        top: -60,
        position: 'relative',
        borderWidth:2,
        height: 150,
        paddingTop:65
    },
    fullName: {
        fontSize: 22,
        fontWeight: 'bold',
        //color: '#111827',
        marginBottom: 8,
        color: 'white'
    },
    classInfo: {
        fontSize: 16,
        //color: '#6B7280',
        marginBottom: 4,
        color: 'white'
    },
    schoolInfo: {
        fontSize: 14,
        //color: '#9CA3AF',
        color: 'white'
    },
    formSection: {
        marginHorizontal: 20,
        //marginTop: 24,
        
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
        height: 10,
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