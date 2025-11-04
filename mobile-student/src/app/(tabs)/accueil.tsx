import React, { useState } from 'react';
import { ScrollView, StyleSheet, StatusBar, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useCourses } from '../../presentation/hooks/useCourses';
import { useEvaluationPeriod } from '../../presentation/hooks/useEvaluationPeriod';
import Header from '../../presentation/components/Header.component';
import PeriodBanner from '../../presentation/components/PeriodBanner.component';
import CourseCard from '../../presentation/components/CourseCard.component';
import LoadingSpinner from '../../presentation/components/LoadingSpinner.component';

export default function Accueil() {
    const [searchQuery, setSearchQuery] = useState('');
    const { courses, loading: coursesLoading } = useCourses();
    const { period, loading: periodLoading } = useEvaluationPeriod();

    const loading = coursesLoading || periodLoading;

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleEvaluate = (courseId: string) => {
        const course = courses.find(c => c.id === courseId);
        Alert.alert(
            'Évaluation',
            `Démarrer l'évaluation pour:\n${course?.title ?? 'Cours inconnu'}`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Continuer',
                    onPress: () => router.push({
                        pathname: '/(tabs)/quizz',
                        params: { id: courseId }
                    })
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={[]}>
            <StatusBar
                barStyle="dark-content"
                backgroundColor="#FFFFFF"
            />

            <Header
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
            />

            {period && <PeriodBanner period={period} />}

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollViewContent}
            >
                {loading ? (
                    <LoadingSpinner />
                ) : (
                    <>
                        {filteredCourses.map((course) => (
                            <CourseCard
                                key={course.id}
                                course={course}
                                onEvaluate={handleEvaluate}
                            />
                        ))}
                        <View style={styles.bottomSpacing} />
                    </>
                )}
            </ScrollView>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 20,
    },
    bottomSpacing: {
        height: 30,
    },
});
