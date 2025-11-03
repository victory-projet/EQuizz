import { IQuestionRepository } from './IQuestionRepository';
import { Question, QuizSubmission } from '../interfaces/Question';
import { QuestionData } from './../../data/Question.data';

export class QuestionRepository implements IQuestionRepository {
    getQuestionsByCourse(courseId: string): Promise<Question[]> {
        const questions = QuestionData.filter(q => q.courseId === courseId);
        return Promise.resolve(questions);
    }

    submitQuiz(submission: QuizSubmission): Promise<boolean> {
        // Simulation de soumission
        console.log('Quiz soumis:', submission);
        return Promise.resolve(true);
    }
}