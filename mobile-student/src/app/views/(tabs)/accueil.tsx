import React, { useState, useEffect } from 'react';
import {ScrollView,StyleSheet,StatusBar,View,Alert} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import  Header  from '../../../components/header';
import PeriodBanner from '../../../components/periodBanner';
import CourseCard from '../../../components/coursesCard';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { Course } from '../../../models/interfaces/Course';
import { EvaluationPeriod } from '../../../models/interfaces/EvaluationPeriod';
import { CourseRepository } from '../../../models/repositories/CoursesRepository';
import { GetCoursesService } from '../../../models/services/GetCoursesService';
import { GetEvaluationPeriodService } from '../../../models/services/GetEvaluationPeriodService';
import { router } from 'expo-router';

const courseRepository = new CourseRepository();
const getCoursesUseCase = new GetCoursesService(courseRepository);
const getEvaluationPeriodUseCase = new GetEvaluationPeriodService(courseRepository);

export const Accueil: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [period, setPeriod] = useState<EvaluationPeriod>({ 
        Debut: '', 
        Fin: '' 
    });
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
        setLoading(true);
        const [coursesData, periodData] = await Promise.all([
            getCoursesUseCase.execute(),
            getEvaluationPeriodUseCase.execute()
        ]);
        setCourses(coursesData);
        setPeriod(periodData);
        } catch (error) {
        console.error('Error loading data:', error);
        Alert.alert('Erreur', 'Impossible de charger les données');
        } finally {
        setLoading(false);
        }
    };

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleEvaluate = (courseId: string) => {
        // Trouve le cours par id correctement
        const course = courses.find(c => c.id === courseId);

        // Affiche l'alerte avec le titre du cours
        Alert.alert(
            'Évaluation',
            `Démarrer l'évaluation pour:\n${course?.title ?? 'Cours inconnu'}`,
            [
                { text: 'Annuler', style: 'cancel' },
                { text: 'Continuer', onPress: () => router.push({ 
                    pathname: '/views/(tabs)/quizz',
                    params: { courseId } }) }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
        <StatusBar 
            barStyle="dark-content" 
            backgroundColor="#FFFFFF" 
        />
        
        <Header 
            searchQuery={searchQuery} 
            onSearchChange={setSearchQuery} 
        />

        <PeriodBanner period={period} />

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
};

    const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        paddingHorizontal: 15,
        paddingTop: 15,
    },
    bottomSpacing: {
        height: 20,
    },
});
