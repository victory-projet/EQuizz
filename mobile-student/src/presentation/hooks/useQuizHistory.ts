import { useState, useEffect, useCallback } from 'react';
import { QuizHistoryEntry } from '../../domain/entities/QuizHistory';
import { GetQuizHistoryUseCase } from '../../domain/usecases/GetQuizHistoryUseCase';

let _useCase: GetQuizHistoryUseCase | null = null;
const getUseCase = () => {
  if (!_useCase) _useCase = new GetQuizHistoryUseCase();
  return _useCase;
};

/**
 * Hook pour récupérer et gérer l'historique des quizz soumis.
 * Combine les données locales (SQLite) et distantes (API).
 */
export const useQuizHistory = () => {
  const [history, setHistory] = useState<QuizHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const useCase = getUseCase();
      const data = await useCase.execute();
      setHistory(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors du chargement de l\'historique'
      );
      console.error('Erreur useQuizHistory:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return { history, loading, error, reload: loadHistory };
};
