// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { importProvidersFrom } from '@angular/core';

// CDK Platform → provides _HighContrastModeDetector
import { PlatformModule } from '@angular/cdk/platform';

// Lucide Icons
import { LucideAngularModule } from 'lucide-angular';
import { lucideIcons } from './app/config/lucide-icons.config';

// Configuration
import { appConfig } from './app/config/app.config';
import { routes } from './app/config/app.routes';

// Infrastructure
import { authInterceptor } from './app/infrastructure/http/auth.interceptor';

// App Component
import { App } from './app/app';


bootstrapApplication(App, {
  providers: [
    // Existing config (router, http, guards, etc.)
    ...appConfig.providers,

    // ---- Essential for Material / CDK ----
    importProvidersFrom(PlatformModule),          // <-- fixes NG0203
    importProvidersFrom(LucideAngularModule.pick(lucideIcons)), // Lucide Icons
    provideAnimationsAsync(),                    // async loading of animations
    // -------------------------------------

    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
}).catch(err => console.error(err));
