import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAvailableQuizzes } from '../../presentation/hooks/useAvailableQuizzes';
import LoadingSpinner from '../../presentation/components/LoadingSpinner.component';
import { useAuth } from '../../presentation/hooks/useAuth';

const CURRENT_QUIZ_KEY = '@current_quiz_state';
const COMPLETED_QUIZZES_KEY = '@completed_quizzes';

interface QuizState {
  quizId: string;
  currentIndex: number;
  answers: [string, string[]][];
  timestamp: string;
}

export default function QuizzesScreen() {
  const { quizzes, loading, error, reload } = useAvailableQuizzes();
  const { utilisateur } = useAuth();
  const [currentQuiz, setCurrentQuiz] = useState<QuizState | null>(null);
  const [completedQuizzes, setCompletedQuizzes] = useState<string[]>([]);
  const [loadingState, setLoadingState] = useState(true);

  // Charger l'état du quiz en cours et les quiz terminés
  const loadQuizState = async () => {
    try {
      const [currentQuizData, completedData] = await Promise.all([
        AsyncStorage.getItem(CURRENT_QUIZ_KEY),
        AsyncStorage.getItem(COMPLETED_QUIZZES_KEY)
      ]);

      if (currentQuizData) {
        setCurrentQuiz(JSON.parse(currentQuizData));
      }

      if (completedData) {
        setCompletedQuizzes(JSON.parse(completedData));
      }
    } catch (error) {
      console.error('Error loading quiz state:', error);
    } finally {
      setLoadingState(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadQuizState();
    }, [])
  );

  const handleContinueQuiz = () => {
    if (currentQuiz) {
      router.push(`/quiz/${currentQuiz.quizId}` as any);
    }
  };

  // Filtrer les quiz disponibles (exclure ceux qui sont terminés)
  const availableQuizzes = quizzes.filter(quiz => !completedQuizzes.includes(quiz.id));

  // Trouver les détails du quiz en cours
  const currentQuizDetails = currentQuiz
    ? quizzes.find(q => q.id === currentQuiz.quizId)
    : null;

  console.log('Quiz state:', {
    currentQuiz,
    currentQuizDetails,
    quizzes: quizzes.length,
    loading,
    loadingState,
    error
  });

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📝 Quizz</Text>
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
          <RefreshControl refreshing={loading} onRefresh={() => {
            reload();
            loadQuizState();
          }} />
        }
      >
        {(loading && quizzes.length === 0) || loadingState ? (
          <LoadingSpinner />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <>
            {/* Quiz en cours */}
            {currentQuiz && currentQuizDetails ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quiz en cours</Text>
                <TouchableOpacity
                  style={styles.currentQuizCard}
                  onPress={handleContinueQuiz}
                >
                  <View style={styles.currentQuizHeader}>
                    <Text style={styles.currentQuizTitle}>
                      {currentQuizDetails.titre}
                    </Text>
                    <View style={styles.inProgressBadge}>
                      <Text style={styles.inProgressText}>En cours</Text>
                    </View>
                  </View>
                  <Text style={styles.currentQuizSubtitle}>
                    {currentQuizDetails.Cours?.nom || 'Matière'}
                  </Text>
                  <Text style={styles.continueText}>
                    Appuyez pour continuer →
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* Message si aucun quiz en cours */
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {completedQuizzes.length > 0
                    ? 'Vous avez terminé tous les quiz disponibles.\n\nCommencez un nouveau quiz depuis l\'onglet Accueil.'
                    : 'Aucun quiz en cours.\n\nCommencez un quiz depuis l\'onglet Accueil.'}
                </Text>
              </View>
            )}
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
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
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
  currentQuizCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#7C3AED',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentQuizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  currentQuizTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  currentQuizSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  inProgressBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  inProgressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
  },
  continueText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C3AED',
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
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center',
  },
});
