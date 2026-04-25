import { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";
import DIContainer from "../../core/di/container";
import { quizzEventEmitter } from "../../core/services/QuizzEventEmitter";
import { Evaluation } from "../../domain/entities/Evaluation";

export const useAvailableQuizzes = () => {
  const [quizzes, setQuizzes] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected === true && state.isInternetReachable !== false);
    });
    NetInfo.fetch().then((state) => {
      setIsOnline(state.isConnected === true && state.isInternetReachable !== false);
    });
    return () => unsub();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      const container = DIContainer.getInstance();
      const useCase = container.getAvailableQuizzesUseCase;
      const data = await useCase.execute();
      setQuizzes(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement des quizz",
      );
      console.error("Erreur lors du chargement des quizz:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuizzes();
    const unsubscribe = quizzEventEmitter.subscribe(() => {
      loadQuizzes();
    });
    return unsubscribe;
  }, []);

  return { quizzes, loading, error, isOnline, reload: loadQuizzes };
};
