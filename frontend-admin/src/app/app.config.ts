// App Configuration
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { authInterceptor } from './presentation/shared/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { cacheInterceptor } from './core/interceptors/cache.interceptor';

// Repository Providers
import { AuthRepositoryInterface } from './core/domain/repositories/auth.repository.interface';
import { AuthRepository } from './infrastructure/repositories/auth.repository';
import { UserRepositoryInterface } from './core/domain/repositories/user.repository.interface';
import { UserRepository } from './infrastructure/repositories/user.repository';
import { AcademicRepositoryInterface } from './core/domain/repositories/academic.repository.interface';
import { AcademicRepository } from './infrastructure/repositories/academic.repository';
import { EvaluationRepositoryInterface } from './core/domain/repositories/evaluation.repository.interface';
import { EvaluationRepository } from './infrastructure/repositories/evaluation.repository';
import { DashboardRepositoryInterface } from './core/domain/repositories/dashboard.repository.interface';
import { DashboardRepository } from './infrastructure/repositories/dashboard.repository';
import { NotificationRepositoryInterface } from './core/domain/repositories/notification.repository.interface';
import { NotificationRepository } from './infrastructure/repositories/notification.repository';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor, errorInterceptor, cacheInterceptor])
    ),
    provideAnimationsAsync(),
    provideCharts(withDefaultRegisterables()),
    // Repository Implementations
    { provide: AuthRepositoryInterface, useClass: AuthRepository },
    { provide: UserRepositoryInterface, useClass: UserRepository },
    { provide: AcademicRepositoryInterface, useClass: AcademicRepository },
    { provide: EvaluationRepositoryInterface, useClass: EvaluationRepository },
    { provide: DashboardRepositoryInterface, useClass: DashboardRepository },
    { provide: NotificationRepositoryInterface, useClass: NotificationRepository }
  ]
};
