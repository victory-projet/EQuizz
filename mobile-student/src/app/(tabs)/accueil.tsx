import React, { useState } from 'react';
import { ScrollView, StyleSheet, StatusBar, View, Alert, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { useAvailableQuizzes } from '../../presentation/hooks/useAvailableQuizzes';
import { useAuth } from '../../presentation/hooks/useAuth';
import Header from '../../presentation/components/Header.component';
import { QuizzCard } from '../../presentation/components/QuizzCard';
import LoadingSpinner from '../../presentation/components/LoadingSpinner.component';
import { CourseCardSkeletonList } from '@/src/presentation/components/CourseCardSkeleton.component';

export default function Accueil() {
    const [searchQuery, setSearchQuery] = useState('');
    const { utilisateur } = useAuth();
    const { quizzes, loading, error, reload } = useAvailableQuizzes();

    // Recharger les quiz quand on revient sur cette page
    useFocusEffect(
        React.useCallback(() => {
            console.log('🔄 Accueil focused - reloading quizzes...');
            reload();
        }, [])
    );

    console.log('Accueil state:', {
        utilisateur: utilisateur ? {
            id: utilisateur.id,
            nom: utilisateur.nom,
            prenom: utilisateur.prenom,
            matricule: utilisateur.matricule,
            classe: utilisateur.Classe?.nom
        } : null,
        quizzes: quizzes.length,
        loading,
        error
    });

    console.log('📊 Quiz data:', quizzes);

    const filteredQuizzes = quizzes.filter(quiz => {
        const coursNom = quiz.Cours?.nom || quiz.Cour?.nom || '';
        return quiz.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
            coursNom.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const handleQuizPress = (evaluationId: string) => {
        const evaluation = quizzes.find(q => q.id === evaluationId);
        const coursNom = evaluation?.Cours?.nom || evaluation?.Cour?.nom || 'Cours';
        const quizzId = evaluation?.Quizz?.id;

        if (!quizzId) {
            Alert.alert('Erreur', 'Ce quiz n\'est pas encore disponible.');
            return;
        }

        // Si le quiz est déjà terminé, ne pas permettre de le refaire
        if (evaluation?.statutEtudiant === 'TERMINE') {
            Alert.alert('Quiz terminé', 'Vous avez déjà complété ce quiz.');
            return;
        }

        const message = evaluation?.statutEtudiant === 'EN_COURS'
            ? 'Reprendre là où vous vous êtes arrêté ?'
            : 'Commencer ce quiz ?';

        const buttonText = evaluation?.statutEtudiant === 'EN_COURS' ? 'Reprendre' : 'Commencer';

        Alert.alert(
            evaluation?.titre || 'Quiz',
            `${coursNom}\n\n${message}`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: buttonText,
                    // Navigation vers le quiz dans les tabs
                    onPress: async () => {
                        // Sauvegarder l'ID du quiz en cours
                        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
                        await AsyncStorage.setItem('@current_quiz_id', quizzId);
                        router.push(`/(tabs)/quizz?id=${quizzId}`);
                    }
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

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollViewContent}
            >
                {loading ? (
                    <CourseCardSkeletonList count={3} />
                ) : error ? (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : filteredQuizzes.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyTitle}>
                            {searchQuery ? '🔍 Aucun résultat' : '📚 Aucun quiz disponible'}
                        </Text>
                        <Text style={styles.emptyText}>
                            {searchQuery
                                ? 'Essayez avec d\'autres mots-clés'
                                : 'Aucune évaluation n\'est disponible pour le moment.\n\nRevenez plus tard ou contactez votre enseignant.'}
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
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#374151',
        textAlign: 'center',
        marginBottom: 12,
    },
    emptyText: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 24,
    },
    debugContainer: {
        marginTop: 32,
        padding: 16,
        backgroundColor: '#FEF3C7',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#F59E0B',
        alignSelf: 'stretch',
    },
    debugTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#92400E',
        marginBottom: 8,
    },
    debugText: {
        fontSize: 12,
        color: '#78350F',
        marginBottom: 4,
        fontFamily: 'monospace',
    },
});
