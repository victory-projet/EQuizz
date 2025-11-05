import { StudentRepository } from '../../domain/repositories/StudentRepository';
import { Utilisateur } from '../../domain/entities/Utilisateur';
import { StudentDataSource } from '../datasources/StudentDataSource';

/**
 * Implémentation du repository pour les informations de l'étudiant
 */
export class StudentRepositoryImpl implements StudentRepository {
  constructor(private studentDataSource: StudentDataSource) {}

  async getMe(): Promise<Utilisateur> {
    return this.studentDataSource.getMe();
  }
}
