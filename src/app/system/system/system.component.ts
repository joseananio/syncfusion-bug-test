import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-system',
  templateUrl: './system.component.html',
  styleUrls: ['./system.component.scss'],
})
export class SystemComponent {
  routes: Routes = ROUTES;

  includeControllerOverviewTab = environment.includeControllerOverview;

  controllerOverViewHeader = _('SYSTEM.CONTROLLER_OVERVIEW');

  systemSettingsHeader = _('SYSTEM.SYSTEM_SETTINGS');
}

export const ROUTES: Routes = [
  {
    path: '',
    component: SystemComponent,
  },
  {
    path: 'controllers',
    component: SystemComponent,
    data: { tabIndex: 0 },
  },
  {
    path: 'settings',
    component: SystemComponent,
    data: { tabIndex: 1 },
  },
  {
    path: '**',
    component: SystemComponent,
    redirectTo: '',
  },
];
