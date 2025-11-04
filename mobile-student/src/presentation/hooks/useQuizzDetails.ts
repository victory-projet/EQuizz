import { useState, useEffect } from 'react';
import { Quizz } from '../../domain/entities/Quizz';
import DIContainer from '../../core/di/container';

/**
 * Hook personnalisé pour récupérer le détail d'un quizz
 */
export const useQuizzDetails = (quizzId: string | undefined) => {
  const [quizz, setQuizz] = useState<Quizz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!quizzId) {
      setLoading(false);
      return;
    }

    const loadQuizz = async () => {
      try {
        setLoading(true);
        setError(null);
        const container = DIContainer.getInstance();
        const useCase = container.getQuizzDetailsUseCase;
        const data = await useCase.execute(quizzId);
        setQuizz(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement du quizz');
        console.error('Erreur lors du chargement du quizz:', err);
      } finally {
        setLoading(false);
      }
    };

    loadQuizz();
  }, [quizzId]);

  return { quizz, loading, error };
};
