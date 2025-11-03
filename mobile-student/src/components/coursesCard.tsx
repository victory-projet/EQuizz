import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Course } from '../models/interfaces/Course';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

interface CourseCardProps {
    course: Course;
    onEvaluate?: (courseId: string) => void;
}
export default function CourseCard({course, onEvaluate}: CourseCardProps){
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
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 15,
        ...Platform.select({
        ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
        },
        android: {
            elevation: 3,
        },
        }),
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#333333',
        flex: 1,
        marginRight: 10,
    },
    statusBadge: {
        backgroundColor: '#10B981',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    statusText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    cardInfo: {
        marginBottom: 15,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoIcon: {
        fontSize: 16,
        marginRight: 8,
        width: 20,
    },
    infoText: {
        fontSize: 14,
        color: '#666666',
        flex: 1,
        marginLeft: 8,
    },
    evaluateButton: {
        backgroundColor: '#3A5689',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    evaluateButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});