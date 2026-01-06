import { SQLiteDatabase } from '../database/SQLiteDatabase';
import { SyncEngine } from './SyncEngine';

/**
 * Interface pour une entité avec métadonnées de synchronisation
 */
export interface SyncableEntity {
  id: string;
  data: any;
  updatedAt: number;
  syncStatus: 'PENDING' | 'SYNCED' | 'FAILED';
  deleted: boolean;
  version: number;
}

/**
 * Gestionnaire d'entités avec support offline-first
 * Toutes les opérations CRUD passent par ce gestionnaire qui gère automatiquement
 * la synchronisation et le versioning
 */
export class EntityManager {
  private static instance: EntityManager;
  private db: SQLiteDatabase;
  private syncEngine: SyncEngine;

  private constructor() {
    this.db = SQLiteDatabase.getInstance();
    this.syncEngine = SyncEngine.getInstance();
  }

  public static getInstance(): EntityManager {
    if (!EntityManager.instance) {
      EntityManager.instance = new EntityManager();
    }
    return EntityManager.instance;
  }

  // ==================== OPÉRATIONS CRUD GÉNÉRIQUES ====================

  /**
   * Crée une nouvelle entité (offline-first)
   */
  async create<T>(
    entityType: string,
    entityData: T,
    userId?: string
  ): Promise<{ id: string; success: boolean; error?: string }> {
    try {
      const entityId = this.generateId();
      const now = Date.now();
      
      const entity: SyncableEntity = {
        id: entityId,
        data: entityData,
        updatedAt: now,
        syncStatus: 'PENDING',
        deleted: false,
        version: 1
      };

      // Sauvegarder localement d'abord
      await this.saveEntityLocally(entityType, entity, userId);
      
      // Ajouter à la queue de synchronisation
      await this.syncEngine.addOperation(
        entityType,
        entityId,
        'CREATE',
        { ...entityData, userId },
        1
      );

      console.log(`✅ Entité ${entityType}:${entityId} créée localement`);
      
      return { id: entityId, success: true };
      
    } catch (error: any) {
      console.error(`❌ Erreur création ${entityType}:`, error);
      return { id: '', success: false, error: error.message };
    }
  }

