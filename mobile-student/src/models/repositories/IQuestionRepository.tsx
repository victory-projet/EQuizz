import { Question, QuizSubmission } from '../interfaces/Question';

export interface IQuestionRepository {
    getQuestionsByCourse(courseId: string): Promise<Question[]>;
    submitQuiz(submission: QuizSubmission): Promise<boolean>;
}