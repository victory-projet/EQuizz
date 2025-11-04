import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProgressBarProps {
    current: number;
    total: number;
    courseName: string;
    semester: string;
}

export default function ProgressBar({ current, total, courseName, semester }: ProgressBarProps) {
    const progress = (current / total) * 100;
    
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.courseName}>{courseName}</Text>
                <Text style={styles.semester}>{semester}</Text>
            </View>
            
            <View style={styles.progressContainer}>
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                </View>
                <Text style={styles.progressText}>{current}/{total}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#6B4C9A',
        paddingTop: 50,
        paddingBottom: 18,
        paddingHorizontal: 20,
        borderBottomWidth: 3,
        borderBottomColor: '#5A3D82',
    },
    header: {
        marginBottom: 12,
    },
    courseName: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
        letterSpacing: 0.3,
    },
    semester: {
        fontSize: 13,
        color: '#D1D5DB',
        fontWeight: '500',
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    progressBarBg: {
        flex: 1,
        height: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        borderRadius: 5,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#10B981',
        borderRadius: 5,
    },
    progressText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFFFFF',
        minWidth: 45,
        textAlign: 'right',
        letterSpacing: 0.5,
    },
});
