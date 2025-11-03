import React, { useState, useEffect } from 'react';
import {ScrollView,StyleSheet,StatusBar,View,Alert,Text} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LoadingSpinner from '@/src/components/LoadingSpinner';
import { Question} from '@/src/models/interfaces/Question';
import { QuestionRepository } from '@/src/models/repositories/QuestionRepository';
import { GetQuestionsUseCase } from '@/src/models/services/GetQuestionsService';
import { SubmitAnswersUseCase } from '@/src/models/services/SubmitAnswersService';
import ProgressBar from '@/src/components/ProgressBar.component';
import QuestionCard from '@/src/components/QuestionCard.component';
import QuizNavigation from '@/src/components/QuizNavigation.component';
import { useLocalSearchParams } from 'expo-router';
import { Course } from '@/src/models/interfaces/Course';
import { CourseData } from '@/src/data/CourseData';
import { TypeQuestion } from '@/src/models/enums/TypeQuestion';


const questionRepository = new QuestionRepository();
const getQuestionsUseCase = new GetQuestionsUseCase(questionRepository);
const submitAnswersUseCase = new SubmitAnswersUseCase(questionRepository);

interface QuizScreenProps {
    courseId: string;
    courseName: string;
    onComplete?: () => void;
}

export default function Quizz({courseId,courseName,onComplete}: QuizScreenProps) {

    const {id} = useLocalSearchParams();
    const cours: Course= CourseData.find(c => c.id === id)!;
    courseId = cours.id;
    courseName = cours.title;
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Map<string, string[]>>(new Map());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadQuestions();
    }, [courseId]);

    const loadQuestions = async () => {
        try {
        setLoading(true);
        const questionsData = await getQuestionsUseCase.execute(courseId);
        setQuestions(questionsData);
        } catch (error) {
        console.error('Error loading questions:', error);
        Alert.alert('Erreur', 'Impossible de charger les questions');
        } finally {
        setLoading(false);
        }
    };

    const currentQuestion = questions[currentIndex];
    const currentAnswers = answers.get(currentQuestion?.id) || [];

    const handleOptionSelect = (optionId: string) => {
        if (!currentQuestion) return;

        const newAnswers = new Map(answers);
        //const existingAnswers = newAnswers.get(currentQuestion.id) || [];

        if (currentQuestion.type === TypeQuestion.MULTIPLE) {
            // Pour choix unique, remplacer la sélection
            newAnswers.set(currentQuestion.id, [optionId]);
        } else {
            // Pour choix multiple, toggle
            /*if (existingAnswers.includes(optionId)) {
                newAnswers.set(
                currentQuestion.id,
                existingAnswers.filter(id => id !== optionId)
                );
            } else {
                newAnswers.set(currentQuestion.id, [...existingAnswers, optionId]);
            }*/
            console.log("question ouvert");
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
        'Voulez-vous soumettre vos réponses ?',
        [
            { text: 'Annuler', style: 'cancel' },
            {
            text: 'Soumettre',
            onPress: async () => {
                try {
                const submission = {
                    courseId,
                    answers: Array.from(answers.entries()).map(([questionId, selectedOptions]) => ({
                    questionId,
                    selectedOptions
                    })),
                    completedAt: new Date()
                };

                await submitAnswersUseCase.execute(submission);
                Alert.alert('Succès', 'Quiz soumis avec succès !', [
                    { text: 'OK', onPress: onComplete }
                ]);
                } catch (error) {
                Alert.alert('Erreur', 'Impossible de soumettre le quiz');
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
        <SafeAreaView style={styles.container}>
            <LoadingSpinner />
        </SafeAreaView>
        );
    }

    if (questions.length === 0) {
        return (
        <SafeAreaView style={styles.container}>
            <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucune question disponible</Text>
            </View>
        </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#6B4C9A" />

        <ProgressBar
            current={currentIndex + 1}
            total={questions.length}
            courseName={courseName}
            semester="Fin de semestre"
        />

        <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
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
        </SafeAreaView>
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