import { Classe } from '../entities/Classe.entity';

export interface IClasseRepository {
    getClasses(): Promise<Classe[]>;
}
