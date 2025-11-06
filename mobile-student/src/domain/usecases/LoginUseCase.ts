import { AuthRepository } from '../repositories/AuthRepository';
import { Utilisateur } from '../entities/Utilisateur';

/**
 * Cas d'utilisation : Connexion
 * Permet à un utilisateur de se connecter avec ses identifiants
 */
export class LoginUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(
    matricule: string,
    motDePasse: string
  ): Promise<{ token: string; utilisateur: Utilisateur }> {
    // Validation basique
    if (!matricule || !motDePasse) {
      throw new Error('Le matricule et le mot de passe sont requis');
    }

    return this.authRepository.login(matricule, motDePasse);
  }
}
