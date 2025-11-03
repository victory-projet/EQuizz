// Dependency Injection Container
import { ICourseRepository } from '../../domain/repositories/ICourse.repository';
import { IQuestionRepository } from '../../domain/repositories/IQuestion.repository';
import { CourseRepositoryImpl } from '../../data/repositories/Course.repository.impl';
import { QuestionRepositoryImpl } from '../../data/repositories/Question.repository.impl';
import { GetCoursesUseCase } from '../../domain/usecases/GetCourses.usecase';
import { GetEvaluationPeriodUseCase } from '../../domain/usecases/GetEvaluationPeriod.usecase';
import { GetQuestionsUseCase } from '../../domain/usecases/GetQuestions.usecase';
import { SubmitQuizUseCase } from '../../domain/usecases/SubmitQuiz.usecase';

class DIContainer {
    private static instance: DIContainer;
    
    // Repositories
    private courseRepository: ICourseRepository;
    private questionRepository: IQuestionRepository;
    
    // Use Cases
    private getCoursesUseCase: GetCoursesUseCase;
    private getEvaluationPeriodUseCase: GetEvaluationPeriodUseCase;
    private getQuestionsUseCase: GetQuestionsUseCase;
    private submitQuizUseCase: SubmitQuizUseCase;

    private constructor() {
        // Initialize repositories
        this.courseRepository = new CourseRepositoryImpl();
        this.questionRepository = new QuestionRepositoryImpl();
        
        // Initialize use cases
        this.getCoursesUseCase = new GetCoursesUseCase(this.courseRepository);
        this.getEvaluationPeriodUseCase = new GetEvaluationPeriodUseCase(this.courseRepository);
        this.getQuestionsUseCase = new GetQuestionsUseCase(this.questionRepository);
        this.submitQuizUseCase = new SubmitQuizUseCase(this.questionRepository);
    }

    static getInstance(): DIContainer {
        if (!DIContainer.instance) {
            DIContainer.instance = new DIContainer();
        }
        return DIContainer.instance;
    }

    // Getters for use cases
    getGetCoursesUseCase(): GetCoursesUseCase {
        return this.getCoursesUseCase;
    }

    getGetEvaluationPeriodUseCase(): GetEvaluationPeriodUseCase {
        return this.getEvaluationPeriodUseCase;
    }

    getGetQuestionsUseCase(): GetQuestionsUseCase {
        return this.getQuestionsUseCase;
    }

    getSubmitQuizUseCase(): SubmitQuizUseCase {
        return this.submitQuizUseCase;
    }
}

export default DIContainer;
