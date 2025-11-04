import { AuthRepository } from '../repositories/AuthRepository';

/**
 * Cas d'utilisation : Réclamation de compte
 * Permet à un étudiant de réclamer son compte lors de sa première connexion
 */
export class ClaimAccountUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(matricule: string, email: string, classeId: string): Promise<void> {
    // Validation basique
    if (!matricule || !email || !classeId) {
      throw new Error('Tous les champs sont requis');
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Email invalide');
    }

    return this.authRepository.claimAccount(matricule, email, classeId);
  }
}
