import { ICourseRepository } from '../repositories/ICoursesRepository';
import { Course } from '../interfaces/Course';

export class GetCoursesService {
    constructor(private repository: ICourseRepository) {}

    async execute(): Promise<Course[]> {
        return await this.repository.getCourses();
    }
}