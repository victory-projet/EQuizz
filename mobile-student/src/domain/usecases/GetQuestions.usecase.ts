import { Question } from '../entities/Question.entity';
import { IQuestionRepository } from '../repositories/IQuestion.repository';

export class GetQuestionsUseCase {
    constructor(private readonly questionRepository: IQuestionRepository) {}

    async execute(courseId: string): Promise<Question[]> {
        if (!courseId) {
            throw new Error('Course ID is required');
        }
        return await this.questionRepository.getQuestionsByCourse(courseId);
    }
}
