import { SQLiteDatabase } from '../database/SQLiteDatabase';
import { Utilisateur } from '../../domain/entities/Utilisateur';

/**
 * Repository pour la gestion offline des données utilisateur
 * Gère le cache local des profils utilisateur
 */
export class OfflineUserRepository {
  private db: SQLiteDatabase;

  constructor() {
    this.db = SQLiteDatabase.getInstance();
  }

  /**
   * Sauvegarde un utilisateur en cache local
   */
  async saveUser(user: Utilisateur): Promise<void> {
    const query = `
      INSERT OR REPLACE INTO users 
      (id, nom, prenom, email, matricule, role, classe_id, classe_nom, classe_niveau, synced, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
    `;
    
    await this.db.executeUpdate(query, [
      user.id,
      user.nom,
      user.prenom,
      user.email,
      user.matricule || null,
      user.role,
      user.classe?.id || null,
      user.classe?.nom || null,
      user.classe?.niveau || null
    ]);
  }

  /**
   * Récupère un utilisateur depuis le cache local
   */
  async getUser(userId: string): Promise<Utilisateur | null> {
    const query = 'SELECT * FROM users WHERE id = ?';
    const results = await this.db.executeQuery(query, [userId]);
    
    if (results.length === 0) return null;
    
    return this.mapRowToUser(results[0]);
  }

  /**
   * Met à jour le profil d'un utilisateur
   */
  async updateUserProfile(userId: string, updates: Partial<Utilisateur>): Promise<void> {
    const fields = [];
    const values = [];
    
    if (updates.nom) {
      fields.push('nom = ?');
      values.push(updates.nom);
    }
    
    if (updates.prenom) {
      fields.push('prenom = ?');
      values.push(updates.prenom);
    }
    
    if (updates.email) {
      fields.push('email = ?');
      values.push(updates.email);
    }
    
    if (fields.length === 0) return;
    
    fields.push('synced = 0', 'updated_at = CURRENT_TIMESTAMP');
    values.push(userId);
    
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    await this.db.executeUpdate(query, values);
  }

  /**
   * Récupère tous les utilisateurs en cache
   */
  async getAllUsers(): Promise<Utilisateur[]> {
    const query = 'SELECT * FROM users ORDER BY nom, prenom';
    const results = await this.db.executeQuery(query);
    
    return results.map(row => this.mapRowToUser(row));
  }

  /**
   * Convertit une ligne de base de données en objet Utilisateur
   */
  private mapRowToUser(row: any): Utilisateur {
    return {
      id: row.id,
      nom: row.nom,
      prenom: row.prenom,
      email: row.email,
      matricule: row.matricule,
      role: row.role,
      classe: row.classe_id ? {
        id: row.classe_id,
        nom: row.classe_nom,
        niveau: row.classe_niveau
      } : undefined,
      estActif: true,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    } as Utilisateur;
  }
}