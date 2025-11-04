import { EvaluationPeriod } from '../entities/EvaluationPeriod.entity';
import { ICourseRepository } from '../repositories/ICourse.repository';

export class GetEvaluationPeriodUseCase {
    constructor(private readonly courseRepository: ICourseRepository) {}

    async execute(): Promise<EvaluationPeriod> {
        return await this.courseRepository.getEvaluationPeriod();
    }
}
