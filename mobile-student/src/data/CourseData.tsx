import { CourseStatuts } from '../models/enums/CoursesStatuts';
import { Course } from '../models/interfaces/Course';

export const CourseData: Course[] = [
    {
        id: '1',
        title: 'UE - Algorithmique et Programmation',
        classes: ['L1 Info A', 'L1 Info B'],
        questionCount: 9,
        startDate: '15 - 30 Septembre 2025',
        endDate: '15 - 30 Septembre 2025',
        status: CourseStatuts.EN_COURS
    },
    {
        id: '2',
        title: 'UE - Base de Données',
        classes: ['L3 Info A', 'L3 Info B'],
        questionCount: 9,
        startDate: '15 - 30 Septembre 2025',
        endDate: '15 - 30 Septembre 2025',
        status: CourseStatuts.TERMINE
    },
    {
        id: '3',
        title: 'UE - Architecture Web',
        classes: ['L3 Info A', 'L3 Info B'],
        questionCount: 9,
        startDate: '15 - 30 Septembre 2025',
        endDate: '15 - 30 Septembre 2025',
        status: CourseStatuts.EN_COURS
    }
];