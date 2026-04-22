import { useState, useEffect } from 'react';
import { QuizzHistory } from '../../domain/entities/QuizzHistory';
import DIContainer from '../../core/di/container';

/**
 * Hook personnalisé pour récupérer l'historique complet des quizz de l'étudiant.
 * Retourne tous les quizz terminés, tous établissements confondus.
 */
export const useQuizzHistory = () => {
  const [history, setHistory] = useState<QuizzHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const container = DIContainer.getInstance();
      const useCase = container.getQuizzHistoryUseCase;
      const data = await useCase.execute();
      setHistory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement de l'historique");
      console.error("Erreur lors du chargement de l'historique:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return { history, loading, error, reload: load };
};
