import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TreeViewModule } from '@syncfusion/ej2-angular-navigations';
import { DevicesModule } from 'src/app/devices/devices.module';
import { ComponentsModule } from 'src/app/shared/components/components.module';
import { ModalDialogModule } from 'src/app/shared/components/modal-dialog/modal-dialog.module';
import { TabViewModule } from 'src/app/shared/components/tab-view';
import { ViegaCommonModule } from 'src/app/shared/lib/viega-common/lib/viega-common.module';
import { DevicePointConfigHeaderComponent } from './device-point-config/device-point-config-header/device-point-config-header.component';
import { DevicePointConfigTabComponent } from './device-point-config/device-point-config-tab/device-point-config-tab.component';
import { DevicePointBasicInfoComponent } from './project-device/device-point-basic-info/device-point-basic-info.component';
import { ProjectStructureComponent } from './project-structure.component';

@NgModule({
  declarations: [
    ProjectStructureComponent,
    DevicePointConfigTabComponent,
    DevicePointConfigHeaderComponent,
    DevicePointBasicInfoComponent,
  ],
  exports: [
    ProjectStructureComponent,
    DevicePointConfigTabComponent,
    DevicePointConfigHeaderComponent,
    DevicePointBasicInfoComponent,
  ],
  imports: [
    CommonModule,
    ViegaCommonModule,
    FormsModule,
    ReactiveFormsModule,
    TreeViewModule,
    ModalDialogModule,
    DevicesModule,
    TabViewModule,
    ComponentsModule,
    TranslateModule,
  ],
})
export class ProjectStructureModule { }
