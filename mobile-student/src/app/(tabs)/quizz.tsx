import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    TextInput,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuizzDetails } from '../../presentation/hooks/useQuizzDetails';
import { useQuizzSubmission } from '../../presentation/hooks/useQuizzSubmission';
import { useAvailableQuizzes } from '../../presentation/hooks/useAvailableQuizzes';
import { TypeQuestion, QuizzAnswer } from '../../domain/entities/Quizz';
import LoadingSpinner from '../../presentation/components/LoadingSpinner.component';
import { PrimaryButton } from '../../presentation/components/PrimaryButton';
import { useAuth } from '../../presentation/hooks/useAuth';
import { QuizCardSkeletonList } from '../../presentation/components/QuizCardSkeleton.component';
import { QuizDetailSkeleton } from '../../presentation/components/QuizDetailSkeleton.component';
import { ConfirmSubmitModal } from '@/src/presentation/components/ConfirmSubmitModal';

// Composant pour afficher la liste des quiz
function QuizListView() {
    const { quizzes, loading, error, reload } = useAvailableQuizzes();
    const { utilisateur } = useAuth();

    // Recharger les quiz quand on revient sur cette page
    React.useEffect(() => {
        console.log('🔄 Quiz list focused - reloading quizzes...');
        reload();
    }, []);

    // Grouper les quiz par statut
    const nouveaux = quizzes.filter(q => q.statutEtudiant === 'NOUVEAU');
    const enCours = quizzes.filter(q => q.statutEtudiant === 'EN_COURS');
    const termines = quizzes.filter(q => q.statutEtudiant === 'TERMINE');

    const handleQuizPress = (evaluation: any) => {
        const quizzId = evaluation.Quizz?.id;

        if (!quizzId) {
            Alert.alert('Erreur', 'Ce quiz n\'est pas encore disponible.');
            return;
        }

        if (evaluation.statutEtudiant === 'TERMINE') {
            Alert.alert('Quiz terminé', 'Vous avez déjà complété ce quiz.');
            return;
        }

        const coursNom = evaluation.Cours?.nom || evaluation.Cour?.nom || 'Cours';
        const message = evaluation.statutEtudiant === 'EN_COURS'
            ? 'Reprendre là où vous vous êtes arrêté ?'
            : 'Commencer ce quiz ?';

        Alert.alert(
            evaluation.titre,
            `${coursNom}\n\n${message}`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: evaluation.statutEtudiant === 'EN_COURS' ? 'Reprendre' : 'Commencer',
                    onPress: async () => {
                        // Sauvegarder l'ID du quiz en cours
                        await AsyncStorage.setItem('@current_quiz_id', quizzId);
                        router.push(`/(tabs)/quizz?id=${quizzId}`);
                    }
                }
            ]
        );
    };

    const renderQuizCard = (evaluation: any) => {
        const coursNom = evaluation.Cours?.nom || evaluation.Cour?.nom || 'Cours';
        const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
            NOUVEAU: { label: 'Nouveau', color: '#3B82F6', bgColor: '#DBEAFE' },
            EN_COURS: { label: 'En cours', color: '#F59E0B', bgColor: '#FEF3C7' },
            TERMINE: { label: 'Terminé', color: '#10B981', bgColor: '#D1FAE5' },
        };
        const status = statusConfig[evaluation.statutEtudiant || 'NOUVEAU'];

        return (
            <TouchableOpacity
                key={evaluation.id}
                style={styles.quizCard}
                onPress={() => handleQuizPress(evaluation)}
                disabled={evaluation.statutEtudiant === 'TERMINE'}
            >
                <View style={styles.quizCardHeader}>
                    <Text style={styles.quizCardTitle}>{evaluation.titre}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: status.bgColor }]}>
                        <Text style={[styles.statusText, { color: status.color }]}>
                            {status.label}
                        </Text>
                    </View>
                </View>
                <Text style={styles.quizCardSubtitle}>{coursNom}</Text>
                <View style={styles.quizCardFooter}>
                    <Text style={styles.quizCardDate}>
                        📅 Jusqu&apos;au {new Date(evaluation.dateFin).toLocaleDateString('fr-FR')}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={[]}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>📝 Mes Quizz</Text>
                {utilisateur && (
                    <Text style={styles.headerSubtitle}>
                        Bonjour {utilisateur.prenom} !
                    </Text>
                )}
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={reload} />
                }
            >
                {loading && quizzes.length === 0 ? (
                    <QuizCardSkeletonList count={3} />
                ) : error ? (
                    <View style={styles.errorContainer}>
                        <MaterialIcons name="error-outline" size={64} color="#DC2626" />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : quizzes.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <MaterialIcons name="quiz" size={64} color="#9CA3AF" />
                        <Text style={styles.emptyText}>
                            Aucun quiz disponible pour le moment.
                        </Text>
                    </View>
                ) : (
                    <>
                        {/* Quiz en cours */}
                        {enCours.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>
                                    ⏳ En cours ({enCours.length})
                                </Text>
                                {enCours.map(renderQuizCard)}
                            </View>
                        )}

                        {/* Nouveaux quiz */}
                        {nouveaux.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>
                                    ✨ Nouveaux ({nouveaux.length})
                                </Text>
                                {nouveaux.map(renderQuizCard)}
                            </View>
                        )}

                        {/* Quiz terminés */}
                        {termines.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>
                                    ✅ Terminés ({termines.length})
                                </Text>
                                {termines.map(renderQuizCard)}
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

// Composant pour afficher les détails d'un quiz
function QuizDetailView({ id }: { id: string }) {
    const { quizz, loading, error } = useQuizzDetails(id);
    const { submitQuizz, submitting } = useQuizzSubmission();

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Map<string, string>>(new Map());

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [unansweredCount, setUnansweredCount] = useState(0);

    // Sauvegarder l'ID du quiz en cours dans AsyncStorage
    React.useEffect(() => {
        if (id && !loading && !error) {
            AsyncStorage.setItem('@current_quiz_id', id).catch(err =>
                console.error('Erreur lors de la sauvegarde du quiz en cours:', err)
            );
        }
    }, [id, loading, error]);

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <QuizDetailSkeleton />
            </SafeAreaView>
        );
    }

    if (error || !quizz) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <MaterialIcons name="error-outline" size={64} color="#DC2626" />
                    <Text style={styles.errorText}>{error || 'Quizz non trouvé'}</Text>
                    <PrimaryButton
                        title="Retour"
                        onPress={() => router.push('/(tabs)/quizz')}
                        style={styles.backButton}
                    />
                </View>
            </SafeAreaView>
        );
    }

    const currentQuestion = quizz.Questions[currentQuestionIndex];
    const currentAnswer = answers.get(currentQuestion.id) || '';
    const isLastQuestion = currentQuestionIndex === quizz.Questions.length - 1;
    const progress = ((currentQuestionIndex + 1) / quizz.Questions.length) * 100;

    const handleAnswerChange = (answer: string) => {
        const newAnswers = new Map(answers);
        newAnswers.set(currentQuestion.id, answer);
        setAnswers(newAnswers);
    };

    const handleNext = () => {
        if (!currentAnswer) {
            Alert.alert('Attention', 'Veuillez répondre à la question avant de continuer');
            return;
        }

        if (isLastQuestion) {
            handleSubmit();
        } else {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    /*const handleSubmit = () => {
        const unansweredQuestions = quizz.Questions.filter(
            (q) => !answers.has(q.id)
        );

        if (unansweredQuestions.length > 0) {
            Alert.alert(
                'Questions non répondues',
                `Il reste ${unansweredQuestions.length} question(s) sans réponse. Voulez-vous quand même soumettre ?`,
                [
                    { text: 'Annuler', style: 'cancel' },
                    { text: 'Soumettre', onPress: confirmSubmit },
                ]
            );
        } else {
            confirmSubmit();
        }
    };*/

    const performSubmit = async () => {
    setShowConfirmModal(false);

    const reponses: QuizzAnswer[] = Array.from(answers.entries()).map(
        ([question_id, contenu]) => ({
        question_id,
        contenu,
        })
    );

    const success = await submitQuizz(id!, { reponses });

    if (success) {
        await AsyncStorage.removeItem('@current_quiz_id');

        Alert.alert(
        'Succès',
        'Vos réponses ont été soumises avec succès !',
        [
            {
            text: 'OK',
            onPress: () => router.replace('/(tabs)/accueil'),
            },
        ]
        );
    } else {
        Alert.alert(
        'Erreur',
        'Une erreur est survenue lors de la soumission.'
        );
    }
    };


    const handleSubmit = () => {
    const unanswered = quizz.Questions.filter(
        (q) => !answers.has(q.id)
    ).length;

    setUnansweredCount(unanswered);
    setShowConfirmModal(true);
    };


    const confirmSubmit = async () => {
        Alert.alert(
            'Confirmation',
            'Êtes-vous sûr de vouloir soumettre vos réponses ? Cette action est irréversible.',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Soumettre',
                    onPress: async () => {
                        const reponses: QuizzAnswer[] = Array.from(answers.entries()).map(
                            ([question_id, contenu]) => ({
                                question_id,
                                contenu,
                            })
                        );

                        const success = await submitQuizz(id!, { reponses });

                        if (success) {
                            // Supprimer le quiz en cours d'AsyncStorage
                            await AsyncStorage.removeItem('@current_quiz_id');
                            
                            Alert.alert(
                                'Succès',
                                'Vos réponses ont été soumises avec succès !',
                                [
                                    {
                                        text: 'OK',
                                        onPress: () => {
                                            // Rediriger vers l'accueil pour voir le statut mis à jour
                                            router.replace('/(tabs)/accueil');
                                        },
                                    },
                                ]
                            );
                        } else {
                            Alert.alert(
                                'Erreur',
                                'Une erreur est survenue lors de la soumission. Veuillez réessayer.'
                            );
                        }
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ConfirmSubmitModal
            visible={showConfirmModal}
            unansweredCount={unansweredCount}
            onCancel={() => setShowConfirmModal(false)}
            onConfirm={performSubmit}
            />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.push('/(tabs)/quizz')} style={styles.backIcon}>
                    <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>{quizz.titre}</Text>
                    <Text style={styles.headerSubtitle}>
                        Question {currentQuestionIndex + 1} sur {quizz.Questions.length}
                    </Text>
                </View>
            </View>

            <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                <View style={styles.questionCard}>
                    <View style={styles.questionHeader}>
                        <Text style={styles.questionNumber}>
                            Question {currentQuestionIndex + 1} sur {quizz.Questions.length}
                        </Text>
                        <View style={[
                            styles.typeBadge,
                            currentQuestion.typeQuestion === TypeQuestion.CHOIX_MULTIPLE
                                ? styles.typeBadgeMultiple
                                : styles.typeBadgeOpen
                        ]}>
                            <Text style={styles.typeBadgeText}>
                                {currentQuestion.typeQuestion === TypeQuestion.CHOIX_MULTIPLE
                                    ? 'Choix multiple'
                                    : 'Question Ouverte'}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.questionText}>{currentQuestion.enonce}</Text>

                    {currentQuestion.typeQuestion === TypeQuestion.CHOIX_MULTIPLE &&
                        currentQuestion.options ? (
                        <View style={styles.optionsContainer}>
                            {currentQuestion.options.map((option, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.optionButton,
                                        currentAnswer === option && styles.optionButtonSelected,
                                    ]}
                                    onPress={() => handleAnswerChange(option)}
                                >
                                    <View
                                        style={[
                                            styles.optionRadio,
                                            currentAnswer === option && styles.optionRadioSelected,
                                        ]}
                                    >
                                        {currentAnswer === option && (
                                            <View style={styles.optionRadioInner} />
                                        )}
                                    </View>
                                    <Text
                                        style={[
                                            styles.optionText,
                                            currentAnswer === option && styles.optionTextSelected,
                                        ]}
                                    >
                                        {option}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.textInputContainer}>
                            <Text style={styles.textInputLabel}>Votre réponse :</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Entrez votre réponse ici..."
                                placeholderTextColor="#9CA3AF"
                                value={currentAnswer}
                                onChangeText={handleAnswerChange}
                                multiline
                                numberOfLines={6}
                                textAlignVertical="top"
                            />
                        </View>
                    )}
                </View>
            </ScrollView>

            <View style={styles.navigation}>
                <TouchableOpacity
                    style={[
                        styles.navButton,
                        styles.navButtonSecondary,
                        currentQuestionIndex === 0 && styles.navButtonDisabled,
                    ]}
                    onPress={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                >
                    <MaterialIcons name="arrow-back" size={20} color="#3A5689" />
                    <Text style={styles.navButtonTextSecondary}>Précédent</Text>
                </TouchableOpacity>

                <PrimaryButton
                    title={isLastQuestion ? 'Soumettre' : 'Suivant'}
                    onPress={handleNext}
                    loading={submitting}
                    disabled={!currentAnswer || submitting}
                    style={styles.nextButton}
                />
            </View>
        </SafeAreaView>
    );
}

// Composant principal qui décide quelle vue afficher
export default function QuizScreen() {
    const params = useLocalSearchParams<{ id?: string }>();
    const paramId = params.id;
    const [currentQuizId, setCurrentQuizId] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(true);

    // Charger le quiz en cours depuis AsyncStorage
    React.useEffect(() => {
        const loadCurrentQuiz = async () => {
            try {
                const savedQuizId = await AsyncStorage.getItem('@current_quiz_id');
                if (savedQuizId) {
                    console.log('📦 Quiz en cours trouvé dans AsyncStorage:', savedQuizId);
                    setCurrentQuizId(savedQuizId);
                }
            } catch (error) {
                console.error('Erreur lors du chargement du quiz en cours:', error);
            } finally {
                setLoading(false);
            }
        };

        loadCurrentQuiz();
    }, []);

    // Si un ID est fourni en paramètre, l'utiliser en priorité
    const quizIdToDisplay = paramId || currentQuizId;

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <LoadingSpinner />
            </SafeAreaView>
        );
    }

    // Si un ID est disponible (paramètre ou AsyncStorage), afficher les détails du quiz
    if (quizIdToDisplay) {
        return <QuizDetailView id={quizIdToDisplay} />;
    }

    // Sinon, afficher la liste des quiz
    return <QuizListView />;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        backgroundColor: '#3A5689',
        paddingHorizontal: 16,
        paddingVertical: 16,
        flexDirection: 'row',
        //gap: 170,
        alignItems: 'center',
        height: 120,
        paddingTop: 75
    },
    backIcon: {
        marginRight: 12,
    },
    headerContent: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#E0E7FF',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 12,
    },
    quizCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    quizCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    quizCardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
        flex: 1,
        marginRight: 8,
    },
    quizCardSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 8,
    },
    quizCardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    quizCardDate: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    errorText: {
        fontSize: 16,
        color: '#DC2626',
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 24,
    },
    backButton: {
        minWidth: 120,
    },
    progressContainer: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    progressBar: {
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#3A5689',
        borderRadius: 4,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
    },
    questionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    questionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        flexWrap: 'wrap',
        gap: 8,
    },
    questionNumber: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    typeBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    typeBadgeMultiple: {
        backgroundColor: '#DBEAFE',
    },
    typeBadgeOpen: {
        backgroundColor: '#FEF3C7',
    },
    typeBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1F2937',
    },
    questionText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 24,
        lineHeight: 26,
    },
    optionsContainer: {
        gap: 12,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#E5E7EB',
    },
    optionButtonSelected: {
        backgroundColor: '#EEF2FF',
        borderColor: '#3A5689',
    },
    optionRadio: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#9CA3AF',
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionRadioSelected: {
        borderColor: '#3A5689',
    },
    optionRadioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#3A5689',
    },
    optionText: {
        flex: 1,
        fontSize: 16,
        color: '#374151',
    },
    optionTextSelected: {
        color: '#1F2937',
        fontWeight: '600',
    },
    textInputContainer: {
        marginTop: 8,
    },
    textInputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    textInput: {
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        padding: 16,
        minHeight: 120,
        fontSize: 16,
        color: '#1F2937',
    },
    navigation: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        gap: 12,
    },
    navButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        gap: 8,
    },
    navButtonSecondary: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#3A5689',
    },
    navButtonDisabled: {
        opacity: 0.4,
    },
    navButtonTextSecondary: {
        fontSize: 16,
        fontWeight: '600',
        color: '#3A5689',
    },
    nextButton: {
        flex: 1,
    },
});