import { IQuestionRepository } from '../repositories/IQuestionRepository';
import { QuizSubmission } from '../interfaces/Question'

export class SubmitAnswersUseCase {
    constructor(private repository: IQuestionRepository) {}

    execute(submission: QuizSubmission): Promise<boolean> {
        return this.repository.submitQuiz(submission);
    }
}