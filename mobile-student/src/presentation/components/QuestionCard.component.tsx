import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Question, QuestionType } from '../../domain/entities/Question.entity';

interface QuestionCardProps {
    question: Question;
    selectedOptions: string[];
    onOptionSelect: (optionId: string) => void;
}

export default function QuestionCard({ question, selectedOptions, onOptionSelect }: QuestionCardProps) {
    const isSelected = (optionId: string) => selectedOptions.includes(optionId);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.questionNumber}>
                    Question {question.questionNumber} sur {question.totalQuestions}
                </Text>
                {question.type === QuestionType.MULTIPLE_CHOICE && (
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
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 22,
        margin: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 18,
    },
    questionNumber: {
        fontSize: 14,
        fontWeight: '700',
        color: '#6B4C9A',
        letterSpacing: 0.3,
    },
    badge: {
        backgroundColor: '#6B4C9A',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#FFFFFF',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    questionText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 24,
        lineHeight: 26,
    },
    optionsContainer: {
        gap: 12,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
    },
    optionButtonSelected: {
        borderColor: '#6B4C9A',
        backgroundColor: '#F3F0FF',
    },
    radio: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        marginRight: 14,
        marginTop: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioSelected: {
        borderColor: '#6B4C9A',
        backgroundColor: '#FFFFFF',
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#6B4C9A',
    },
    optionText: {
        flex: 1,
        fontSize: 15,
        color: '#6B7280',
        lineHeight: 22,
        fontWeight: '500',
    },
    optionTextSelected: {
        color: '#1F2937',
        fontWeight: '600',
    },
});
