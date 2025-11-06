// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';

// Import des interceptors
import { AuthInterceptor } from './core/interceptors/auth-interceptor';
import { LoadingInterceptor } from './core/interceptors/loading.interceptor';
import { ErrorHandlerInterceptor } from './core/interceptors/error-handler.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        AuthInterceptor,
        LoadingInterceptor,
        ErrorHandlerInterceptor
      ])
    ),
    provideAnimations()
  ]
};
