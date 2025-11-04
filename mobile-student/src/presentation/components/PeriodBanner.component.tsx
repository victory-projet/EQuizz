import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { EvaluationPeriod } from '../../domain/entities/EvaluationPeriod.entity';

interface PeriodBannerProps {
    period: EvaluationPeriod;
}

export default function PeriodBanner({ period }: PeriodBannerProps) {
    return (
        <View style={styles.periodContainer}>
            <Text style={styles.periodTitle}>Période d'évaluation</Text>
            <Text style={styles.periodDate}>
                {period.startDate} - {period.endDate}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    periodContainer: {
        backgroundColor: '#3A5689',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 3,
        borderBottomColor: '#2D4470',
    },
    periodTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    periodDate: {
        fontSize: 14,
        color: '#D1D5DB',
        fontWeight: '500',
    },
});
