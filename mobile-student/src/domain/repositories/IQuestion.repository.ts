import { Question, QuizSubmission } from '../entities/Question.entity';

export interface IQuestionRepository {
    getQuestionsByCourse(courseId: string): Promise<Question[]>;
    submitQuiz(submission: QuizSubmission): Promise<boolean>;
}
