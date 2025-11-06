import { Course } from '../entities/Course.entity';
import { EvaluationPeriod } from '../entities/EvaluationPeriod.entity';

export interface ICourseRepository {
    getCourses(): Promise<Course[]>;
    getCourseById(id: string): Promise<Course | null>;
    getEvaluationPeriod(): Promise<EvaluationPeriod>;
}
