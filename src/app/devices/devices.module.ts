import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ListBoxModule } from '@syncfusion/ej2-angular-dropdowns';
import { GridModule } from '@syncfusion/ej2-angular-grids';
import { TreeViewModule } from '@syncfusion/ej2-angular-navigations';
import { FilterService, SortService, TreeGridModule } from '@syncfusion/ej2-angular-treegrid';
import { ControllerStructureComponent } from 'src/app/devices/controller-structure/controller-structure.component';
import { PipesModule } from '../core/pipes/pipes.module';
import { FunctionManagementModule } from '../function-management/function-management.module';
import { NotificationBarModule } from '../notification-bar/notification-bar.module';
import { ComponentsModule } from '../shared/components/components.module';
import { ModalDialogModule } from '../shared/components/modal-dialog/modal-dialog.module';
import { TabViewModule } from '../shared/components/tab-view';
import { ViegaCommonModule } from '../shared/lib/viega-common/lib/viega-common.module';
import { ControllerDetailsConfigurationComponent } from './controller-details-configuration/controller-details-configuration.component';
import {
  ControllerDetailsFirmwareConfigurationComponent,
} from './controller-details-configuration/controller-details-firmware-update.component';
import { DeviceDetailsConfigurationComponent } from './device-details-configuration/device-details-configuration.component';
import { DeviceDetailsFirmwareUpdateComponent } from './device-details-firmware-update/device-details-firmware-update.component';
import {
  DeviceDetailsDteFunctionTestHardwareComponent,
} from './device-details-function-test-hardware/device-details-dte-function-test-hardware.component';
import {
  DeviceDetailsFunctionTestHardwareComponent,
} from './device-details-function-test-hardware/device-details-function-test-hardware.component';
import {
  DeviceDetailsFunctionTestSoftwareComponent,
} from './device-details-function-test-software/device-details-function-test-software.component';
import { DeviceDetailsHeaderComponent } from './device-details-header/device-details-header.component';
import { DeviceDetailsMaintenanceComponent } from './device-details-maintenance/device-details-maintenance.component';
import { DeviceDetailsSensorComponent } from './device-details-sensor/device-details-sensor.component';
import { DeviceDetailsStatusComponent } from './device-details-status/device-details-status.component';
import { DeviceDetailsComponent } from './device-details/device-details.component';
import { DeviceFunctionEditComponent } from './device-function-edit/device-function-edit.component';
import { DeviceFunctionListComponent } from './device-function-list/device-function-list.component';
import { DeviceInstallationConfirmationComponent } from './device-installation-confirmation/device-installation-confirmation.component';
import { DeviceReverseSearchComponent } from './device-reverse-search/device-reverse-search.component';
import { DeviceSensorStructureComponent } from './device-sensor-structure/device-sensor-structure.component';
import { DeviceStructureComponent } from './device-structure/device-structure.component';
import { DevicesRoutingModule } from './devices-routing.module';
import { DevicesComponent } from './devices/devices.component';

@NgModule({
  declarations: [
    ControllerDetailsConfigurationComponent,
    ControllerDetailsFirmwareConfigurationComponent,
    DevicesComponent,
    DeviceDetailsComponent,
    DeviceDetailsStatusComponent,
    DeviceDetailsConfigurationComponent,
    DeviceDetailsMaintenanceComponent,
    DeviceDetailsFunctionTestHardwareComponent,
    DeviceDetailsDteFunctionTestHardwareComponent,
    DeviceDetailsFunctionTestSoftwareComponent,
    DeviceFunctionListComponent,
    DeviceFunctionEditComponent,
    DeviceDetailsHeaderComponent,
    DeviceStructureComponent,
    ControllerStructureComponent,
    DeviceDetailsFirmwareUpdateComponent,
    DeviceDetailsSensorComponent,
    DeviceSensorStructureComponent,
    DeviceReverseSearchComponent,
    DeviceInstallationConfirmationComponent,
    DeviceDetailsFunctionTestSoftwareComponent,
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    DevicesRoutingModule,
    ViegaCommonModule,
    TreeGridModule,
    GridModule,
    ModalDialogModule,
    TabViewModule,
    TreeViewModule,
    ComponentsModule,
    FunctionManagementModule,
    TranslateModule,
    ListBoxModule,
    PipesModule,
    NotificationBarModule,
  ],
  providers: [FilterService, SortService],
  exports: [DeviceDetailsFirmwareUpdateComponent],
})
export class DevicesModule { }
