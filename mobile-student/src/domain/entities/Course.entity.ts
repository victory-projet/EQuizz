export enum CourseStatus {
    EN_COURS = 'EN_COURS',
    TERMINE = 'TERMINE',
    A_VENIR = 'A_VENIR'
}

export interface Course {
    id: string;
    title: string;
    classes: string[];
    questionCount: number;
    startDate: string;
    endDate: string;
    status: CourseStatus;
}
