/**
 * Service de résolution des conflits de données
 * Gère les conflits entre données locales et serveur
 */
export class ConflictResolutionService {
  private static instance: ConflictResolutionService;

  public static getInstance(): ConflictResolutionService {
    if (!ConflictResolutionService.instance) {
      ConflictResolutionService.instance = new ConflictResolutionService();
    }
    return ConflictResolutionService.instance;
  }

  /**
   * Résout les conflits de données utilisateur
   */
  async resolveUserConflict(localData: any, serverData: any): Promise<any> {
    // Stratégie: Le serveur a toujours priorité pour les données utilisateur
    console.log('🔄 Résolution conflit utilisateur: serveur prioritaire');
    return serverData;
  }

  /**
   * Résout les conflits d'évaluations
   */
  async resolveEvaluationConflict(localData: any, serverData: any): Promise<any> {
    // Stratégie: Fusionner en gardant les données les plus récentes
    const localTime = new Date(localData.updated_at || localData.updatedAt);
    const serverTime = new Date(serverData.updated_at || serverData.updatedAt);
    
    console.log('🔄 Résolution conflit évaluation:', {
      local: localTime,
      server: serverTime,
      winner: serverTime > localTime ? 'server' : 'local'
    });
    
    return serverTime > localTime ? serverData : localData;
  }

  /**
   * Résout les conflits de soumissions
   */
  async resolveSubmissionConflict(localSubmission: any, serverResponse: any): Promise<'keep_local' | 'accept_server' | 'merge'> {
    // Stratégie: Toujours garder les soumissions locales non synchronisées
    if (localSubmission.synced === 0) {
      console.log('🔄 Conflit soumission: garder local (non synchronisé)');
      return 'keep_local';
    }
    
    console.log('🔄 Conflit soumission: accepter serveur');
    return 'accept_server';
  }
}