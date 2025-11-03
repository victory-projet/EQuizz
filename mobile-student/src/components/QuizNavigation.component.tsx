import { View, TouchableOpacity, Text, StyleSheet } from 'react-native'
import React from 'react'
import AntDesign from '@expo/vector-icons/AntDesign';
import { QuizNavigationProps } from '../models/interfaces/QuizNavigationProps'

export default function QuizNavigation({
    onPrevious,
    onNext,
    canGoPrevious,
    canGoNext,
    isLastQuestion
}: QuizNavigationProps) {
    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[styles.button, styles.buttonPrevious, !canGoPrevious && styles.buttonDisabled]}
                onPress={onPrevious}
                disabled={!canGoPrevious}
                activeOpacity={0.7}
            >
                <View>
                    <AntDesign name="arrow-left" size={16} color="#6B4C9A" />
                </View>
                <Text style={[styles.buttonText, !canGoPrevious && styles.buttonTextDisabled]}>
                Précédent
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.button, styles.buttonNext, !canGoNext && styles.buttonDisabled]}
                onPress={onNext}
                disabled={!canGoNext}
                activeOpacity={0.7}
            >
                <Text style={[styles.buttonText, !canGoNext && styles.buttonTextDisabled]}>
                {isLastQuestion ? 'Terminer' : 'Suivant'}
                </Text>
                <View>
                    <AntDesign name="arrow-right" size={16} color="#6B4C9A" />
                </View>
            </TouchableOpacity>
    </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 15,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5',
        gap: 10,
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8,
    },
    buttonPrevious: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderColor: '#6B4C9A',
    },
    buttonNext: {
        backgroundColor: '#6B4C9A',
    },
    buttonDisabled: {
        opacity: 0.4,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    buttonTextDisabled: {
        color: '#999999',
    },
});
