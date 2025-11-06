import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard').then(m => m.DashboardComponent)
  },
  {
    path: 'evaluation',
    loadComponent: () => import('./features/quiz-management/quiz-management').then(m => m.QuizManagementComponent)
  },
  {
    path: 'quiz-management',
    loadComponent: () => import('./features/quiz-management/quiz-management').then(m => m.QuizManagementComponent)
  },
  {
    path: 'quiz-management/create',
    loadComponent: () => import('./features/quiz-management/components/quiz-editor/quiz-editor').then(m => m.QuizEditorComponent)
  },
  {
    path: 'courses',
    loadComponent: () => import('./features/dashboard/dashboard').then(m => m.DashboardComponent)
  },
  {
    path: 'classes',
    loadComponent: () => import('./features/dashboard/dashboard').then(m => m.DashboardComponent)
  },
  {
    path: 'academic-year',
    loadComponent: () => import('./features/dashboard/dashboard').then(m => m.DashboardComponent)
  },
  {
    path: 'reports',
    loadComponent: () => import('./features/analytics/analytics').then(m => m.AnalyticsComponent)
  },
  {
    path: 'settings',
    loadComponent: () => import('./features/dashboard/dashboard').then(m => m.DashboardComponent)
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
