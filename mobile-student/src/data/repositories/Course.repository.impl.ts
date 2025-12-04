import { ICourseRepository } from '../../domain/repositories/ICourse.repository';
import { Course } from '../../domain/entities/Course.entity';
import { EvaluationPeriod } from '../../domain/entities/EvaluationPeriod.entity';
import { CourseDataSource } from '../datasources/Course.datasource';

export class CourseRepositoryImpl implements ICourseRepository {
    constructor(private courseDataSource: CourseDataSource) {}

    async getCourses(): Promise<Course[]> {
        return this.courseDataSource.getCourses();
    }

    async getCourseById(id: string): Promise<Course | null> {
        return this.courseDataSource.getCourseById(id);
    }

    async getEvaluationPeriod(): Promise<EvaluationPeriod> {
        return this.courseDataSource.getEvaluationPeriod();
    }
}
