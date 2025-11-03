import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { HeaderProps } from '../models/interfaces/HeaderProps';
import FontAwesome from '@expo/vector-icons/FontAwesome';


export default function Header({ searchQuery, onSearchChange }: HeaderProps){
    return (
        <View style={styles.header}>
        <Text style={styles.headerTitle}>Évaluation Mi-Parcours</Text>
        <Text style={styles.headerSubtitle}>Sélectionnez une UE pour évaluer</Text>
        
        <View style={styles.searchContainer}>
            <TextInput
            style={styles.searchInput}
            placeholder="Rechercher..."
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholderTextColor="#999999"
            />
            <View style={styles.searchIcon}>
                <FontAwesome name="search" size={16} color="gray" />
            </View>
        </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 5,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 5,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 15,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 30,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#333333',
    },
    searchIcon: {
        fontSize: 18,
        marginLeft: 8,
    },
});
