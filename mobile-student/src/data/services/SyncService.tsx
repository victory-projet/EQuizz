import * as SecureStore from 'expo-secure-store';
import { OfflineQuizRepository } from '../repositories/OfflineQuizRepository';
import { OfflineUserRepository } from '../repositories/OfflineUserRepository';
import { apiClient } from '../../core/api';
import { STORAGE_KEYS } from '../../core/constants';

/**
 * Service de synchronisation pour le mode offline/online
 * Gère le téléchargement et l'envoi des données
 */
export class SyncService {
  private static instance: SyncService;
  private quizzRepo: OfflineQuizRepository;
  private userRepo: OfflineUserRepository;
  private isSyncing = false;

  private constructor() {
    this.quizzRepo = new OfflineQuizRepository();
    this.userRepo = new OfflineUserRepository();
  }

  public static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  /**
   * Synchronise toutes les données (téléchargement + envoi)
   */
  async syncAll(): Promise<{ success: number; failed: number }> {
    if (this.isSyncing) {
      console.log('⏸️ Synchronisation déjà en cours, ignorée');
      return { success: 0, failed: 0 };
    }

    this.isSyncing = true;
    let totalSuccess = 0;
    let totalFailed = 0;

    try {
      console.log('🔄 Début de la synchronisation complète...');

      // 1. Télécharger les nouvelles données
      const downloadResult = await this.downloadAllData();
      if (downloadResult.success) {
        totalSuccess++;
      } else {
        totalFailed++;
      }

      // 2. Envoyer les soumissions en attente
      const uploadResult = await this.syncSubmissions();
      totalSuccess += uploadResult.success;
      totalFailed += uploadResult.failed;

      console.log(`✅ Synchronisation terminée: ${totalSuccess} succès, ${totalFailed} échecs`);
      
      return { success: totalSuccess, failed: totalFailed };
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation:', error);
      return { success: totalSuccess, failed: totalFailed + 1 };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Télécharge toutes les données depuis le serveur
   */
  async downloadAllData(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('📥 Téléchargement des données...');

      // Récupérer l'utilisateur connecté
      const userDataStr = await SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA);
      if (!userDataStr) {
        throw new Error('Aucun utilisateur connecté');
      }

      const userData = JSON.parse(userDataStr);
      const userId = userData.id;

      // 1. Télécharger les évaluations
      const evaluationsResponse = await apiClient.get('/evaluations');
      if (evaluationsResponse.data?.evaluations) {
        await this.quizzRepo.saveEvaluations(evaluationsResponse.data.evaluations);
        console.log(`📚 ${evaluationsResponse.data.evaluations.length} évaluations téléchargées`);
      }

      // 2. Télécharger les détails des quizz actifs
      const activeEvaluations = evaluationsResponse.data?.evaluations?.filter(
        (eval: any) => eval.status === 'active'
      ) || [];

      for (const evaluation of activeEvaluations) {
        try {
          const quizzResponse = await apiClient.get(`/evaluations/${evaluation.id}/quizz`);
          if (quizzResponse.data?.quizz) {
            await this.quizzRepo.saveQuizDetails(quizzResponse.data.quizz);
            
            if (quizzResponse.data.quizz.questions) {
              await this.quizzRepo.saveQuestions(quizzResponse.data.quizz.questions);
            }
          }
        } catch (error) {
          console.warn(`⚠️ Impossible de télécharger le quizz ${evaluation.id}:`, error);
        }
      }

      // 3. Mettre à jour les informations utilisateur
      try {
        const userResponse = await apiClient.get('/auth/me');
        if (userResponse.data) {
          await this.userRepo.saveUser(userResponse.data);
        }
      } catch (error) {
        console.warn('⚠️ Impossible de mettre à jour le profil utilisateur:', error);
      }

      return { success: true, message: 'Données téléchargées avec succès' };
    } catch (error: any) {
      console.error('❌ Erreur lors du téléchargement:', error);
      return { success: false, message: error.message || 'Erreur de téléchargement' };
    }
  }
  /**
   * Synchronise les soumissions en attente
   */
  async syncSubmissions(): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    try {
      const pendingSubmissions = await this.quizzRepo.getPendingSubmissions();
      
      if (pendingSubmissions.length === 0) {
        console.log('📤 Aucune soumission en attente');
        return { success: 0, failed: 0 };
      }

      console.log(`📤 Synchronisation de ${pendingSubmissions.length} soumission(s)...`);

      for (const submission of pendingSubmissions) {
        try {
          // Tenter d'envoyer la soumission
          const response = await apiClient.post(
            `/evaluations/quizz/${submission.quizz_id}/submit`,
            { reponses: submission.responses }
          );

          if (response.data) {
            // Marquer comme synchronisé
            await this.quizzRepo.markSubmissionAsSynced(submission.id);
            
            // Supprimer les réponses brouillons
            await this.quizzRepo.deleteAnswers(submission.quizz_id, submission.user_id);
            
            success++;
            console.log(`✅ Soumission ${submission.id} synchronisée`);
          }
        } catch (error: any) {
          // Si erreur 401, tenter de rafraîchir le token
          if (error.response?.status === 401) {
            console.log('🔄 Token expiré, tentative de refresh...');
            const newToken = await this.refreshTokenOffline();
            
            if (newToken) {
              // Réessayer avec le nouveau token
              try {
                const retryResponse = await apiClient.post(
                  `/evaluations/quizz/${submission.quizz_id}/submit`,
                  { reponses: submission.responses }
                );
                
                if (retryResponse.data) {
                  await this.quizzRepo.markSubmissionAsSynced(submission.id);
                  await this.quizzRepo.deleteAnswers(submission.quizz_id, submission.user_id);
                  success++;
                  console.log(`✅ Soumission ${submission.id} synchronisée après refresh`);
                  continue;
                }
              } catch (retryError) {
                console.error(`❌ Échec retry soumission ${submission.id}:`, retryError);
              }
            }
          }

          // Gérer l'échec
          failed++;
          await this.quizzRepo.incrementSubmissionRetries(
            submission.id,
            error.message || 'Erreur inconnue'
          );
          console.error(`❌ Échec soumission ${submission.id}:`, error.message);
        }
      }

      console.log(`📤 Synchronisation terminée: ${success} succès, ${failed} échecs`);
      return { success, failed };
    } catch (error) {
      console.error('❌ Erreur générale sync soumissions:', error);
      return { success, failed: failed + 1 };
    }
  }

  /**
   * Rafraîchit le token d'authentification pour la synchronisation offline
   */
  private async refreshTokenOffline(): Promise<string | null> {
    try {
      const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) {
        console.warn('⚠️ Aucun refresh token disponible pour la sync offline');
        return null;
      }

      console.log('🔄 Tentative de refresh token offline...');

      // Utiliser l'API client pour le refresh
      const response = await apiClient.post('/auth/refresh', { refreshToken });
      
      if (response.data?.token) {
        // Sauvegarder les nouveaux tokens
        await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, response.data.token);
        if (response.data.refreshToken) {
          await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, response.data.refreshToken);
        }
        
        console.log('✅ Token rafraîchi avec succès pour la sync');
        return response.data.token;
      }
    } catch (error) {
      console.error('❌ Échec du refresh token offline:', error);
      return null;
    }
  }
  /**
   * Récupère le statut de synchronisation
   */
  async getSyncStatus(): Promise<{
    pending: number;
    failed: number;
    lastSync: number | null;
  }> {
    try {
      const stats = await this.quizzRepo.getSyncStats();
      const lastSyncStr = await SecureStore.getItemAsync(STORAGE_KEYS.LAST_SYNC);
      
      return {
        pending: stats.pendingSubmissions,
        failed: stats.failedSubmissions,
        lastSync: lastSyncStr ? parseInt(lastSyncStr) : null
      };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du statut sync:', error);
      return { pending: 0, failed: 0, lastSync: null };
    }
  }

  /**
   * Définit l'heure de la dernière synchronisation
   */
  async setLastSyncTime(): Promise<void> {
    try {
      const now = Date.now().toString();
      await SecureStore.setItemAsync(STORAGE_KEYS.LAST_SYNC, now);
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde de l\'heure de sync:', error);
    }
  }

  /**
   * Nettoie les anciennes données
   */
  async cleanOldData(): Promise<void> {
    try {
      await this.quizzRepo.cleanupOldData();
      console.log('🧹 Nettoyage des données de synchronisation terminé');
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage:', error);
    }
  }

  /**
   * Vérifie si une synchronisation est en cours
   */
  get isCurrentlySyncing(): boolean {
    return this.isSyncing;
  }

  /**
   * Force l'arrêt de la synchronisation (pour les cas d'urgence)
   */
  forceStopSync(): void {
    this.isSyncing = false;
    console.log('🛑 Synchronisation forcée à s\'arrêter');
  }
}