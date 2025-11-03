import { View, Text, TouchableOpacity, StyleSheet  } from 'react-native'
import React from 'react'
import { QuestionCardProps } from '../models/interfaces/QuestionCardProps'
import { TypeQuestion } from '../models/enums/TypeQuestion';

export default function QuestionCard({question,selectedOptions,onOptionSelect}: QuestionCardProps) {
    const isSelected = (optionId: string) => selectedOptions.includes(optionId);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.questionNumber}>
                Question {question.questionNumber} sur {question.totalQuestions}
                </Text>
                {question.type === TypeQuestion.MULTIPLE && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>Choix multiple</Text>
                </View>
                )}
            </View>

            <Text style={styles.questionText}>{question.text}</Text>

            <View style={styles.optionsContainer}>
                {question.options?.map((option) => (
                <TouchableOpacity
                    key={option.id}
                    style={[
                    styles.optionButton,
                    isSelected(option.id) && styles.optionButtonSelected
                    ]}
                    onPress={() => onOptionSelect(option.id)}
                    activeOpacity={0.7}
                >
                    <View style={[
                        styles.radio,
                        isSelected(option.id) && styles.radioSelected
                        ]}>
                        {isSelected(option.id) && <View style={styles.radioInner} />}
                    </View>
                    <Text style={[
                        styles.optionText,
                        isSelected(option.id) && styles.optionTextSelected
                        ]}>
                        {option.text}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        margin: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    questionNumber: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B4C9A',
    },
    badge: {
        backgroundColor: '#6B4C9A',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    questionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333333',
        marginBottom: 20,
        lineHeight: 24,
    },
    optionsContainer: {
        gap: 10,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 15,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: '#E5E5E5',
        backgroundColor: '#FFFFFF',
    },
    optionButtonSelected: {
        borderColor: '#6B4C9A',
        backgroundColor: '#F5F0FF',
    },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#CCCCCC',
        marginRight: 12,
        marginTop: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioSelected: {
        borderColor: '#6B4C9A',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#6B4C9A',
    },
    optionText: {
        flex: 1,
        fontSize: 14,
        color: '#666666',
        lineHeight: 20,
    },
    optionTextSelected: {
        color: '#333333',
        fontWeight: '500',
    },
    });