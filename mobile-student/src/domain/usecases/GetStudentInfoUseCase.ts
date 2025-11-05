import { Utilisateur } from '../entities/Utilisateur';
import { StudentRepository } from '../repositories/StudentRepository';

/**
 * Cas d'utilisation : Récupérer les informations complètes de l'étudiant
 */
export class GetStudentInfoUseCase {
  constructor(private studentRepository: StudentRepository) {}

  async execute(): Promise<Utilisateur> {
    return this.studentRepository.getMe();
  }
}
