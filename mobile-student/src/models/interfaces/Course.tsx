import { CourseStatuts } from '../enums/CoursesStatuts';

export interface Course {
    id: string;
    title: string;
    classes: string[];
    questionCount: number;
    startDate: string;
    endDate: string;
    status: CourseStatuts;
}