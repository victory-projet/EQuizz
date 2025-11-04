import { useState, useEffect } from 'react';
import { Evaluation } from '../../domain/entities/Evaluation';
import DIContainer from '../../core/di/container';

/**
 * Hook personnalisé pour récupérer les quizz disponibles
 */
export const useAvailableQuizzes = () => {
  const [quizzes, setQuizzes] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      const container = DIContainer.getInstance();
      const useCase = container.getAvailableQuizzesUseCase;
      const data = await useCase.execute();
      setQuizzes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des quizz');
      console.error('Erreur lors du chargement des quizz:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuizzes();
  }, []);

  return { quizzes, loading, error, reload: loadQuizzes };
};
