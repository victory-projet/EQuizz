import { IQuestionRepository } from '../repositories/IQuestionRepository';
import { Question } from '../interfaces/Question';

export class GetQuestionsUseCase {
    constructor(private repository: IQuestionRepository) {}

    execute(courseId: string): Promise<Question[]> {
        return this.repository.getQuestionsByCourse(courseId);
    }
}