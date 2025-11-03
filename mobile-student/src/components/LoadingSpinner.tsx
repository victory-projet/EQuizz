import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

export default function LoadingSpinner() {
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6B4C9A" />
            <Text style={styles.loadingText}>Chargement...</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomEndRadius: 14,
        borderBottomStartRadius: 14,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666666',
    },
});