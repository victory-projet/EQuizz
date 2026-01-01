import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';

export const CourseCardSkeleton: React.FC = () => {
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Animation de pulsation
        Animated.loop(
        Animated.sequence([
            Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
            }),
            Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
            }),
        ])
        ).start();
    }, []);

    const opacity = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <View style={styles.card}>
        {/* Header avec titre et badge */}
        <View style={styles.cardHeader}>
            <Animated.View style={[styles.titleSkeleton, { opacity }]} />
            <Animated.View style={[styles.badgeSkeleton, { opacity }]} />
        </View>

        {/* Info container */}
        <View style={styles.cardInfo}>
            {/* Classes */}
            <View style={styles.infoRow}>
            <Animated.View style={[styles.iconSkeleton, { opacity }]} />
            <Animated.View style={[styles.textSkeleton, { opacity }]} />
            </View>

            {/* Questions */}
            <View style={styles.infoRow}>
            <Animated.View style={[styles.iconSkeleton, { opacity }]} />
            <Animated.View style={[styles.textSkeletonShort, { opacity }]} />
            </View>

            {/* Période */}
            <View style={styles.infoRow}>
            <Animated.View style={[styles.iconSkeleton, { opacity }]} />
            <Animated.View style={[styles.textSkeleton, { opacity }]} />
            </View>
        </View>

        {/* Bouton évaluer */}
        <Animated.View style={[styles.buttonSkeleton, { opacity }]} />
        </View>
    );
};

// Composant pour afficher plusieurs skeletons
export const CourseCardSkeletonList: React.FC<{ count?: number }> = ({ count = 3 }) => {
    return (
        <>
        {Array.from({ length: count }).map((_, index) => (
            <CourseCardSkeleton key={index} />
        ))}
        </>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 18,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        ...Platform.select({
        ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
        },
        android: {
            elevation: 2,
        },
        }),
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    titleSkeleton: {
        height: 48, // 2 lignes de texte
        flex: 1,
        backgroundColor: '#E5E7EB',
        borderRadius: 8,
        marginRight: 12,
    },
    badgeSkeleton: {
        width: 80,
        height: 28,
        backgroundColor: '#E5E7EB',
        borderRadius: 8,
    },
    cardInfo: {
        marginBottom: 16,
        backgroundColor: '#F9FAFB',
        padding: 12,
        borderRadius: 10,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    iconSkeleton: {
        width: 20,
        height: 20,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
        marginRight: 10,
    },
    textSkeleton: {
        height: 16,
        flex: 1,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
    },
    textSkeletonShort: {
        height: 16,
        width: '60%',
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
    },
    buttonSkeleton: {
        height: 48,
        backgroundColor: '#E5E7EB',
        borderRadius: 12,
    },
});