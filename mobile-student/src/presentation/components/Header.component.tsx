import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { EvaluationPeriod } from '@/src/domain/entities';

interface HeaderProps {
    searchQuery: string;
    onSearchChange: (text: string) => void;
}

export default function Header({ searchQuery, onSearchChange }: HeaderProps) {
    return (
        <View style={styles.header}>
            <Text style={styles.headerTitle}>📚 Évaluation Mi-Parcours</Text>
            <Text style={styles.headerSubtitle}>Sélectionnez une UE pour commencer</Text>

            <View style={styles.searchContainer}>
                <FontAwesome name="search" size={16} color="#6B7280" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Rechercher un cours..."
                    value={searchQuery}
                    onChangeText={onSearchChange}
                    placeholderTextColor="#9CA3AF"
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        backgroundColor: '#3A5689',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 13,
        color: '#F9FAFB',
        marginBottom: 12,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 10,
        paddingHorizontal: 12,
        height: 44,
        borderWidth: 1.5,
        borderColor: '#D1D5DB',
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#111827',
        paddingVertical: 0,
    },
    searchIcon: {
        marginRight: 10,
    },
});
