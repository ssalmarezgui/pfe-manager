import { Routes } from '@angular/router';
import { authGuard } from '@core';
import { AdminLayout } from '@theme/admin-layout/admin-layout';
import { AuthLayout } from '@theme/auth-layout/auth-layout';
import { Dashboard } from './routes/dashboard/dashboard';
import { Error403 } from './routes/sessions/error-403';
import { Error404 } from './routes/sessions/error-404';
import { Error500 } from './routes/sessions/error-500';
import { Login } from './routes/sessions/login/login';
import { Signup } from './routes/sessions/signup/signup';
import { Catalogue } from './routes/catalogue/catalogue';
import { Entreprises } from './routes/annuaire/entreprises/entreprises';
import { Laboratoires } from './routes/annuaire/laboratoires/laboratoires';
import { ValidationSujets } from './routes/admin/validation-sujets/validation-sujets';
import { Utilisateurs } from './routes/admin/utilisateurs/utilisateurs';
import { MonStage } from './routes/mon-stage/mon-stage';
import { MesSujets } from './routes/mes-sujets/mes-sujets';
export const routes: Routes = [
  {
    path: '',
    component: AdminLayout,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      { path: 'catalogue', component: Catalogue },
      { path: 'annuaire/entreprises', component: Entreprises },
      { path: 'annuaire/laboratoires', component: Laboratoires },
      { path: 'admin/validation-sujets', component: ValidationSujets },
      { path: 'admin/utilisateurs', component: Utilisateurs },
      { path: 'mon-stage', component: MonStage },
      { path: 'mes-sujets', component: MesSujets },
      { path: '404', component: Error404 },
      { path: '500', component: Error500 },
      {
        path: 'design',
        loadChildren: () => import('./routes/design/design.routes').then(m => m.routes),
      },
      {
        path: 'material',
        loadChildren: () => import('./routes/material/material.routes').then(m => m.routes),
      },
      {
        path: 'media',
        loadChildren: () => import('./routes/media/media.routes').then(m => m.routes),
      },
      {
        path: 'forms',
        loadChildren: () => import('./routes/forms/forms.routes').then(m => m.routes),
      },
      {
        path: 'tables',
        loadChildren: () => import('./routes/tables/tables.routes').then(m => m.routes),
      },
      {
        path: 'profile',
        loadChildren: () => import('./routes/profile/profile.routes').then(m => m.routes),
      },
      {
        path: 'permissions',
        loadChildren: () => import('./routes/permissions/permissions.routes').then(m => m.routes),
      },
      {
        path: 'utilities',
        loadChildren: () => import('./routes/utilities/utilities.routes').then(m => m.routes),
      },
    ],
  },
  {
    path: 'auth',
    component: AuthLayout,
    children: [
      { path: 'login', component: Login },
      { path: 'signup', component: Signup },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
