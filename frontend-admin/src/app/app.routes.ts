// App Routes
import { Routes } from '@angular/router';
import { authGuard } from './presentation/shared/guards/auth.guard';
import { adminGuard } from './presentation/shared/guards/admin.guard';

export const routes: Routes = [
  {
    path: 'onboarding',
    loadComponent: () => import('./presentation/features/onboarding/onboarding.component').then(m => m.OnboardingComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./presentation/features/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./presentation/layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./presentation/features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./presentation/features/users/users.component').then(m => m.UsersComponent)
      },
      {
        path: 'students',
        loadComponent: () => import('./presentation/features/students/students.component').then(m => m.StudentsComponent)
      },
      {
        path: 'teachers',
        loadComponent: () => import('./presentation/features/teachers/teachers.component').then(m => m.TeachersComponent)
      },
      {
        path: 'academic-years',
        loadComponent: () => import('./presentation/features/academic-years/academic-years.component').then(m => m.AcademicYearsComponent)
      },
      {
        path: 'courses',
        loadComponent: () => import('./presentation/features/courses/courses.component').then(m => m.CoursesComponent)
      },
      {
        path: 'classes',
        loadComponent: () => import('./presentation/features/classes/classes.component').then(m => m.ClassesComponent)
      },
      {
        path: 'associations',
        loadComponent: () => import('./presentation/features/associations/associations.component').then(m => m.AssociationsComponent)
      },
      {
        path: 'evaluations',
        loadComponent: () => import('./presentation/features/evaluations/evaluations.component').then(m => m.EvaluationsComponent)
      },
      {
        path: 'evaluations/create',
        loadComponent: () => import('./presentation/features/evaluation-create/evaluation-create.component').then(m => m.EvaluationCreateComponent)
      },
      {
        path: 'evaluations/:id',
        loadComponent: () => import('./presentation/features/evaluation-detail/evaluation-detail.component').then(m => m.EvaluationDetailComponent)
      },
      {
        path: 'evaluations/:id/preview',
        loadComponent: () => import('./presentation/features/evaluation-preview/evaluation-preview.component').then(m => m.EvaluationPreviewComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./presentation/features/reports/reports.component').then(m => m.ReportsComponent)
      },
      {
        path: 'reports/:id',
        loadComponent: () => import('./presentation/features/report-detail/report-detail.component').then(m => m.ReportDetailComponent)
      },
      {
        path: 'notifications',
        loadComponent: () => import('./presentation/features/notifications/notifications.component').then(m => m.NotificationsComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./presentation/features/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'messages',
        loadComponent: () => import('./presentation/features/messages/messages.component').then(m => m.MessagesComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
