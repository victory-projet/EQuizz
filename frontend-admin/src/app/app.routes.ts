import { Routes } from '@angular/router';
import { Login } from './Components/login/login';

export const routes: Routes = [
    { path: '', component: Login },
      { path: '**', redirectTo: '' },
];
