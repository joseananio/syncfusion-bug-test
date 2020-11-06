import { Component } from '@angular/core';
import { Routes } from '@angular/router';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss'],
})
export class ProjectComponent {
  routes: Routes = ROUTES;
}

export const ROUTES: Routes = [
  {
    path: '',
    component: ProjectComponent,
  },
  {
    path: 'structure',
    component: ProjectComponent,
    data: { tabIndex: 0 },
  },
  {
    path: 'data',
    component: ProjectComponent,
    data: { tabIndex: 1 },
  },
  {
    path: 'file',
    component: ProjectComponent,
    data: { tabIndex: 2 },
  },
  {
    path: '**',
    component: ProjectComponent,
    redirectTo: '',
  },
];
