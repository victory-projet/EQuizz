import { IQuestionRepository } from '../../domain/repositories/IQuestion.repository';
import { Question, QuizSubmission } from '../../domain/entities/Question.entity';
import { QuestionDataSource, QuestionDataSourceImpl } from '../datasources/QuestionDataSource';

export class QuestionRepositoryImpl implements IQuestionRepository {
    constructor(private questionDataSource: QuestionDataSource) {}

    async getQuestionsByCourse(courseId: string): Promise<Question[]> {
        return this.questionDataSource.getQuestionsByCourse(courseId);
    }

    async submitQuiz(submission: QuizSubmission): Promise<boolean> {
        return this.questionDataSource.submitQuiz(submission);
    }
}
