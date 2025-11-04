import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAvailableQuizzes } from '../../presentation/hooks/useAvailableQuizzes';
import { QuizzCard } from '../../presentation/components/QuizzCard';
import LoadingSpinner from '../../presentation/components/LoadingSpinner.component';
import { useAuth } from '../../presentation/hooks/useAuth';

export default function QuizzesScreen() {
  const { quizzes, loading, error, reload } = useAvailableQuizzes();
  const { utilisateur } = useAuth();

  const handleQuizzPress = (quizzId: string) => {
    router.push(`/quiz/${quizzId}` as any);
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
          <LoadingSpinner />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : quizzes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Aucun quizz disponible pour le moment
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>
              {quizzes.length} quizz{quizzes.length > 1 ? 's' : ''} disponible{quizzes.length > 1 ? 's' : ''}
            </Text>
            {quizzes.map((evaluation) => (
              <QuizzCard
                key={evaluation.id}
                evaluation={evaluation}
                onPress={handleQuizzPress}
              />
            ))}
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
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
