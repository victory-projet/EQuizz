import { QuizSubmission } from '../entities/Question.entity';
import { IQuestionRepository } from '../repositories/IQuestion.repository';

export class SubmitQuizUseCase {
    constructor(private readonly questionRepository: IQuestionRepository) {}

    async execute(submission: QuizSubmission): Promise<boolean> {
        if (!submission.courseId || submission.answers.length === 0) {
            throw new Error('Invalid quiz submission');
        }
        return await this.questionRepository.submitQuiz(submission);
    }
}
