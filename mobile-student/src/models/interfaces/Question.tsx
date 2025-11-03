import { TypeQuestion } from "../enums/TypeQuestion";

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
    type: TypeQuestion;
    options?: QuestionOption[];
    response?: String
}

export interface Answer {
    questionId: string;
    selectedOptions: string[]; // IDs des options sélectionnées
}

export interface QuizSubmission {
    courseId: string;
    answers: Answer[];
    completedAt: Date;
}