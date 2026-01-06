import { SQLiteDatabase } from '../database/SQLiteDatabase';

/**
 * Stratégies de résolution de conflits
 */
export type ConflictStrategy = 'last-write-wins' | 'server-priority' | 'local-priority' | 'manual';

/**
 * Interface pour un conflit détecté
 */
export interface Conflict {
  entity: string;
  entityId: string;
  localData: any;
  serverData: any;
  conflictType: 'version' | 'timestamp' | 'content';
  detectedAt: number;
}

/**
 * Service de résolution de conflits pour la synchronisation offline-first
 * Implémente différentes stratégies de résolution selon le contexte métier
 */
export class ConflictResolutionService {
  private static instance: ConflictResolutionService;
  private db: SQLiteDatabase;
  private pendingConflicts: Map<string, Conflict> = new Map();

  private constructor() {
    this.db = SQLiteDatabase.getInstance();
  }

  public static getInstance(): ConflictResolutionService {
    if (!ConflictResolutionService.instance) {
      ConflictResolutionService.instance = new ConflictResolutionService();
    }
    return ConflictResolutionService.instance;
  }

  /**
   * Détecte et résout automatiquement un conflit
   */
  async detectAndResolve(
    entity: string,
    entityId: string,
    localData: any,
    serverData: any,
    strategy: ConflictStrategy = 'last-write-wins'
  ): Promise<{ resolved: any; hadConflict: boolean }> {
    
    const hasConflict = this.detectConflict(localData, serverData);
    
    if (!hasConflict) {
      console.log(`✅ Pas de conflit détecté pour ${entity}:${entityId}`);
      return { resolved: serverData, hadConflict: false };
    }

    console.log(`⚠️ Conflit détecté pour ${entity}:${entityId}, stratégie: ${strategy}`);
    
    // Enregistrer le conflit pour audit
    const conflict: Conflict = {
      entity,
      entityId,
      localData,
      serverData,
      conflictType: this.getConflictType(localData, serverData),
      detectedAt: Date.now()
    };
    
    this.pendingConflicts.set(`${entity}:${entityId}`, conflict);
    
    // Résoudre selon la stratégie
    const resolved = await this.resolveConflict(conflict, strategy);
    
    // Appliquer la résolution
    await this.applyResolution(entity, entityId, resolved);
    
    // Nettoyer le conflit résolu
    this.pendingConflicts.delete(`${entity}:${entityId}`);
    
    console.log(`✅ Conflit résolu pour ${entity}:${entityId}`);
    return { resolved, hadConflict: true };
  }

  /**
   * Détecte s'il y a un conflit entre deux versions
   */
  private detectConflict(localData: any, serverData: any): boolean {
    // 1. Vérifier les versions si disponibles
    if (localData.version && serverData.version) {
      return localData.version !== serverData.version;
    }

    // 2. Vérifier les timestamps avec tolérance
    const localTime = this.extractTimestamp(localData);
    const serverTime = this.extractTimestamp(serverData);
    
    if (localTime && serverTime) {
      const timeDiff = Math.abs(localTime - serverTime);
      // Conflit si différence > 5 secondes (tolérance pour latence réseau)
      if (timeDiff > 5000) {
        return true;
      }
    }

    // 3. Vérifier les changements de contenu critiques
    return this.hasContentConflict(localData, serverData);
  }

  /**
   * Détermine le type de conflit
   */
  private getConflictType(localData: any, serverData: any): 'version' | 'timestamp' | 'content' {
    if (localData.version && serverData.version && localData.version !== serverData.version) {
      return 'version';
    }
    
    const localTime = this.extractTimestamp(localData);
    const serverTime = this.extractTimestamp(serverData);
    
    if (localTime && serverTime && Math.abs(localTime - serverTime) > 5000) {
      return 'timestamp';
    }
    
    return 'content';
  }

