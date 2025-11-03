import { EvaluationPeriodData } from "@/src/data/EvaluationPeriodData";
import { CourseData } from "@/src/data/CourseData";
import { EvaluationPeriod } from "../interfaces/EvaluationPeriod";
import { Course } from "../interfaces/Course";
import { ICourseRepository } from "./ICoursesRepository";

export class CourseRepository implements ICourseRepository {
    getCourses(): Promise<Course[]> {
        // Retourne directement une Promise résolue
        return Promise.resolve(CourseData);
    }

    getEvaluationPeriod(): Promise<EvaluationPeriod> {
        return Promise.resolve(EvaluationPeriodData);
    }
}