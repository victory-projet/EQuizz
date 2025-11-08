import { Classe } from '../entities/Classe.entity';
import { IClasseRepository } from '../repositories/IClasse.repository';

export class GetClassesUseCase {
    constructor(private readonly classeRepository: IClasseRepository) {}

    async execute(): Promise<Classe[]> {
        return await this.classeRepository.getClasses();
    }
}
