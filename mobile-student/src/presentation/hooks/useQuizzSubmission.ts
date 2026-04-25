import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import DIContainer from '../../core/di/container';
import { quizzEventEmitter } from '../../core/services/QuizzEventEmitter';
import { QuizzSubmission } from '../../domain/entities/Quizz';
import { QuizzSyncService } from '../../data/services/QuizzSyncService';
import { OfflineQuizzDataSource } from '../../data/datasources/OfflineQuizzDataSource';

/**
 * Hook pour soumettre les réponses d'un quizz.
 *
 * - Si online  → envoi immédiat à l'API
 * - Si offline → enregistrement local + sync automatique au retour en ligne
 *
 * Retourne aussi :
 *  - isOnline     : état de la connexion courante
 *  - pendingCount : nombre de soumissions en attente de sync
 *  - syncNow()    : forcer la synchronisation manuelle
 */
export const useQuizzSubmission = () => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // Surveiller le réseau
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online =
        state.isConnected === true && state.isInternetReachable !== false;
      setIsOnline(online);
    });

    NetInfo.fetch().then((state) => {
      setIsOnline(
        state.isConnected === true && state.isInternetReachable !== false,
      );
    });

    return () => unsubscribe();
  }, []);

  // Compter les soumissions en attente
  const refreshPendingCount = async () => {
    try {
      const ds = new OfflineQuizzDataSource();
      const pending = await ds.getPendingSubmissions();
      setPendingCount(pending.length);
    } catch {
      setPendingCount(0);
    }
  };

  useEffect(() => {
    refreshPendingCount();
  }, []);

  /**
   * Soumet les réponses du quizz.
   * @returns { success, offline }
   *   offline=true  → sauvegardé localement, sera synchronisé plus tard
   *   offline=false → envoyé directement au serveur
   */
  const submitQuizz = async (
    quizzId: string,
    submission: QuizzSubmission,
    evaluationId?: string,
    userId?: string,
  ): Promise<{ success: boolean; offline: boolean }> => {
    try {
      setSubmitting(true);
      setError(null);

      const state = await NetInfo.fetch();
      const currentOnline = state.isConnected === true && state.isInternetReachable !== false;

      const container = DIContainer.getInstance();
      const useCase = container.submitQuizzAnswersUseCase;

      await useCase.execute(quizzId, submission, { evaluationId, userId });

      quizzEventEmitter.emit();
      await refreshPendingCount();

      return { success: true, offline: !currentOnline };
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Erreur lors de la soumission';
      setError(msg);
      console.error('Erreur lors de la soumission:', err);
      return { success: false, offline: false };
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Forcer la synchronisation des soumissions en attente.
   */
  const syncNow = async (): Promise<{ synced: number; failed: number }> => {
    setIsSyncing(true);
    try {
      const result =
        await QuizzSyncService.getInstance().syncPendingSubmissions();
      await refreshPendingCount();
      return result;
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    submitQuizz,
    submitting,
    error,
    isOnline,
    pendingCount,
    isSyncing,
    syncNow,
  };
};
