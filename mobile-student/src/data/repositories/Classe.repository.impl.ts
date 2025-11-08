import { IClasseRepository } from '../../domain/repositories/IClasse.repository';
import { Classe } from '../../domain/entities/Classe.entity';
import { ClasseDataSource } from '../datasources/ClasseDataSource';

export class ClasseRepositoryImpl implements IClasseRepository {
    constructor(private classeDataSource: ClasseDataSource) {}

    async getClasses(): Promise<Classe[]> {
        return this.classeDataSource.getClasses();
    }
}
