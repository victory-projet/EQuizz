import { ICourseRepository } from '../../domain/repositories/ICourse.repository';
import { Course } from '../../domain/entities/Course.entity';
import { EvaluationPeriod } from '../../domain/entities/EvaluationPeriod.entity';
import { mockCourses } from '../datasources/mock/Course.mock';
import { mockEvaluationPeriod } from '../datasources/mock/EvaluationPeriod.mock';

export class CourseRepositoryImpl implements ICourseRepository {
    async getCourses(): Promise<Course[]> {
        // Simulation d'un appel API avec délai
        return new Promise((resolve) => {
            setTimeout(() => resolve(mockCourses), 100);
        });
    }

    async getCourseById(id: string): Promise<Course | null> {
        return new Promise((resolve) => {
            const course = mockCourses.find(c => c.id === id) || null;
            setTimeout(() => resolve(course), 100);
        });
    }

    async getEvaluationPeriod(): Promise<EvaluationPeriod> {
        return new Promise((resolve) => {
            setTimeout(() => resolve(mockEvaluationPeriod), 100);
        });
    }
}
