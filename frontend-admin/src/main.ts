// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { importProvidersFrom } from '@angular/core';

// CDK Platform → provides _HighContrastModeDetector
import { PlatformModule } from '@angular/cdk/platform';

// Your config
import { appConfig } from './app/app.config';
import { routes } from './app/app.routes';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';
import { App } from './app/app';


bootstrapApplication(App, {
  providers: [
    // Existing config (router, http, guards, etc.)
    ...appConfig.providers,

    // ---- Essential for Material / CDK ----
    importProvidersFrom(PlatformModule),          // <-- fixes NG0203
    provideAnimationsAsync(),                    // async loading of animations
    // -------------------------------------

    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
}).catch(err => console.error(err));
