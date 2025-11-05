import React, { useState, useMemo, useEffect } from 'react';
import { ScrollView, StyleSheet, StatusBar, View, Alert, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuestions } from '@/src/presentation/hooks/useQuestions';
import { useQuizSubmission } from '@/src/presentation/hooks/useQuizSubmission';
import { useCourses } from '@/src/presentation/hooks/useCourses';
import { QuestionType } from '@/src/domain/entities/Question.entity';
import LoadingSpinner from '@/src/presentation/components/LoadingSpinner.component';
import ProgressBar from '@/src/presentation/components/ProgressBar.component';
import QuestionCard from '@/src/presentation/components/QuestionCard.component';
import QuizNavigation from '@/src/presentation/components/QuizNavigation.component';

const CURRENT_QUIZ_KEY = '@current_quiz_state';
const COMPLETED_QUIZZES_KEY = '@completed_quizzes';

export default function Quizz() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { courses } = useCourses();
    const { questions, loading } = useQuestions(id || '');
    const { submitQuiz } = useQuizSubmission();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Map<string, string[]>>(new Map());
    const [isInitialized, setIsInitialized] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);

    const course = useMemo(() => courses.find(c => c.id === id), [courses, id]);

    // Vérifier si le quiz est déjà terminé
    useEffect(() => {
        if (id) {
            checkIfCompleted();
        }
    }, [id]);

    const checkIfCompleted = async () => {
        try {
            const completedData = await AsyncStorage.getItem(COMPLETED_QUIZZES_KEY);
            if (completedData) {
                const completed = JSON.parse(completedData);
                if (completed.includes(id)) {
                    setIsCompleted(true);
                }
            }
        } catch (error) {
            console.error('Error checking if quiz is completed:', error);
        }
    };

    // Charger l'état sauvegardé au premier affichage
    useFocusEffect(
        React.useCallback(() => {
            if (!isInitialized && !id) {
                loadLastQuizState();
            }
            return () => {
                // Sauvegarder l'état quand on quitte l'écran
                if (id) {
                    saveQuizState();
                }
            };
        }, [id, isInitialized])
    );

    const loadLastQuizState = async () => {
        try {
            const savedState = await AsyncStorage.getItem(CURRENT_QUIZ_KEY);
            if (savedState) {
                const state = JSON.parse(savedState);
                // Rediriger vers le dernier quiz en cours
                if (state.quizId) {
                    router.replace({
                        pathname: '/(tabs)/quizz',
                        params: { id: state.quizId }
                    });
                }
            }
        } catch (error) {
            console.error('Error loading last quiz state:', error);
        } finally {
            setIsInitialized(true);
        }
    };

    const saveQuizState = async () => {
        try {
            const state = {
                quizId: id,
                currentIndex,
                answers: Array.from(answers.entries()),
                timestamp: new Date().toISOString()
            };
            await AsyncStorage.setItem(CURRENT_QUIZ_KEY, JSON.stringify(state));
        } catch (error) {
            console.error('Error saving quiz state:', error);
        }
    };

    // Restaurer l'état du quiz quand on charge un cours
    useEffect(() => {
        if (id && questions.length > 0) {
            loadQuizState();
        }
    }, [id, questions]);

    const loadQuizState = async () => {
        try {
            const savedState = await AsyncStorage.getItem(CURRENT_QUIZ_KEY);
            if (savedState) {
                const state = JSON.parse(savedState);
                if (state.quizId === id) {
                    // Restaurer l'état du quiz en cours
                    setCurrentIndex(state.currentIndex || 0);
                    setAnswers(new Map(state.answers || []));
                } else {
                    // Nouveau quiz différent, réinitialiser l'état
                    setCurrentIndex(0);
                    setAnswers(new Map());
                }
            } else {
                // Pas d'état sauvegardé, commencer un nouveau quiz
                setCurrentIndex(0);
                setAnswers(new Map());
            }
        } catch (error) {
            console.error('Error restoring quiz state:', error);
        }
    };

    const clearQuizState = async () => {
        try {
            await AsyncStorage.removeItem(CURRENT_QUIZ_KEY);
        } catch (error) {
            console.error('Error clearing quiz state:', error);
        }
    };

    const markQuizAsCompleted = async (quizId: string) => {
        try {
            const completedData = await AsyncStorage.getItem(COMPLETED_QUIZZES_KEY);
            const completed = completedData ? JSON.parse(completedData) : [];
            
            if (!completed.includes(quizId)) {
                completed.push(quizId);
                await AsyncStorage.setItem(COMPLETED_QUIZZES_KEY, JSON.stringify(completed));
            }
        } catch (error) {
            console.error('Error marking quiz as completed:', error);
        }
    };
    const currentQuestion = questions[currentIndex];
    const currentAnswers = answers.get(currentQuestion?.id) || [];

    const handleOptionSelect = (optionId: string) => {
        if (!currentQuestion) return;

        const newAnswers = new Map(answers);
        const existingAnswers = newAnswers.get(currentQuestion.id) || [];

        if (currentQuestion.type === QuestionType.SINGLE_CHOICE) {
            newAnswers.set(currentQuestion.id, [optionId]);
        } else if (currentQuestion.type === QuestionType.MULTIPLE_CHOICE) {
            if (existingAnswers.includes(optionId)) {
                newAnswers.set(
                    currentQuestion.id,
                    existingAnswers.filter(id => id !== optionId)
                );
            } else {
                newAnswers.set(currentQuestion.id, [...existingAnswers, optionId]);
            }
        }

        setAnswers(newAnswers);
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleNext = async () => {
        const isLastQuestion = currentIndex === questions.length - 1;
        if (isLastQuestion) {
            await handleSubmit();
        } else {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handleSubmit = async () => {
        Alert.alert(
            'Confirmation',
            'Voulez-vous soumettre vos réponses ? Une fois soumis, vous ne pourrez plus accéder à ce quiz.',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Soumettre',
                    onPress: async () => {
                        const submission = {
                            courseId: id || '',
                            answers: Array.from(answers.entries()).map(([questionId, selectedOptions]) => ({
                                questionId,
                                selectedOptions
                            })),
                            completedAt: new Date()
                        };

                        const success = await submitQuiz(submission);
                        if (success) {
                            // Marquer le quiz comme terminé
                            await markQuizAsCompleted(id || '');
                            // Supprimer l'état du quiz en cours
                            await clearQuizState();
                            
                            Alert.alert('Succès', 'Quiz soumis avec succès !', [
                                { text: 'OK', onPress: () => router.replace('/(tabs)/quizzes' as any) }
                            ]);
                        }
                    }
                }
            ]
        );
    };

    const canGoNext = currentAnswers.length > 0;
    const canGoPrevious = currentIndex > 0;
    const isLastQuestion = currentIndex === questions.length - 1;

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={[]}>
                <LoadingSpinner />
            </SafeAreaView>
        );
    }

    if (isCompleted) {
        return (
            <SafeAreaView style={styles.container} edges={[]}>
                <View style={styles.emptyHeader}>
                    <Text style={styles.emptyHeaderText}>📝 Quiz</Text>
                </View>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                        Ce quiz a déjà été soumis. Vous ne pouvez plus y accéder.
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!id || questions.length === 0) {
        return (
            <SafeAreaView style={styles.container} edges={[]}>
                <View style={styles.emptyHeader}>
                    <Text style={styles.emptyHeaderText}>📝 Quiz</Text>
                </View>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                        {!id ? 'Sélectionnez un cours depuis l\'onglet Accueil' : 'Aucune question disponible'}
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#6B4C9A" />

            <ProgressBar
                current={currentIndex + 1}
                total={questions.length}
                courseName={course?.title || 'Quiz'}
                semester="Fin de semestre"
            />

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled={true}
            >
                <QuestionCard
                    question={currentQuestion}
                    selectedOptions={currentAnswers}
                    onOptionSelect={handleOptionSelect}
                />
            </ScrollView>

            <QuizNavigation
                onPrevious={handlePrevious}
                onNext={handleNext}
                canGoPrevious={canGoPrevious}
                canGoNext={canGoNext}
                isLastQuestion={isLastQuestion}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    emptyHeader: {
        backgroundColor: '#7C3AED',
        paddingTop: 50,
        paddingBottom: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 3,
        borderBottomColor: '#6D28D9',
    },
    emptyHeaderText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
    },
});