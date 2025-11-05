import React, { useState } from 'react';
import { ScrollView, StyleSheet, StatusBar, View, Alert, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAvailableQuizzes } from '../../presentation/hooks/useAvailableQuizzes';
import { useEvaluationPeriod } from '../../presentation/hooks/useEvaluationPeriod';
import { useAuth } from '../../presentation/hooks/useAuth';
import Header from '../../presentation/components/Header.component';
import PeriodBanner from '../../presentation/components/PeriodBanner.component';
import { QuizzCard } from '../../presentation/components/QuizzCard';
import LoadingSpinner from '../../presentation/components/LoadingSpinner.component';

export default function Accueil() {
    const [searchQuery, setSearchQuery] = useState('');
    const { utilisateur } = useAuth();
    const { quizzes, loading: quizzesLoading, error: quizzesError } = useAvailableQuizzes();
    const { period, loading: periodLoading, error: periodError } = useEvaluationPeriod();

    // Seul le chargement des quiz est bloquant
    const loading = quizzesLoading;
    const error = quizzesError; // L'erreur de période n'est pas bloquante

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
        quizzesError,
        periodError,
        periodLoading
    });

    console.log('📊 Quiz data:', quizzes);

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

            {period && !periodError && <PeriodBanner period={period} />}

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
                        <Text style={styles.emptyTitle}>
                            {searchQuery ? '🔍 Aucun résultat' : '📚 Aucun quiz disponible'}
                        </Text>
                        <Text style={styles.emptyText}>
                            {searchQuery 
                                ? 'Essayez avec d\'autres mots-clés' 
                                : 'Aucune évaluation n\'est disponible pour le moment.\n\nRevenez plus tard ou contactez votre enseignant.'}
                        </Text>
                        
                        {/* Debug Info */}
                        {utilisateur && (
                            <View style={styles.debugContainer}>
                                <Text style={styles.debugTitle}>🔍 Informations de debug :</Text>
                                <Text style={styles.debugText}>
                                    Utilisateur : {utilisateur.prenom} {utilisateur.nom}
                                </Text>
                                <Text style={styles.debugText}>
                                    Matricule : {utilisateur.matricule || 'Non défini'}
                                </Text>
                                <Text style={styles.debugText}>
                                    Classe : {utilisateur.Classe?.nom || 'Non définie'}
                                </Text>
                                <Text style={styles.debugText}>
                                    Niveau : {utilisateur.Classe?.Niveau?.nom || 'Non défini'}
                                </Text>
                                <Text style={styles.debugText}>
                                    Quiz chargés : {quizzes.length}
                                </Text>
                                <Text style={styles.debugText}>
                                    Erreur : {quizzesError || 'Aucune'}
                                </Text>
                            </View>
                        )}
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
