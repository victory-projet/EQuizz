// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

// Clean Architecture - Repository Providers
import { IAcademicYearRepository } from './core/domain/repositories/academic-year.repository.interface';
import { AcademicYearRepository } from './core/infrastructure/repositories/academic-year.repository';
import { IQuizRepository, IQuizSubmissionRepository } from './core/domain/repositories/quiz.repository.interface';
import { QuizRepository, QuizSubmissionRepository } from './core/infrastructure/repositories/quiz.repository';
import { IClassRepository, IStudentRepository } from './core/domain/repositories/class.repository.interface';
import { ClassRepository, StudentRepository } from './core/infrastructure/repositories/class.repository';
import { ICourseRepository, ITeacherRepository } from './core/domain/repositories/course.repository.interface';
import { CourseRepository, TeacherRepository } from './core/infrastructure/repositories/course.repository';
import { IAuthRepository, IUserRepository } from './core/domain/repositories/auth.repository.interface';
import { AuthRepository, UserRepository } from './core/infrastructure/repositories/auth.repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideAnimations(),
    
    // Clean Architecture - Dependency Injection
    // Principe: Dependency Inversion - dépendre d'abstractions
    
    // Academic Year
    { provide: IAcademicYearRepository, useClass: AcademicYearRepository },
    
    // Quiz
    { provide: IQuizRepository, useClass: QuizRepository },
    { provide: IQuizSubmissionRepository, useClass: QuizSubmissionRepository },
    
    // Class
    { provide: IClassRepository, useClass: ClassRepository },
    { provide: IStudentRepository, useClass: StudentRepository },
    
    // Course
    { provide: ICourseRepository, useClass: CourseRepository },
    { provide: ITeacherRepository, useClass: TeacherRepository },
    
    // Auth
    { provide: IAuthRepository, useClass: AuthRepository },
    { provide: IUserRepository, useClass: UserRepository },
  ]
};