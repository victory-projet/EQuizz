import { Course } from '../entities/Course.entity';
import { ICourseRepository } from '../repositories/ICourse.repository';

export class GetCoursesUseCase {
    constructor(private readonly courseRepository: ICourseRepository) {}

    async execute(): Promise<Course[]> {
        return await this.courseRepository.getCourses();
    }
}
