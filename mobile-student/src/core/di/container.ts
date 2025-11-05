// Dependency Injection Container
import { ICourseRepository } from '../../domain/repositories/ICourse.repository';
import { IQuestionRepository } from '../../domain/repositories/IQuestion.repository';
import { CourseRepositoryImpl } from '../../data/repositories/Course.repository.impl';
import { QuestionRepositoryImpl } from '../../data/repositories/Question.repository.impl';
import { GetCoursesUseCase } from '../../domain/usecases/GetCourses.usecase';
import { GetEvaluationPeriodUseCase } from '../../domain/usecases/GetEvaluationPeriod.usecase';
import { GetQuestionsUseCase } from '../../domain/usecases/GetQuestions.usecase';
import { SubmitQuizUseCase } from '../../domain/usecases/SubmitQuiz.usecase';
import { AuthDataSourceImpl } from '../../data/datasources/AuthDataSource';
import { AuthRepositoryImpl } from '../../data/repositories/AuthRepositoryImpl';
import { ClaimAccountUseCase } from '../../domain/usecases/ClaimAccountUseCase';
import { LoginUseCase } from '../../domain/usecases/LoginUseCase';
import { QuizzDataSourceImpl } from '../../data/datasources/QuizzDataSource';
import { QuizzRepositoryImpl } from '../../data/repositories/QuizzRepositoryImpl';
import { GetAvailableQuizzesUseCase } from '../../domain/usecases/GetAvailableQuizzesUseCase';
import { GetQuizzDetailsUseCase } from '../../domain/usecases/GetQuizzDetailsUseCase';
import { SubmitQuizzAnswersUseCase } from '../../domain/usecases/SubmitQuizzAnswersUseCase';
import { StudentDataSourceImpl } from '../../data/datasources/StudentDataSource';
import { StudentRepositoryImpl } from '../../data/repositories/StudentRepositoryImpl';
import { GetStudentInfoUseCase } from '../../domain/usecases/GetStudentInfoUseCase';

/**
 * Conteneur d'injection de dépendances
 * Centralise la création et la gestion des instances pour toute l'application
 */
class DIContainer {
    private static instance: DIContainer;
    
    // Repositories - Quiz
    private courseRepository: ICourseRepository;
    private questionRepository: IQuestionRepository;
    
    // Repositories - Auth
    private _authRepository: AuthRepositoryImpl | null = null;
    
    // Repositories - Quizz
    private _quizzRepository: QuizzRepositoryImpl | null = null;
    
    // Repositories - Student
    private _studentRepository: StudentRepositoryImpl | null = null;
    
    // DataSources - Auth
    private _authDataSource: AuthDataSourceImpl | null = null;
    
    // DataSources - Quizz
    private _quizzDataSource: QuizzDataSourceImpl | null = null;
    
    // DataSources - Student
    private _studentDataSource: StudentDataSourceImpl | null = null;
    
    // Use Cases - Quiz
    private getCoursesUseCase: GetCoursesUseCase;
    private getEvaluationPeriodUseCase: GetEvaluationPeriodUseCase;
    private getQuestionsUseCase: GetQuestionsUseCase;
    private submitQuizUseCase: SubmitQuizUseCase;

    private constructor() {
        // Initialize quiz repositories
        this.courseRepository = new CourseRepositoryImpl();
        this.questionRepository = new QuestionRepositoryImpl();
        
        // Initialize quiz use cases
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

    // Getters for quiz use cases
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

    // Getters for auth datasources
    get authDataSource(): AuthDataSourceImpl {
        if (!this._authDataSource) {
            this._authDataSource = new AuthDataSourceImpl();
        }
        return this._authDataSource;
    }

    // Getters for auth repositories
    get authRepository(): AuthRepositoryImpl {
        if (!this._authRepository) {
            this._authRepository = new AuthRepositoryImpl(this.authDataSource);
        }
        return this._authRepository;
    }

    // Getters for quizz datasources
    get quizzDataSource(): QuizzDataSourceImpl {
        if (!this._quizzDataSource) {
            this._quizzDataSource = new QuizzDataSourceImpl();
        }
        return this._quizzDataSource;
    }

    // Getters for quizz repositories
    get quizzRepository(): QuizzRepositoryImpl {
        if (!this._quizzRepository) {
            this._quizzRepository = new QuizzRepositoryImpl(this.quizzDataSource);
        }
        return this._quizzRepository;
    }

    // Getters for auth use cases
    get claimAccountUseCase(): ClaimAccountUseCase {
        return new ClaimAccountUseCase(this.authRepository);
    }

    get loginUseCase(): LoginUseCase {
        return new LoginUseCase(this.authRepository);
    }

    // Getters for quizz use cases
    get getAvailableQuizzesUseCase(): GetAvailableQuizzesUseCase {
        return new GetAvailableQuizzesUseCase(this.quizzRepository);
    }

    get getQuizzDetailsUseCase(): GetQuizzDetailsUseCase {
        return new GetQuizzDetailsUseCase(this.quizzRepository);
    }

    get submitQuizzAnswersUseCase(): SubmitQuizzAnswersUseCase {
        return new SubmitQuizzAnswersUseCase(this.quizzRepository);
    }

    // Getters for student datasources
    get studentDataSource(): StudentDataSourceImpl {
        if (!this._studentDataSource) {
            this._studentDataSource = new StudentDataSourceImpl();
        }
        return this._studentDataSource;
    }

    // Getters for student repositories
    get studentRepository(): StudentRepositoryImpl {
        if (!this._studentRepository) {
            this._studentRepository = new StudentRepositoryImpl(this.studentDataSource);
        }
        return this._studentRepository;
    }

    // Getters for student use cases
    get getStudentInfoUseCase(): GetStudentInfoUseCase {
        return new GetStudentInfoUseCase(this.studentRepository);
    }
}

export default DIContainer;
