import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Course } from '../../domain/entities/Course.entity';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

interface CourseCardProps {
    course: Course;
    onEvaluate?: (courseId: string) => void;
}

export default function CourseCard({ course, onEvaluate }: CourseCardProps) {
    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{course.title}</Text>
                <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{course.status}</Text>
                </View>
            </View>

            <View style={styles.cardInfo}>
                <View style={styles.infoRow}>
                    <FontAwesome5 name="user-friends" size={16} color="#3A5689" />
                    <Text style={styles.infoText}>
                        Classes: {course.classes.join(', ')}
                    </Text>
                </View>

                <View style={styles.infoRow}>
                    <MaterialIcons name="question-mark" size={16} color="red" />
                    <Text style={styles.infoText}>
                        Questions: {course.questionCount}
                    </Text>
                </View>

                <View style={styles.infoRow}>
                    <FontAwesome5 name="calendar-alt" size={16} color="#3A5689" />
                    <Text style={styles.infoText}>
                        Période: {course.startDate}
                    </Text>
                </View>
            </View>

            <TouchableOpacity 
                style={styles.evaluateButton}
                onPress={() => onEvaluate?.(course.id)}
                activeOpacity={0.7}
            >
                <Text style={styles.evaluateButtonText}>Évaluer</Text>
            </TouchableOpacity>
        </View>
    );
}

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
    cardTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1F2937',
        flex: 1,
        marginRight: 12,
        lineHeight: 24,
    },
    statusBadge: {
        backgroundColor: '#10B981',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    statusText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
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
    infoText: {
        fontSize: 14,
        color: '#4B5563',
        flex: 1,
        marginLeft: 10,
        fontWeight: '500',
    },
    evaluateButton: {
        backgroundColor: '#3A5689',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#3A5689',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    evaluateButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
});
