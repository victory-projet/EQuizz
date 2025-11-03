import { ICourseRepository } from '../repositories/ICoursesRepository';
import { EvaluationPeriod } from '../interfaces/EvaluationPeriod';

export class GetEvaluationPeriodService {
    constructor(private repository: ICourseRepository) {}

    async execute(): Promise<EvaluationPeriod> {
        return await this.repository.getEvaluationPeriod();
    
    }
}