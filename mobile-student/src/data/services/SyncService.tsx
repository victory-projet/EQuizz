import * as SecureStore from 'expo-secure-store';
import { OfflineQuizRepository } from '../repositories/OfflineQuizRepository';
import { OfflineUserRepository } from '../repositories/OfflineUserRepository';
import { apiClient } from '../../core/api';
import { STORAGE_KEYS } from '../../core/constants';

/**
 * Service de synchronisation amélioré pour le mode offline/online
 * Gère la synchronisation automatique, la queue de tâches et la gestion des conflits
 */
export class SyncService {
  private static instance: SyncService;
  private quizzRepo: OfflineQuizRepository;
  private userRepo: OfflineUserRepository;
  private isSyncing = false;
  private syncQueue: Array<{ type: string; data: any; priority: number; retries: number }> = [];
  private lastSyncAttempt = 0;
  private minSyncInterval = 30000; // 30 secondes minimum entre syncs
  private maxRetries = 3;
  private autoSyncInterval: any = null;

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
   * Démarre la synchronisation automatique
   */
  async startAutoSync(): Promise<void> {
    console.log('🚀 Démarrage de la synchronisation automatique...');
    
    // Synchronisation immédiate
    this.scheduleSync(0);
    
    // Synchronisation périodique toutes les 3 minutes
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval);
    }
    
    this.autoSyncInterval = setInterval(() => {
      this.scheduleSync(1); // Priorité normale
    }, 3 * 60 * 1000);
  }

  /**
   * Arrête la synchronisation automatique
   */
  stopAutoSync(): void {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval);
      this.autoSyncInterval = null;
    }
    console.log('🛑 Synchronisation automatique arrêtée');
  }

  /**
   * Planifie une synchronisation avec gestion de la priorité
   */
  private scheduleSync(priority: number = 1): void {
    const now = Date.now();
    
    // Respecter l'intervalle minimum
    if (now - this.lastSyncAttempt < this.minSyncInterval) {
      console.log('⏸️ Sync trop récente, reportée');
      return;
    }

    // Ajouter à la queue si pas déjà en cours
    if (!this.isSyncing) {
      this.addToSyncQueue('full_sync', {}, priority);
      this.processSyncQueue();
    }
  }
  /**
   * Ajoute une tâche à la queue de synchronisation
   */
  private addToSyncQueue(type: string, data: any, priority: number = 1): void {
    // Éviter les doublons
    const exists = this.syncQueue.find(item => 
      item.type === type && JSON.stringify(item.data) === JSON.stringify(data)
    );
    
    if (!exists) {
      this.syncQueue.push({ type, data, priority, retries: 0 });
      // Trier par priorité (0 = haute, 1 = normale, 2 = basse)
      this.syncQueue.sort((a, b) => a.priority - b.priority);
    }
  }

  /**
   * Traite la queue de synchronisation
   */
  private async processSyncQueue(): Promise<void> {
    if (this.isSyncing || this.syncQueue.length === 0) {
      return;
    }

    this.isSyncing = true;
    this.lastSyncAttempt = Date.now();

    try {
      while (this.syncQueue.length > 0) {
        const task = this.syncQueue.shift();
        if (!task) continue;

        console.log(`🔄 Traitement tâche sync: ${task.type} (priorité: ${task.priority}, tentative: ${task.retries + 1})`);
        
        try {
          await this.executeTask(task);
        } catch (error) {
          console.error(`❌ Erreur tâche ${task.type}:`, error);
          
          // Remettre en queue avec retry si pas trop de tentatives
          if (task.retries < this.maxRetries) {
            task.retries++;
            task.priority = Math.min(task.priority + 1, 2); // Diminuer la priorité
            this.syncQueue.push(task);
            this.syncQueue.sort((a, b) => a.priority - b.priority);
          } else {
            console.error(`❌ Tâche ${task.type} abandonnée après ${this.maxRetries} tentatives`);
          }
        }
      }
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Exécute une tâche de synchronisation
   */
  private async executeTask(task: { type: string; data: any; priority: number; retries: number }): Promise<void> {
    switch (task.type) {
      case 'full_sync':
        await this.performFullSync();
        break;
      case 'upload_submission':
        await this.syncSingleSubmission(task.data.submissionId);
        break;
      case 'download_data':
        await this.downloadAllData();
        break;
      case 'sync_profile':
        await this.syncUserProfile();
        break;
      default:
        console.warn(`⚠️ Type de tâche inconnu: ${task.type}`);
    }
  }
  /**
   * Synchronisation complète (méthode principale)
   */
  private async performFullSync(): Promise<{ success: number; failed: number }> {
    let totalSuccess = 0;
    let totalFailed = 0;

    try {
      console.log('🔄 Début de la synchronisation complète...');

      // 1. Vérifier la connectivité réseau
      const isOnline = await this.checkNetworkConnectivity();
      if (!isOnline) {
        console.log('📵 Pas de connexion réseau, sync reportée');
        return { success: 0, failed: 0 };
      }

      // 2. Synchroniser les soumissions en priorité (upload)
      const uploadResult = await this.syncSubmissions();
      totalSuccess += uploadResult.success;
      totalFailed += uploadResult.failed;

      // 3. Télécharger les nouvelles données
      const downloadResult = await this.downloadAllData();
      if (downloadResult.success) {
        totalSuccess++;
      } else {
        totalFailed++;
      }

      // 4. Synchroniser le profil utilisateur
      try {
        await this.syncUserProfile();
        totalSuccess++;
      } catch (error) {
        console.warn('⚠️ Erreur sync profil:', error);
        totalFailed++;
      }

      // 5. Nettoyer les anciennes données
      await this.cleanOldData();

      console.log(`✅ Synchronisation terminée: ${totalSuccess} succès, ${totalFailed} échecs`);
      
      // Mettre à jour l'heure de dernière sync si succès
      if (totalSuccess > 0) {
        await this.setLastSyncTime();
      }
      
      return { success: totalSuccess, failed: totalFailed };
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation:', error);
      return { success: totalSuccess, failed: totalFailed + 1 };
    }
  }

  /**
   * Synchronise toutes les données (interface publique)
   */
  async syncAll(): Promise<{ success: number; failed: number }> {
    if (this.isSyncing) {
      console.log('⏸️ Synchronisation déjà en cours, ignorée');
      return { success: 0, failed: 0 };
    }

    return await this.performFullSync();
  }

  /**
   * Vérifie la connectivité réseau
   */
  private async checkNetworkConnectivity(): Promise<boolean> {
    try {
      // Test simple de connectivité avec timeout court
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${apiClient.defaults.baseURL}/health`, {
        method: 'HEAD',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.log('📵 Test connectivité échoué, tentative avec endpoint auth:', error);
      
      // Fallback: tester avec un endpoint connu
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch(`${apiClient.defaults.baseURL}/auth/refresh`, {
          method: 'HEAD',
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        return true; // Même si 401, le serveur répond
      } catch (fallbackError) {
        console.log('📵 Connectivité complètement échouée');
        return false;
      }
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

      // 1. Télécharger les évaluations
      const evaluationsResponse = await apiClient.get('/evaluations');
      if (evaluationsResponse.data?.evaluations) {
        await this.quizzRepo.saveEvaluations(evaluationsResponse.data.evaluations);
        console.log(`📚 ${evaluationsResponse.data.evaluations.length} évaluations téléchargées`);
      }

      // 2. Télécharger les détails des quizz actifs
      const activeEvaluations = evaluationsResponse.data?.evaluations?.filter(
        (evaluation: any) => evaluation.status === 'active'
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
   * Synchronise le profil utilisateur
   */
  private async syncUserProfile(): Promise<void> {
    try {
      const userResponse = await apiClient.get('/auth/me');
      if (userResponse.data) {
        await this.userRepo.saveUser(userResponse.data);
        console.log('👤 Profil utilisateur synchronisé');
      }
    } catch (error) {
      console.error('❌ Erreur sync profil utilisateur:', error);
      // Ne pas throw l'erreur pour ne pas bloquer la sync complète
    }
  }

  /**
   * Synchronise une soumission spécifique
   */
  private async syncSingleSubmission(submissionId: number): Promise<boolean> {
    try {
      const submissions = await this.quizzRepo.getPendingSubmissions();
      const submission = submissions.find(s => s.id === submissionId);
      
      if (!submission) {
        console.warn(`⚠️ Soumission ${submissionId} non trouvée`);
        return false;
      }

      const response = await apiClient.post(
        `/evaluations/quizz/${submission.quizz_id}/submit`,
        { reponses: submission.responses }
      );

      if (response.data) {
        await this.quizzRepo.markSubmissionAsSynced(submission.id);
        await this.quizzRepo.deleteAnswers(submission.quizz_id, submission.user_id);
        console.log(`✅ Soumission ${submissionId} synchronisée`);
        return true;
      }
      
      return false;
    } catch (error: any) {
      // Gestion spéciale pour erreur 401
      if (error.response?.status === 401) {
        const refreshed = await this.refreshTokenOffline();
        if (refreshed) {
          // Réessayer une fois
          return await this.syncSingleSubmission(submissionId);
        }
      }
      
      console.error(`❌ Erreur sync soumission ${submissionId}:`, error);
      throw error;
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
      
      return null;
    } catch (error) {
      console.error('❌ Échec du refresh token offline:', error);
      return null;
    }
  }
  /**
   * Ajoute une soumission à la queue de synchronisation
   */
  async queueSubmissionForSync(
    quizzId: string, 
    evaluationId: string, 
    userId: string, 
    responses: any[]
  ): Promise<void> {
    try {
      // Sauvegarder la soumission localement
      await this.quizzRepo.saveSubmission(quizzId, evaluationId, userId, responses);
      
      // Ajouter à la queue de sync avec haute priorité
      this.addToSyncQueue('upload_submission', { quizzId, evaluationId, userId }, 0);
      
      // Traiter immédiatement si en ligne
      const isOnline = await this.checkNetworkConnectivity();
      if (isOnline) {
        this.processSyncQueue();
      }
      
      console.log('📤 Soumission ajoutée à la queue de synchronisation');
    } catch (error) {
      console.error('❌ Erreur ajout soumission à la queue:', error);
      throw error;
    }
  }

  /**
   * Force une synchronisation immédiate (usage interne uniquement)
   */
  private async forceSyncNow(): Promise<{ success: number; failed: number }> {
    console.log('🚀 Synchronisation automatique déclenchée...');
    
    // Vider la queue actuelle et ajouter une sync haute priorité
    this.syncQueue = [];
    this.addToSyncQueue('full_sync', {}, 0);
    
    // Traiter immédiatement
    await this.processSyncQueue();
    
    return await this.performFullSync();
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
    this.stopAutoSync();
    console.log('🛑 Synchronisation forcée à s\'arrêter');
  }

  /**
   * Obtient les statistiques de la queue de synchronisation
   */
  getSyncQueueStats(): { total: number; highPriority: number; failed: number } {
    const total = this.syncQueue.length;
    const highPriority = this.syncQueue.filter(task => task.priority === 0).length;
    const failed = this.syncQueue.filter(task => task.retries >= this.maxRetries).length;
    
    return { total, highPriority, failed };
  }

  /**
   * Déclenche une synchronisation automatique sur reconnexion réseau
   */
  async triggerNetworkSync(): Promise<void> {
    console.log('📡 Déclenchement sync automatique (reconnexion réseau)...');
    
    // Ajouter une tâche de sync avec haute priorité
    this.addToSyncQueue('full_sync', {}, 0);
    
    // Traiter la queue
    this.processSyncQueue();
  }

  /**
   * Déclenche une synchronisation automatique au retour en premier plan
   */
  async triggerForegroundSync(): Promise<void> {
    console.log('📱 Déclenchement sync automatique (premier plan)...');
    
    // Vérifier si une sync est nécessaire (dernière sync > 5 minutes)
    const status = await this.getSyncStatus();
    const now = Date.now();
    
    if (!status.lastSync || (now - status.lastSync) > 5 * 60 * 1000) {
      this.addToSyncQueue('full_sync', {}, 1);
      this.processSyncQueue();
    }
  }
}