  /**
   * Extrait le timestamp d'un objet de données
   */
  private extractTimestamp(data: any): number | null {
    const timeFields = ['updatedAt', 'updated_at', 'modifiedAt', 'lastModified'];
    
    for (const field of timeFields) {
      if (data[field]) {
        const time = new Date(data[field]).getTime();
        if (!isNaN(time)) {
          return time;
        }
      }
    }
    
    return null;
  }

  /**
   * Vérifie s'il y a un conflit de contenu
   */
  private hasContentConflict(localData: any, serverData: any): boolean {
    // Champs critiques à vérifier selon le type d'entité
    const criticalFields = this.getCriticalFields(localData);
    
    for (const field of criticalFields) {
      if (localData[field] !== serverData[field]) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Retourne les champs critiques selon le type d'entité
   */
  private getCriticalFields(data: any): string[] {
    // Détection basique du type d'entité
    if (data.email && data.nom && data.prenom) {
      // Utilisateur
      return ['email', 'nom', 'prenom', 'role', 'matricule'];
    }
    
    if (data.titre && data.status) {
      // Évaluation
      return ['titre', 'status', 'dateDebut', 'dateFin', 'dureeMinutes'];
    }
    
    if (data.question && data.type) {
      // Question
      return ['question', 'type', 'options', 'bonneReponse', 'points'];
    }
    
    // Par défaut, tous les champs sauf les métadonnées
    return Object.keys(data).filter(key => 
      !['id', 'createdAt', 'updatedAt', 'created_at', 'updated_at', 'synced', 'version'].includes(key)
    );
  }

  /**
   * Résout un conflit selon la stratégie donnée
   */
  private async resolveConflict(conflict: Conflict, strategy: ConflictStrategy): Promise<any> {
    switch (strategy) {
      case 'last-write-wins':
        return this.resolveByTimestamp(conflict.localData, conflict.serverData);
      
      case 'server-priority':
        console.log('📥 Résolution: priorité serveur');
        return conflict.serverData;
      
      case 'local-priority':
        console.log('📱 Résolution: priorité locale');
        return conflict.localData;
      
      case 'manual':
        // Pour l'instant, utiliser last-write-wins
        // TODO: Implémenter interface utilisateur pour résolution manuelle
        console.log('👤 Résolution manuelle (fallback: last-write-wins)');
        return this.resolveByTimestamp(conflict.localData, conflict.serverData);
      
      default:
        return this.resolveByTimestamp(conflict.localData, conflict.serverData);
    }
  }

  /**
   * Résolution par timestamp (last-write-wins)
   */
  private resolveByTimestamp(localData: any, serverData: any): any {
    const localTime = this.extractTimestamp(localData) || 0;
    const serverTime = this.extractTimestamp(serverData) || 0;

    if (localTime > serverTime) {
      console.log('📱 Version locale plus récente');
      return { ...localData, version: (localData.version || 0) + 1 };
    } else {
      console.log('📥 Version serveur plus récente');
      return { ...serverData, version: (serverData.version || 0) + 1 };
    }
  }

  /**
   * Applique la résolution d'un conflit en base locale
   */
  private async applyResolution(entity: string, entityId: string, resolvedData: any): Promise<void> {
    switch (entity) {
      case 'user':
        await this.applyUserResolution(entityId, resolvedData);
        break;
      
      case 'evaluation':
        await this.applyEvaluationResolution(entityId, resolvedData);
        break;
        
      case 'question':
        await this.applyQuestionResolution(entityId, resolvedData);
        break;
      
      default:
        console.warn(`⚠️ Type d'entité non supporté pour résolution: ${entity}`);
    }
  }

  /**
   * Applique la résolution pour un utilisateur
   */
  private async applyUserResolution(userId: string, userData: any): Promise<void> {
    const query = `
      INSERT OR REPLACE INTO users 
      (id, nom, prenom, email, matricule, role, classe_id, classe_nom, classe_niveau, synced, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
    `;

    await this.db.executeUpdate(query, [
      userId,
      userData.nom,
      userData.prenom,
      userData.email,
      userData.matricule || null,
      userData.role,
      userData.classe?.id || null,
      userData.classe?.nom || null,
      userData.classe?.niveau || null
    ]);
  }

  /**
   * Applique la résolution pour une évaluation
   */
  private async applyEvaluationResolution(evaluationId: string, evaluationData: any): Promise<void> {
    const query = `
      INSERT OR REPLACE INTO evaluations 
      (id, titre, description, cours_id, date_debut, date_fin, duree_minutes, status, synced, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
    `;

    await this.db.executeUpdate(query, [
      evaluationId,
      evaluationData.titre,
      evaluationData.description || null,
      evaluationData.coursId || null,
      evaluationData.dateDebut || null,
      evaluationData.dateFin || null,
      evaluationData.dureeMinutes || null,
      evaluationData.status || 'active'
    ]);
  }

  /**
   * Applique la résolution pour une question
   */
  private async applyQuestionResolution(questionId: string, questionData: any): Promise<void> {
    const query = `
      INSERT OR REPLACE INTO questions 
      (id, quizz_id, type, question, options, bonne_reponse, points, ordre, synced)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
    `;

    await this.db.executeUpdate(query, [
      questionId,
      questionData.quizzId,
      questionData.type,
      questionData.question,
      questionData.options ? JSON.stringify(questionData.options) : null,
      questionData.bonneReponse || null,
      questionData.points || 1,
      questionData.ordre || 0
    ]);
  }

  /**
   * Récupère les conflits en attente de résolution manuelle
   */
  getPendingConflicts(): Conflict[] {
    return Array.from(this.pendingConflicts.values());
  }

  /**
   * Résout manuellement un conflit spécifique
   */
  async resolveManually(conflictKey: string, chosenData: any): Promise<void> {
    const conflict = this.pendingConflicts.get(conflictKey);
    if (!conflict) {
      throw new Error(`Conflit non trouvé: ${conflictKey}`);
    }

    await this.applyResolution(conflict.entity, conflict.entityId, chosenData);
    this.pendingConflicts.delete(conflictKey);
    
    console.log(`✅ Conflit résolu manuellement: ${conflictKey}`);
  }

  /**
   * Nettoie les anciens conflits résolus
   */
  cleanupOldConflicts(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 heures
    
    for (const [key, conflict] of this.pendingConflicts.entries()) {
      if (now - conflict.detectedAt > maxAge) {
        this.pendingConflicts.delete(key);
        console.log(`🧹 Conflit expiré supprimé: ${key}`);
      }
    }
  }

  /**
   * Obtient les statistiques des conflits
   */
  getConflictStats(): {
    pending: number;
    byType: Record<string, number>;
    byEntity: Record<string, number>;
  } {
    const conflicts = Array.from(this.pendingConflicts.values());
    
    const byType: Record<string, number> = {};
    const byEntity: Record<string, number> = {};
    
    conflicts.forEach(conflict => {
      byType[conflict.conflictType] = (byType[conflict.conflictType] || 0) + 1;
      byEntity[conflict.entity] = (byEntity[conflict.entity] || 0) + 1;
    });
    
    return {
      pending: conflicts.length,
      byType,
      byEntity
    };
  }

  // ==================== MÉTHODES DE COMPATIBILITÉ ====================

  /**
   * Résout les conflits de données utilisateur (compatibilité)
   */
  async resolveUserConflict(localData: any, serverData: any): Promise<any> {
    const result = await this.detectAndResolve('user', localData.id, localData, serverData, 'server-priority');
    return result.resolved;
  }

  /**
   * Résout les conflits d'évaluations (compatibilité)
   */
  async resolveEvaluationConflict(localData: any, serverData: any): Promise<any> {
    const result = await this.detectAndResolve('evaluation', localData.id, localData, serverData, 'last-write-wins');
    return result.resolved;
  }

  /**
   * Résout les conflits de soumissions (compatibilité)
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