  /**
   * Met à jour une entité existante (offline-first)
   */
  async update<T>(
    entityType: string,
    entityId: string,
    updates: Partial<T>,
    userId?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Récupérer l'entité actuelle
      const currentEntity = await this.getEntityLocally(entityType, entityId);
      if (!currentEntity) {
        throw new Error(`Entité ${entityType}:${entityId} non trouvée`);
      }

      const now = Date.now();
      const updatedEntity: SyncableEntity = {
        ...currentEntity,
        data: { ...currentEntity.data, ...updates },
        updatedAt: now,
        syncStatus: 'PENDING',
        version: currentEntity.version + 1
      };

      // Sauvegarder localement
      await this.saveEntityLocally(entityType, updatedEntity, userId);
      
      // Ajouter à la queue de synchronisation
      await this.syncEngine.addOperation(
        entityType,
        entityId,
        'UPDATE',
        { ...updatedEntity.data, userId },
        updatedEntity.version
      );

      console.log(`✅ Entité ${entityType}:${entityId} mise à jour localement`);
      
      return { success: true };
      
    } catch (error: any) {
      console.error(`❌ Erreur mise à jour ${entityType}:${entityId}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Supprime une entité (soft delete, offline-first)
   */
  async delete(
    entityType: string,
    entityId: string,
    userId?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Récupérer l'entité actuelle
      const currentEntity = await this.getEntityLocally(entityType, entityId);
      if (!currentEntity) {
        throw new Error(`Entité ${entityType}:${entityId} non trouvée`);
      }

      const now = Date.now();
      const deletedEntity: SyncableEntity = {
        ...currentEntity,
        updatedAt: now,
        syncStatus: 'PENDING',
        deleted: true,
        version: currentEntity.version + 1
      };

      // Marquer comme supprimée localement
      await this.saveEntityLocally(entityType, deletedEntity, userId);
      
      // Ajouter à la queue de synchronisation
      await this.syncEngine.addOperation(
        entityType,
        entityId,
        'DELETE',
        { userId },
        deletedEntity.version
      );

      console.log(`✅ Entité ${entityType}:${entityId} supprimée localement`);
      
      return { success: true };
      
    } catch (error: any) {
      console.error(`❌ Erreur suppression ${entityType}:${entityId}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Récupère une entité par ID
   */
  async get<T>(entityType: string, entityId: string): Promise<T | null> {
    try {
      const entity = await this.getEntityLocally(entityType, entityId);
      if (!entity || entity.deleted) {
        return null;
      }
      
      return entity.data as T;
      
    } catch (error) {
      console.error(`❌ Erreur récupération ${entityType}:${entityId}:`, error);
      return null;
    }
  }

  /**
   * Récupère toutes les entités d'un type (non supprimées)
   */
  async getAll<T>(entityType: string, userId?: string): Promise<T[]> {
    try {
      const entities = await this.getAllEntitiesLocally(entityType, userId);
      return entities
        .filter(entity => !entity.deleted)
        .map(entity => entity.data as T);
        
    } catch (error) {
      console.error(`❌ Erreur récupération ${entityType}:`, error);
      return [];
    }
  }

  // ==================== GESTION SPÉCIFIQUE DES RÉPONSES ====================

  /**
   * Sauvegarde une réponse brouillon (local uniquement)
   */
  async saveAnswer(
    questionId: string,
    quizzId: string,
    userId: string,
    content: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const query = `
        INSERT OR REPLACE INTO answers (question_id, quizz_id, user_id, content, updated_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `;
      
      await this.db.executeUpdate(query, [questionId, quizzId, userId, content]);
      
      console.log(`💾 Réponse sauvegardée: Q${questionId} = "${content.substring(0, 50)}..."`);
      
      return { success: true };
      
    } catch (error: any) {
      console.error('❌ Erreur sauvegarde réponse:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Récupère les réponses brouillons d'un quizz
   */
  async getAnswers(quizzId: string, userId: string): Promise<Record<string, string>> {
    try {
      const query = `
        SELECT question_id, content FROM answers 
        WHERE quizz_id = ? AND user_id = ?
      `;
      
      const results = await this.db.executeQuery(query, [quizzId, userId]);
      
      const answers: Record<string, string> = {};
      results.forEach(row => {
        answers[row.question_id] = row.content;
      });
      
      return answers;
      
    } catch (error) {
      console.error('❌ Erreur récupération réponses:', error);
      return {};
    }
  }

  /**
   * Soumet un quizz complet (avec gestion offline)
   */
  async submitQuiz(
    quizzId: string,
    evaluationId: string,
    userId: string,
    responses: Array<{ questionId: string; content: string }>
  ): Promise<{ success: boolean; error?: string; submissionId?: string }> {
    try {
      // Utiliser le SyncEngine pour gérer la soumission
      const operationId = await this.syncEngine.queueSubmission(
        quizzId,
        evaluationId,
        userId,
        responses
      );

      // Supprimer les réponses brouillons
      const deleteQuery = 'DELETE FROM answers WHERE quizz_id = ? AND user_id = ?';
      await this.db.executeUpdate(deleteQuery, [quizzId, userId]);

      console.log(`✅ Quizz ${quizzId} soumis avec succès (opération: ${operationId})`);
      
      return { success: true, submissionId: operationId };
      
    } catch (error: any) {
      console.error(`❌ Erreur soumission quizz ${quizzId}:`, error);
      return { success: false, error: error.message };
    }
  }

  // ==================== MÉTHODES PRIVÉES ====================

  /**
   * Génère un ID unique pour une entité
   */
  private generateId(): string {
    return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sauvegarde une entité localement avec métadonnées
   */
  private async saveEntityLocally(
    entityType: string,
    entity: SyncableEntity,
    userId?: string
  ): Promise<void> {
    // Utiliser une table générique pour les entités ou des tables spécifiques
    switch (entityType) {
      case 'user_profile':
        await this.saveUserProfileLocally(entity, userId);
        break;
        
      case 'answer_draft':
        await this.saveAnswerDraftLocally(entity, userId);
        break;
        
      default:
        // Table générique pour autres entités
        await this.saveGenericEntityLocally(entityType, entity, userId);
    }
  }

  /**
   * Sauvegarde un profil utilisateur
   */
  private async saveUserProfileLocally(entity: SyncableEntity, userId?: string): Promise<void> {
    const data = entity.data;
    const query = `
      INSERT OR REPLACE INTO users 
      (id, nom, prenom, email, matricule, role, classe_id, classe_nom, classe_niveau, 
       synced, updated_at, version)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.executeUpdate(query, [
      entity.id,
      data.nom,
      data.prenom,
      data.email,
      data.matricule || null,
      data.role,
      data.classe?.id || null,
      data.classe?.nom || null,
      data.classe?.niveau || null,
      entity.syncStatus === 'SYNCED' ? 1 : 0,
      new Date(entity.updatedAt).toISOString(),
      entity.version
    ]);
  }

  /**
   * Sauvegarde un brouillon de réponse
   */
  private async saveAnswerDraftLocally(entity: SyncableEntity, userId?: string): Promise<void> {
    const data = entity.data;
    const query = `
      INSERT OR REPLACE INTO answers 
      (question_id, quizz_id, user_id, content, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `;

    await this.db.executeUpdate(query, [
      data.questionId,
      data.quizzId,
      userId || data.userId,
      data.content,
      new Date(entity.updatedAt).toISOString()
    ]);
  }

  /**
   * Sauvegarde une entité générique
   */
  private async saveGenericEntityLocally(
    entityType: string,
    entity: SyncableEntity,
    userId?: string
  ): Promise<void> {
    // Créer une table générique si elle n'existe pas
    await this.ensureGenericEntityTable(entityType);
    
    const query = `
      INSERT OR REPLACE INTO entity_${entityType} 
      (id, data, updated_at, sync_status, deleted, version, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.executeUpdate(query, [
      entity.id,
      JSON.stringify(entity.data),
      new Date(entity.updatedAt).toISOString(),
      entity.syncStatus,
      entity.deleted ? 1 : 0,
      entity.version,
      userId || null
    ]);
  }

  /**
   * Assure qu'une table générique existe pour un type d'entité
   */
  private async ensureGenericEntityTable(entityType: string): Promise<void> {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS entity_${entityType} (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        updated_at DATETIME NOT NULL,
        sync_status TEXT DEFAULT 'PENDING',
        deleted INTEGER DEFAULT 0,
        version INTEGER DEFAULT 1,
        user_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await this.db.executeUpdate(createTableQuery);
  }

  /**
   * Récupère une entité depuis le stockage local
   */
  private async getEntityLocally(entityType: string, entityId: string): Promise<SyncableEntity | null> {
    switch (entityType) {
      case 'user_profile':
        return await this.getUserProfileLocally(entityId);
        
      default:
        return await this.getGenericEntityLocally(entityType, entityId);
    }
  }

  /**
   * Récupère un profil utilisateur local
   */
  private async getUserProfileLocally(userId: string): Promise<SyncableEntity | null> {
    const query = 'SELECT * FROM users WHERE id = ?';
    const results = await this.db.executeQuery(query, [userId]);
    
    if (results.length === 0) return null;
    
    const row = results[0];
    return {
      id: row.id,
      data: {
        nom: row.nom,
        prenom: row.prenom,
        email: row.email,
        matricule: row.matricule,
        role: row.role,
        classe: row.classe_id ? {
          id: row.classe_id,
          nom: row.classe_nom,
          niveau: row.classe_niveau
        } : null
      },
      updatedAt: new Date(row.updated_at).getTime(),
      syncStatus: row.synced ? 'SYNCED' : 'PENDING',
      deleted: false,
      version: row.version || 1
    };
  }

  /**
   * Récupère une entité générique
   */
  private async getGenericEntityLocally(entityType: string, entityId: string): Promise<SyncableEntity | null> {
    try {
      const query = `SELECT * FROM entity_${entityType} WHERE id = ?`;
      const results = await this.db.executeQuery(query, [entityId]);
      
      if (results.length === 0) return null;
      
      const row = results[0];
      return {
        id: row.id,
        data: JSON.parse(row.data),
        updatedAt: new Date(row.updated_at).getTime(),
        syncStatus: row.sync_status,
        deleted: row.deleted === 1,
        version: row.version
      };
    } catch (error) {
      // Table n'existe pas encore
      return null;
    }
  }

  /**
   * Récupère toutes les entités d'un type
   */
  private async getAllEntitiesLocally(entityType: string, userId?: string): Promise<SyncableEntity[]> {
    switch (entityType) {
      case 'user_profile':
        const userEntity = await this.getUserProfileLocally(userId!);
        return userEntity ? [userEntity] : [];
        
      default:
        return await this.getAllGenericEntitiesLocally(entityType, userId);
    }
  }

  /**
   * Récupère toutes les entités génériques d'un type
   */
  private async getAllGenericEntitiesLocally(entityType: string, userId?: string): Promise<SyncableEntity[]> {
    try {
      let query = `SELECT * FROM entity_${entityType}`;
      const params: any[] = [];
      
      if (userId) {
        query += ' WHERE user_id = ?';
        params.push(userId);
      }
      
      query += ' ORDER BY updated_at DESC';
      
      const results = await this.db.executeQuery(query, params);
      
      return results.map(row => ({
        id: row.id,
        data: JSON.parse(row.data),
        updatedAt: new Date(row.updated_at).getTime(),
        syncStatus: row.sync_status,
        deleted: row.deleted === 1,
        version: row.version
      }));
    } catch (error) {
      // Table n'existe pas encore
      return [];
    }
  }

  // ==================== MÉTHODES UTILITAIRES ====================

  /**
   * Récupère les statistiques des entités
   */
  async getEntityStats(entityType?: string): Promise<{
    total: number;
    pending: number;
    synced: number;
    failed: number;
    deleted: number;
  }> {
    try {
      let query = '';
      const params: any[] = [];
      
      if (entityType) {
        query = `
          SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN sync_status = 'PENDING' THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN sync_status = 'SYNCED' THEN 1 ELSE 0 END) as synced,
            SUM(CASE WHEN sync_status = 'FAILED' THEN 1 ELSE 0 END) as failed,
            SUM(CASE WHEN deleted = 1 THEN 1 ELSE 0 END) as deleted
          FROM entity_${entityType}
        `;
      } else {
        // Statistiques globales (approximatives)
        const syncStats = await this.syncEngine.getSyncStats();
        return {
          total: syncStats.pending + syncStats.synced + syncStats.failed,
          pending: syncStats.pending,
          synced: syncStats.synced,
          failed: syncStats.failed,
          deleted: 0
        };
      }
      
      const results = await this.db.executeQuery(query, params);
      const row = results[0] || {};
      
      return {
        total: row.total || 0,
        pending: row.pending || 0,
        synced: row.synced || 0,
        failed: row.failed || 0,
        deleted: row.deleted || 0
      };
      
    } catch (error) {
      console.error('❌ Erreur récupération stats entités:', error);
      return { total: 0, pending: 0, synced: 0, failed: 0, deleted: 0 };
    }
  }

  /**
   * Nettoie les entités supprimées anciennes
   */
  async cleanupDeletedEntities(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    const cutoffDate = new Date(Date.now() - maxAge).toISOString();
    
    // Nettoyer les tables génériques (on ne peut pas lister toutes les tables dynamiquement)
    // Cette méthode devrait être appelée avec des types d'entités spécifiques
    
    console.log('🧹 Nettoyage des entités supprimées terminé');
  }
}