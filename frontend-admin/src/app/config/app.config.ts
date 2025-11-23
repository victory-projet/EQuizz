// src/app/config/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { authInterceptor } from '../infrastructure/http/auth.interceptor';
import { errorInterceptor } from '../infrastructure/http/error.interceptor';

// Repository Interfaces
import { IAuthRepository, IUserRepository } from '../core/domain/repositories/auth.repository.interface';
import { IAcademicYearRepository } from '../core/domain/repositories/academic-year.repository.interface';
import { IQuizRepository } from '../core/domain/repositories/quiz.repository.interface';
import { IClassRepository } from '../core/domain/repositories/class.repository.interface';
import { ICourseRepository } from '../core/domain/repositories/course.repository.interface';
import { INotificationRepository } from '../core/domain/repositories/notification.repository.interface';

// Repository Implementations
import { AuthRepository } from '../infrastructure/repositories/auth.repository';
import { UserRepository } from '../infrastructure/repositories/user.repository';
import { AcademicYearRepository } from '../infrastructure/repositories/academic-year.repository';
import { QuizRepository } from '../infrastructure/repositories/quiz.repository';
import { ClassRepository } from '../infrastructure/repositories/class.repository';
import { CourseRepository } from '../infrastructure/repositories/course.repository';
import { NotificationRepository } from '../infrastructure/repositories/notification.repository';
import { DashboardRepository } from '../infrastructure/repositories/dashboard.repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideAnimations(),

    // Repository Providers - Map interfaces to implementations
    { provide: IAuthRepository, useClass: AuthRepository },
    { provide: IUserRepository, useClass: UserRepository },
    { provide: IAcademicYearRepository, useClass: AcademicYearRepository },
    { provide: IQuizRepository, useClass: QuizRepository },
    { provide: IClassRepository, useClass: ClassRepository },
    { provide: ICourseRepository, useClass: CourseRepository },
    { provide: INotificationRepository, useClass: NotificationRepository },

    // Additional repositories without interfaces
    DashboardRepository
  ]
};