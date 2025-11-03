import { IQuestionRepository } from '../../domain/repositories/IQuestion.repository';
import { Question, QuizSubmission } from '../../domain/entities/Question.entity';
import { mockQuestions } from '../datasources/mock/Question.mock';

export class QuestionRepositoryImpl implements IQuestionRepository {
    async getQuestionsByCourse(courseId: string): Promise<Question[]> {
        return new Promise((resolve) => {
            const questions = mockQuestions.filter(q => q.courseId === courseId);
            setTimeout(() => resolve(questions), 100);
        });
    }

    async submitQuiz(submission: QuizSubmission): Promise<boolean> {
        return new Promise((resolve) => {
            console.log('Quiz soumis:', submission);
            // Simulation d'envoi au serveur
            setTimeout(() => resolve(true), 500);
        });
    }
}
