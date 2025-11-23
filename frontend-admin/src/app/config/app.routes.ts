import { Routes } from '@angular/router';
import { authGuard } from '../infrastructure/guards/auth.guard';
import { LayoutComponent } from '../presentation/shared/components/layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('../presentation/pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('../presentation/features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'evaluation',
        loadComponent: () => import('../presentation/features/evaluation/evaluation.component').then(m => m.EvaluationComponent)
      },
      {
        path: 'courses',
        loadComponent: () => import('../presentation/features/courses/courses.component').then(m => m.CoursesComponent)
      },
      {
        path: 'quiz-management',
        loadComponent: () => import('../presentation/features/quiz-management/quiz-management.component').then(m => m.QuizManagementComponent)
      },
      {
        path: 'quiz-creation',
        redirectTo: 'quiz/create',
        pathMatch: 'full'
      },
      {
        path: 'quiz/create',
        loadComponent: () => import('../presentation/features/quiz-creation/quiz-creation.component').then(m => m.QuizCreationComponent)
      },
      {
        path: 'quiz/edit/:id',
        loadComponent: () => import('../presentation/features/quiz-creation/quiz-creation.component').then(m => m.QuizCreationComponent)
      },
      {
        path: 'quiz/preview/:id',
        loadComponent: () => import('../presentation/features/quiz-preview/quiz-preview.component').then(m => m.QuizPreviewComponent)
      },
      {
        path: 'quiz/:id/take',
        loadComponent: () => import('../presentation/features/quiz-taking/quiz-taking.component').then(m => m.QuizTakingComponent)
      },
      {
        path: 'classes',
        loadComponent: () => import('../presentation/features/class-management/class-management.component').then(m => m.ClassManagementComponent)
      },
      {
        path: 'academic-year',
        loadComponent: () => import('../presentation/features/academic-year/academic-year.component').then(m => m.AcademicYearComponent)
      },
      {
        path: 'analytics',
        loadComponent: () => import('../presentation/features/analytics/analytics.component').then(m => m.AnalyticsComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('../presentation/features/user-management/user-management.component').then(m => m.UserManagementComponent)
      },
      {
        path: 'user-management',
        redirectTo: 'users',
        pathMatch: 'full'
      },
      {
        path: 'quiz/:id/responses',
        loadComponent: () => import('../presentation/features/quiz-responses/quiz-responses.component').then(m => m.QuizResponsesComponent)
      },
      {
        path: 'quiz-responses',
        loadComponent: () => import('../presentation/features/quiz-responses/quiz-responses.component').then(m => m.QuizResponsesComponent)
      },
      {
        path: 'notifications',
        loadComponent: () => import('../presentation/features/notifications/notifications-history.component').then(m => m.NotificationsHistoryComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('../presentation/features/settings/settings').then(m => m.SettingsComponent)
      }
    ]
  },
  {
    path: '404',
    loadComponent: () => import('../presentation/pages/not-found/not-found').then(m => m.NotFoundComponent)
  },
  {
    path: '**',
    redirectTo: '404'
  }
];
