import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { EvaluationPeriod } from '../models/interfaces/EvaluationPeriod';

interface PeriodBannerProps {
    period: EvaluationPeriod;
}

export default function PeriodBanner ({ period }: PeriodBannerProps ){
    return (
        <View style={styles.periodContainer}>
        <Text style={styles.periodTitle}>Période d'évaluation</Text>
        <Text style={styles.periodDate}>
            {period.Debut} {period.Fin  }
        </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    periodContainer: {
        backgroundColor: '#3A5689',
        paddingVertical: 0,
        paddingHorizontal: 20,
        marginTop: 2,
        paddingBottom: 10
    },
    periodTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 5,
    },
    periodDate: {
        fontSize: 14,
        color: '#E0D5F0',
    },
});
