import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useQuizzDetails } from '../../presentation/hooks/useQuizzDetails';
import { useQuizzSubmission } from '../../presentation/hooks/useQuizzSubmission';
import { TypeQuestion, QuizzAnswer } from '../../domain/entities/Quizz';
import LoadingSpinner from '../../presentation/components/LoadingSpinner.component';
import { PrimaryButton } from '../../presentation/components/PrimaryButton';

export default function QuizDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { quizz, loading, error } = useQuizzDetails(id);
  const { submitQuizz, submitting } = useQuizzSubmission();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, string>>(new Map());

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner />
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
            onPress={() => router.back()}
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

  const handleSubmit = () => {
    // Vérifier que toutes les questions ont une réponse
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
              Alert.alert(
                'Succès',
                'Vos réponses ont été soumises avec succès !',
                [
                  {
                    text: 'OK',
                    onPress: () => router.replace('/(tabs)/quizzes' as any),
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{quizz.titre}</Text>
          <Text style={styles.headerSubtitle}>
            Question {currentQuestionIndex + 1} sur {quizz.Questions.length}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      {/* Question */}
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
              <TouchableOpacity
                style={styles.textInput}
                onPress={() => {
                  Alert.prompt(
                    'Votre réponse',
                    'Entrez votre réponse ci-dessous',
                    [
                      { text: 'Annuler', style: 'cancel' },
                      {
                        text: 'OK',
                        onPress: (text?: string) => text && handleAnswerChange(text),
                      },
                    ],
                    'plain-text',
                    currentAnswer
                  );
                }}
              >
                <Text
                  style={[
                    styles.textInputText,
                    !currentAnswer && styles.textInputPlaceholder,
                  ]}
                >
                  {currentAnswer || 'Appuyez pour répondre...'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Navigation */}
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
    alignItems: 'center',
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
    minHeight: 100,
  },
  textInputText: {
    fontSize: 16,
    color: '#1F2937',
  },
  textInputPlaceholder: {
    color: '#9CA3AF',
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
});
