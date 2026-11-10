import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { authGuard } from '@core';
import { environment } from '@env/environment';

import { AdminLayout } from '../theme/admin-layout/admin-layout';
import { AuthLayout } from '../theme/auth-layout/auth-layout';

import { Dashboard } from './dashboard/dashboard';
import { Catalogue } from './catalogue/catalogue';
import { Entreprises } from './entreprises/entreprises';
import { Laboratoires } from './laboratoires/laboratoires';
import { MonStage } from './mon-stage/mon-stage';
import { MesSujets } from './mes-sujets/mes-sujets';
import { ValidationSujets } from './validation-sujets/validation-sujets';
import { Utilisateurs } from './utilisateurs/utilisateurs';

import { Login } from './sessions/login/login';
import { Signup } from './sessions/signup/signup';
import { Error403 } from './sessions/error-403';
import { Error404 } from './sessions/error-404';
import { Error500 } from './sessions/error-500';

const routes: Routes = [
  {
    path: '',
    component: AdminLayout,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      // ✅ TOUTES VOS PAGES OFFICIELLES SONT MAINTENANT RECONNUES PAR ANGULAR :
      { path: 'catalogue', component: Catalogue },
      { path: 'entreprises', component: Entreprises },
      { path: 'laboratoires', component: Laboratoires },
      { path: 'mon-stage', component: MonStage },
      { path: 'mes-sujets', component: MesSujets },
      { path: 'validation-sujets', component: ValidationSujets },
      { path: 'utilisateurs', component: Utilisateurs },
      { path: '403', component: Error403 },
      { path: '404', component: Error404 },
      { path: '500', component: Error500 },
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

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: environment.useHash,
    }),
  ],
  exports: [RouterModule],
})
export class RoutesRoutingModule {}