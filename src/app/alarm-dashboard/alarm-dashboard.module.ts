import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../shared/components/components.module';
import { ModalDialogModule } from '../shared/components/modal-dialog/modal-dialog.module';
import { DirectivesModule } from '../shared/directives/directives.module';
import { ViegaCommonModule } from '../shared/lib/viega-common/lib/viega-common.module';
import { AlarmDashboardRoutingModule } from './alarm-dashboard-routing.module';
import { AlarmDashboardComponent } from './alarm-dashboard.component';
import { DashboardItemComponent } from './dashboard-item/dashboard-item.component';
import { DashboardAddComponentComponent } from './dashboard/dashboard-overview/dashboard-add-component/dashboard-add-component.component';
import { DashboardOverviewComponent } from './dashboard/dashboard-overview/dashboard-overview.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DeviceListComponent } from './device-list/device-list.component';

@NgModule({
  declarations: [
    AlarmDashboardComponent,
    DashboardComponent,
    DashboardItemComponent,
    DeviceListComponent,
    DashboardOverviewComponent,
    DashboardAddComponentComponent,
  ],
  imports: [
    CommonModule,
    AlarmDashboardRoutingModule,
    ViegaCommonModule,
    DirectivesModule,
    DragDropModule,
    ComponentsModule,
    ModalDialogModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
  ],
  exports: [
    AlarmDashboardComponent,
    DashboardOverviewComponent,
    DashboardAddComponentComponent,
  ],
})
export class AlarmDashboardModule {}
