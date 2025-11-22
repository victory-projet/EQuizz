// Configuration des providers suivant la Clean Architecture
import { Provider } from '@angular/core';

// Domain - Repository Interfaces
import { IQuizRepository } from '../core/domain/repositories/quiz.repository.interface';
import { IClassRepository } from '../core/domain/repositories/class.repository.interface';
import { ICourseRepository } from '../core/domain/repositories/course.repository.interface';
import { IAcademicYearRepository } from '../core/domain/repositories/academic-year.repository.interface';
import { IAuthRepository } from '../core/domain/repositories/auth.repository.interface';

// Infrastructure - Repository Implementations
import { QuizRepository } from '../infrastructure/repositories/quiz.repository';
import { ClassRepository } from '../infrastructure/repositories/class.repository';
import { CourseRepository } from '../infrastructure/repositories/course.repository';
import { AcademicYearRepository } from '../infrastructure/repositories/academic-year.repository';
import { AuthRepository } from '../infrastructure/repositories/auth.repository';

/**
 * Providers pour l'injection de dépendances
 * Respecte le principe d'inversion de dépendance :
 * - Les interfaces sont définies dans le Domain
 * - Les implémentations sont dans l'Infrastructure
 * - L'Application utilise les interfaces
 */
export const repositoryProviders: Provider[] = [
  // Quiz Repository
  {
    provide: IQuizRepository,
    useClass: QuizRepository
  },
  // Class Repository
  {
    provide: IClassRepository,
    useClass: ClassRepository
  },
  // Course Repository
  {
    provide: ICourseRepository,
    useClass: CourseRepository
  },
  // Academic Year Repository
  {
    provide: IAcademicYearRepository,
    useClass: AcademicYearRepository
  },
  // Auth Repository
  {
    provide: IAuthRepository,
    useClass: AuthRepository
  }
];

/**
 * Tous les providers de l'application
 */
export const applicationProviders: Provider[] = [
  ...repositoryProviders
];
