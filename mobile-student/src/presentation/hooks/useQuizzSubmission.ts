import { useState } from 'react';
import { QuizzSubmission } from '../../domain/entities/Quizz';
import DIContainer from '../../core/di/container';

/**
 * Hook personnalisé pour soumettre les réponses d'un quizz
 */
export const useQuizzSubmission = () => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitQuizz = async (quizzId: string, submission: QuizzSubmission): Promise<boolean> => {
    try {
      setSubmitting(true);
      setError(null);
      const container = DIContainer.getInstance();
      const useCase = container.submitQuizzAnswersUseCase;
      await useCase.execute(quizzId, submission);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la soumission';
      setError(errorMessage);
      console.error('Erreur lors de la soumission:', err);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return { submitQuizz, submitting, error };
};
