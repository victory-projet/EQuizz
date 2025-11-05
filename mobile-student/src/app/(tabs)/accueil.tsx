import React, { useState } from 'react';
import { ScrollView, StyleSheet, StatusBar, View, Alert, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAvailableQuizzes } from '../../presentation/hooks/useAvailableQuizzes';
import { useEvaluationPeriod } from '../../presentation/hooks/useEvaluationPeriod';
import Header from '../../presentation/components/Header.component';
import PeriodBanner from '../../presentation/components/PeriodBanner.component';
import { QuizzCard } from '../../presentation/components/QuizzCard';
import LoadingSpinner from '../../presentation/components/LoadingSpinner.component';

export default function Accueil() {
    const [searchQuery, setSearchQuery] = useState('');
    const { quizzes, loading: quizzesLoading, error: quizzesError } = useAvailableQuizzes();
    const { period, loading: periodLoading, error: periodError } = useEvaluationPeriod();

    const loading = quizzesLoading || periodLoading;
    const error = quizzesError || periodError;

    console.log('Accueil state:', {
        quizzes: quizzes.length,
        loading,
        quizzesError,
        periodError
    });

    const filteredQuizzes = quizzes.filter(quiz =>
        quiz.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quiz.Cours.nom.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleQuizPress = (quizId: string) => {
        const quiz = quizzes.find(q => q.id === quizId);
        Alert.alert(
            'Démarrer le quiz',
            `${quiz?.titre}\n${quiz?.Cours.nom}`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Commencer',
                    onPress: () => router.push(`/quiz/${quizId}` as any)
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
                ) : error ? (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : filteredQuizzes.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            {searchQuery ? 'Aucun quiz trouvé' : 'Aucun quiz disponible'}
                        </Text>
                    </View>
                ) : (
                    <>
                        <Text style={styles.sectionTitle}>
                            {filteredQuizzes.length} quiz disponible{filteredQuizzes.length > 1 ? 's' : ''}
                        </Text>
                        {filteredQuizzes.map((quiz) => (
                            <QuizzCard
                                key={quiz.id}
                                evaluation={quiz}
                                onPress={handleQuizPress}
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
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#DC2626',
        textAlign: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
    },
});
