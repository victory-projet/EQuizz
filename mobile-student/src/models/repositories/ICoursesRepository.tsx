import { Course } from '../interfaces/Course';
import { EvaluationPeriod } from '../interfaces/EvaluationPeriod';

export interface ICourseRepository {
    getCourses(): Promise<Course[]>;
    getEvaluationPeriod(): Promise<EvaluationPeriod>;
}
