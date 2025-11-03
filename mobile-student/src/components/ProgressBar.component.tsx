import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { ProgressBarProps } from '../models/interfaces/ProgressBarProps'

export default function ProgressBar({  current,total,courseName,semester}: ProgressBarProps) {
    const progress = (current / total)* 100
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
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#6B4C9A',
        paddingVertical: 15,
        paddingHorizontal: 20,
    },
    header: {
        marginBottom: 10,
    },
    courseName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 3,
    },
    semester: {
        fontSize: 13,
        color: '#E0D5F0',
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    progressBarBg: {
        flex: 1,
        height: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#10B981',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
        minWidth: 40,
        textAlign: 'right',
    },
});