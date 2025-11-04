export enum QuestionType {
    MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
    SINGLE_CHOICE = 'SINGLE_CHOICE',
    TEXT = 'TEXT'
}

export interface QuestionOption {
    id: string;
    text: string;
}

export interface Question {
    id: string;
    courseId: string;
    questionNumber: number;
    totalQuestions: number;
    text: string;
    type: QuestionType;
    options?: QuestionOption[];
    response?: string;
}

export interface Answer {
    questionId: string;
    selectedOptions: string[];
}

export interface QuizSubmission {
    courseId: string;
    answers: Answer[];
    completedAt: Date;
}
