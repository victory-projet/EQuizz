import { Utilisateur } from '../entities/Utilisateur';

/**
 * Interface du repository d'authentification
 * Définit le contrat pour les opérations d'authentification
 */
export interface AuthRepository {
  /**
   * Réclame un compte étudiant (première connexion)
   */
  claimAccount(matricule: string, email: string, classeId: string): Promise<void>;

  /**
   * Connecte un utilisateur avec ses identifiants
   */
  login(matricule: string, motDePasse: string): Promise<{ token: string; utilisateur: Utilisateur }>;

  /**
   * Déconnecte l'utilisateur actuel
   */
  logout(): Promise<void>;

  /**
   * Récupère le token stocké
   */
  getStoredToken(): Promise<string | null>;

  /**
   * Rafraîchit le token d'authentification
   */
  refreshToken(): Promise<{ token: string; refreshToken: string }>;
}
