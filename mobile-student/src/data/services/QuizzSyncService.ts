import NetInfo from '@react-native-community/netinfo';
import { OfflineQuizzDataSource } from '../datasources/OfflineQuizzDataSource';
import { QuizzDataSourceImpl } from '../datasources/QuizzDataSource';
import { quizzEventEmitter } from '../../core/services/QuizzEventEmitter';

/**
 * Service de synchronisation des soumissions de quizz hors ligne.
 *
 * - S'abonne aux changements de réseau via NetInfo
 * - Dès que la connexion revient, envoie toutes les soumissions en attente
 * - Émet un événement pour rafraîchir la liste des quizz après sync
 */
export class QuizzSyncService {
  private static instance: QuizzSyncService;

  private readonly offlineDS = new OfflineQuizzDataSource();
  private readonly remoteDS = new QuizzDataSourceImpl();
  private unsubscribe: (() => void) | null = null;
  private isSyncing = false;

  // Callbacks pour notifier l'UI (nombre de soumissions en attente, etc.)
  private onSyncStart?: () => void;
  private onSyncEnd?: (synced: number, failed: number) => void;

  private constructor() {}

  static getInstance(): QuizzSyncService {
    if (!QuizzSyncService.instance) {
      QuizzSyncService.instance = new QuizzSyncService();
    }
    return QuizzSyncService.instance;
  }

  /**
   * Démarre l'écoute du réseau.
   * À appeler une seule fois au démarrage de l'app (dans _layout.tsx).
   */
  start(callbacks?: {
    onSyncStart?: () => void;
    onSyncEnd?: (synced: number, failed: number) => void;
  }): void {
    if (callbacks) {
      this.onSyncStart = callbacks.onSyncStart;
      this.onSyncEnd = callbacks.onSyncEnd;
    }

    this.unsubscribe = NetInfo.addEventListener((state) => {
      const online =
        state.isConnected === true && state.isInternetReachable !== false;
      if (online) {
        this.syncPendingSubmissions();
      }
    });

    console.log('✅ QuizzSyncService démarré');
  }

  stop(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
  }

  /**
   * Envoie au serveur toutes les soumissions en attente.
   * Peut être appelé manuellement (ex: bouton "Réessayer").
   */
  async syncPendingSubmissions(): Promise<{ synced: number; failed: number }> {
    if (this.isSyncing) return { synced: 0, failed: 0 };
    this.isSyncing = true;

    const pending = await this.offlineDS.getPendingSubmissions();
    if (pending.length === 0) {
      this.isSyncing = false;
      return { synced: 0, failed: 0 };
    }

    console.log(`🔄 Synchronisation de ${pending.length} soumission(s)...`);
    this.onSyncStart?.();

    let synced = 0;
    let failed = 0;

    for (const item of pending) {
      // Ignorer les soumissions ayant trop échoué (max 5 tentatives)
      if (item.retryCount >= 5) {
        failed++;
        continue;
      }

      try {
        await this.remoteDS.submitAnswers(item.quizzId, item.submission);
        await this.offlineDS.markSubmissionSynced(item.id);
        synced++;
        console.log(`✅ Soumission ${item.id} synchronisée`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await this.offlineDS.markSubmissionError(item.id, msg);
        failed++;
        console.warn(`❌ Échec synchronisation ${item.id}:`, msg);
      }
    }

    if (synced > 0) {
      // Recharger la liste des quizz pour refléter les statuts mis à jour
      quizzEventEmitter.emit();
    }

    this.onSyncEnd?.(synced, failed);
    this.isSyncing = false;

    console.log(`✅ Sync terminée: ${synced} OK, ${failed} échec(s)`);
    return { synced, failed };
  }

  async hasPendingSubmissions(): Promise<boolean> {
    return this.offlineDS.hasPendingSubmissions();
  }
}
