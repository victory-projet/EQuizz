import * as SQLite from 'expo-sqlite';

/**
 * Gestionnaire de base de données SQLite pour le mode offline
 * Implémente le pattern Singleton pour une instance unique
 */
export class SQLiteDatabase {
  private static instance: SQLiteDatabase;
  private db: SQLite.SQLiteDatabase | null = null;

  private constructor() {}

  public static getInstance(): SQLiteDatabase {
    if (!SQLiteDatabase.instance) {
      SQLiteDatabase.instance = new SQLiteDatabase();
    }
    return SQLiteDatabase.instance;
  }

  /**
   * Initialise la base de données et crée les tables
   */
  public async init(): Promise<void> {
    try {
      console.log('🗄️ Initialisation de la base de données SQLite...');
      
      this.db = await SQLite.openDatabaseAsync('equizz_offline.db');
      
      await this.createTables();
      
      console.log('✅ Base de données SQLite initialisée avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
      throw error;
    }
  }

  /**
   * Crée toutes les tables nécessaires
   */
  private async createTables(): Promise<void> {
    if (!this.db) {
      throw new Error('Base de données non initialisée');
    }

    const tables = [
      // Table des utilisateurs (cache local)
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        nom TEXT NOT NULL,
        prenom TEXT NOT NULL,
        email TEXT NOT NULL,
        matricule TEXT,
        role TEXT NOT NULL,
        classe_id TEXT,
        classe_nom TEXT,
        classe_niveau TEXT,
        synced INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Table des cours (cache local)
      `CREATE TABLE IF NOT EXISTS courses (
        id TEXT PRIMARY KEY,
        nom TEXT NOT NULL,
        description TEXT,
        synced INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Table des évaluations (cache local)
      `CREATE TABLE IF NOT EXISTS evaluations (
        id TEXT PRIMARY KEY,
        titre TEXT NOT NULL,
        description TEXT,
        cours_id TEXT,
        cours_nom TEXT,
        quizz_id TEXT,
        statut_etudiant TEXT DEFAULT 'NOUVEAU',
        evaluation_json TEXT,
        date_debut DATETIME,
        date_fin DATETIME,
        duree_minutes INTEGER,
        status TEXT DEFAULT 'active',
        synced INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Table des quizz (détails des quizz)
      `CREATE TABLE IF NOT EXISTS quizzes (
        id TEXT PRIMARY KEY,
        evaluation_id TEXT NOT NULL,
        titre TEXT NOT NULL,
        description TEXT,
        questions_data TEXT, -- JSON des questions
        synced INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (evaluation_id) REFERENCES evaluations(id) ON DELETE CASCADE
      )`,

      // Table des questions (détail des questions)
      `CREATE TABLE IF NOT EXISTS questions (
        id TEXT PRIMARY KEY,
        quizz_id TEXT NOT NULL,
        type TEXT NOT NULL,
        question TEXT NOT NULL,
        options TEXT, -- JSON des options pour QCM
        bonne_reponse TEXT,
        points INTEGER DEFAULT 1,
        ordre INTEGER DEFAULT 0,
        synced INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (quizz_id) REFERENCES quizzes(id) ON DELETE CASCADE
      )`,

      // Table des réponses brouillons (stockage local temporaire)
      `CREATE TABLE IF NOT EXISTS answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_id TEXT NOT NULL,
        quizz_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
        FOREIGN KEY (quizz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
        UNIQUE(question_id, quizz_id, user_id)
      )`,

      // Table des soumissions (quizz terminés en attente de sync)
      `CREATE TABLE IF NOT EXISTS submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        quizz_id TEXT NOT NULL,
        evaluation_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        responses TEXT NOT NULL, -- JSON des réponses
        completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        synced INTEGER DEFAULT 0,
        synced_at DATETIME,
        retry_count INTEGER DEFAULT 0,
        last_error TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (quizz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
        FOREIGN KEY (evaluation_id) REFERENCES evaluations(id) ON DELETE CASCADE
      )`,

      // Table de la queue de synchronisation (tâches générales)
      `CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL, -- 'submission', 'profile_update', etc.
        data TEXT NOT NULL, -- JSON des données
        retry_count INTEGER DEFAULT 0,
        max_retries INTEGER DEFAULT 3,
        last_error TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    for (const tableSQL of tables) {
      await this.db.execAsync(tableSQL);
    }

    // Créer les index pour optimiser les performances
    await this.createIndexes();
  }

  /**
   * Crée les index pour optimiser les requêtes
   */
  private async createIndexes(): Promise<void> {
    if (!this.db) return;

    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
      'CREATE INDEX IF NOT EXISTS idx_users_matricule ON users(matricule)',
      'CREATE INDEX IF NOT EXISTS idx_evaluations_status ON evaluations(status)',
      'CREATE INDEX IF NOT EXISTS idx_evaluations_cours ON evaluations(cours_id)',
      'CREATE INDEX IF NOT EXISTS idx_questions_quizz ON questions(quizz_id)',
      'CREATE INDEX IF NOT EXISTS idx_answers_quizz_user ON answers(quizz_id, user_id)',
      'CREATE INDEX IF NOT EXISTS idx_submissions_synced ON submissions(synced)',
      'CREATE INDEX IF NOT EXISTS idx_submissions_user ON submissions(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_sync_queue_type ON sync_queue(type)'
    ];

    for (const indexSQL of indexes) {
      await this.db.execAsync(indexSQL);
    }
  }

  /**
   * Migration pour les colonnes offline de la table evaluations
   */
  public async migrateEvaluationsTable(): Promise<void> {
    if (!this.db) throw new Error('Base de données non initialisée');

    const columnsToAdd = [
      { name: 'cours_nom', type: 'TEXT' },
      { name: 'quizz_id', type: 'TEXT' },
      { name: 'statut_etudiant', type: "TEXT DEFAULT 'NOUVEAU'" },
      { name: 'evaluation_json', type: 'TEXT' },
    ];

    for (const col of columnsToAdd) {
      try {
        await this.db.execAsync(
          `ALTER TABLE evaluations ADD COLUMN ${col.name} ${col.type}`,
        );
        console.log(`✅ Colonne evaluations.${col.name} ajoutée`);
      } catch {
        // La colonne existe déjà — c'est normal
      }
    }
  }

  /**
   * Migration pour la table users (gestion des changements de schéma)
   */
  public async migrateUserTable(): Promise<void> {
    if (!this.db) {
      throw new Error('Base de données non initialisée');
    }

    try {
      // Vérifier si la colonne matricule existe
      const result = await this.db.getFirstAsync(
        "PRAGMA table_info(users)"
      );
      
      console.log('🔄 Vérification du schéma de la table users...');
      
      // Si nécessaire, ajouter des migrations ici
      // Par exemple : ALTER TABLE users ADD COLUMN nouvelle_colonne TEXT;
      
    } catch (error) {
      console.error('❌ Erreur lors de la migration:', error);
      throw error;
    }
  }

  /**
   * Exécute une requête SELECT
   */
  public async executeQuery(query: string, params: any[] = []): Promise<any[]> {
    if (!this.db) {
      throw new Error('Base de données non initialisée');
    }

    try {
      const result = await this.db.getAllAsync(query, params);
      return result;
    } catch (error) {
      console.error('❌ Erreur lors de l\'exécution de la requête:', error);
      throw error;
    }
  }

  /**
   * Exécute une requête INSERT/UPDATE/DELETE
   */
  public async executeUpdate(query: string, params: any[] = []): Promise<any> {
    if (!this.db) {
      throw new Error('Base de données non initialisée');
    }

    try {
      const result = await this.db.runAsync(query, params);
      return result;
    } catch (error) {
      console.error('❌ Erreur lors de l\'exécution de la mise à jour:', error);
      throw error;
    }
  }

  /**
   * Vide toutes les tables (pour le debug)
   */
  public async clearAll(): Promise<void> {
    if (!this.db) {
      throw new Error('Base de données non initialisée');
    }

    const tables = ['sync_queue', 'submissions', 'answers', 'questions', 'quizzes', 'evaluations', 'courses', 'users'];
    
    for (const table of tables) {
      await this.db.execAsync(`DELETE FROM ${table}`);
    }
    
    console.log('🗑️ Toutes les tables ont été vidées');
  }

  /**
   * Debug: Affiche le schéma de toutes les tables
   */
  public async debugSchema(): Promise<void> {
    if (!this.db || !__DEV__) return;

    console.log('🔍 === DEBUG SCHEMA ===');
    
    const tables = ['users', 'courses', 'evaluations', 'quizzes', 'questions', 'answers', 'submissions', 'sync_queue'];
    
    for (const table of tables) {
      try {
        const schema = await this.db.getAllAsync(`PRAGMA table_info(${table})`);
        const count = await this.db.getFirstAsync(`SELECT COUNT(*) as count FROM ${table}`);
        
        console.log(`📋 Table ${table}: ${(count as any)?.count || 0} enregistrements`);
        console.log('   Colonnes:', schema.map((col: any) => `${col.name} (${col.type})`).join(', '));
      } catch (error) {
        console.log(`❌ Erreur pour la table ${table}:`, error);
      }
    }
    
    console.log('🔍 === FIN DEBUG SCHEMA ===');
  }

  /**
   * Nettoie les anciennes données (appelé au démarrage)
   */
  public async cleanOldData(): Promise<void> {
    if (!this.db) return;

    try {
      // Supprimer les soumissions synchronisées de plus de 7 jours
      await this.db.execAsync(`
        DELETE FROM submissions 
        WHERE synced = 1 
        AND synced_at < datetime('now', '-7 days')
      `);

      // Supprimer les réponses brouillons de plus de 30 jours
      await this.db.execAsync(`
        DELETE FROM answers 
        WHERE created_at < datetime('now', '-30 days')
      `);

      // Supprimer les tâches de sync échouées de plus de 7 jours
      await this.db.execAsync(`
        DELETE FROM sync_queue 
        WHERE retry_count >= max_retries 
        AND created_at < datetime('now', '-7 days')
      `);

      console.log('🧹 Nettoyage des anciennes données terminé');
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage:', error);
    }
  }
}