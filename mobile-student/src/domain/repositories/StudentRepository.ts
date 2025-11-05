import { Utilisateur } from '../entities/Utilisateur';

/**
 * Interface du repository pour les informations de l'étudiant
 */
export interface StudentRepository {
  getMe(): Promise<Utilisateur>;
}
