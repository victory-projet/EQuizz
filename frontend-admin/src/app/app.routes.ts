import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'evaluation',
    loadComponent: () => import('./features/evaluation/evaluation.component').then(m => m.EvaluationComponent)
  },
  {
    path: 'courses',
    loadComponent: () => import('./features/courses/courses.component').then(m => m.CoursesComponent)
  },
  {
    path: 'quiz/create',
    loadComponent: () => import('./features/quiz-creation/quiz-creation.component').then(m => m.QuizCreationComponent)
  },
  {
    path: 'quiz/:id/take',
    loadComponent: () => import('./features/quiz-taking/quiz-taking.component').then(m => m.QuizTakingComponent)
  },
  {
    path: 'classes',
    loadComponent: () => import('./features/class-management/class-management.component').then(m => m.ClassManagementComponent)
  },
  {
    path: 'academic-year',
    loadComponent: () => import('./features/academic-year/academic-year.component').then(m => m.AcademicYearComponent)
  },
  {
    path: 'analytics',
    loadComponent: () => import('./features/analytics/analytics.component').then(m => m.AnalyticsComponent)
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
