import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AlarmDashboardComponent } from './alarm-dashboard.component';
import { DashboardOverviewComponent } from './dashboard/dashboard-overview/dashboard-overview.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardOverviewComponent,
  },
  {
    path: 'view/:dashboardName',
    component: AlarmDashboardComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AlarmDashboardRoutingModule {}
