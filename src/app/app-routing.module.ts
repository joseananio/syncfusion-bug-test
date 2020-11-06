import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { ActivationComponent } from './activation/activation.component';
import { ActivationGuard } from './core/guards/activation.guard';
import { AuthGuard } from './core/guards/auth.guard';
import { NonActivationGuard } from './core/guards/non-activation.guard';
import { PasswordResetGuard } from './core/guards/password-reset.guard';
import { HomeComponent } from './home';
import { LoginPageComponent } from './login-page/login-page/login-page.component';
import { SupportComponent } from './support/support.component';

const routes: Routes = [
  {
    path: 'devices',
    loadChildren: () => import('./devices/devices.module').then((m) => m.DevicesModule),
    canActivate: [ActivationGuard, AuthGuard, PasswordResetGuard],
    data: { label: _('APP.DEVICES') },
  },
  {
    path: 'notifications',
    loadChildren: () => import('./notifications/notifications.module').then((m) => m.NotificationsModule),
    canActivate: [ActivationGuard, AuthGuard, PasswordResetGuard],
    data: { label: _('APP.NOTIFICATIONS') },
  },
  {
    path: 'functions',
    loadChildren: () => import('./function-management/function-management.module').then((m) => m.FunctionManagementModule),
    canActivate: [ActivationGuard, AuthGuard, PasswordResetGuard],
    data: { label: _('APP.FUNCTIONS') },
  },
  {
    path: 'project',
    loadChildren: () => import('./project/project.module').then((m) => m.ProjectModule),
    canActivate: [ActivationGuard, AuthGuard, PasswordResetGuard],
    data: { label: _('APP.PROJECT') },
  },
  {
    path: 'system',
    loadChildren: () => import('./system/system.module').then((m) => m.SystemModule),
    canActivate: [ActivationGuard, AuthGuard, PasswordResetGuard],
    data: { label: _('APP.SYSTEM') },
  },
  {
    path: 'protocols',
    loadChildren: () => import('./protocols/protocols.module').then((m) => m.ProtocolsModule),
    canActivate: [ActivationGuard, AuthGuard, PasswordResetGuard],
    data: { label: _('APP.PROTOCOLS') },
  },
  {
    path: 'users',
    loadChildren: () => import('./user-management/user-management.module').then((m) => m.UserManagementModule),
    canActivate: [ActivationGuard, AuthGuard, PasswordResetGuard],
    data: { label: _('APP.USERS') },
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./alarm-dashboard/alarm-dashboard.module').then((m) => m.AlarmDashboardModule),
    canActivate: [ActivationGuard, AuthGuard, PasswordResetGuard],
    data: { label: _('APP.DASHBOARD') },
  },
  {
    path: '',
    pathMatch: 'full',
    canActivate: [ActivationGuard, AuthGuard, PasswordResetGuard],
    component: HomeComponent,
  },
  {
    path: 'login',
    pathMatch: 'full',
    component: LoginPageComponent,
    canActivate: [ActivationGuard],
  },
  {
    path: 'activation',
    pathMatch: 'full',
    component: ActivationComponent,
    canActivate: [NonActivationGuard],
  },
  {
    path: 'setpassword',
    pathMatch: 'full',
    component: LoginPageComponent,
    canActivate: [ActivationGuard, AuthGuard],
  },
  {
    path: 'support',
    pathMatch: 'full',
    component: SupportComponent,
    data: { label: _('SUPPORT.SERVICE') },
  },
  {
    path: 'dte-function-test-report',
    loadChildren: () => import(
      './dte-function-test-report/dte-function-test-report.module'
    ).then((m) => m.DteFunctionTestReportModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
