import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DevicesModule } from '../devices/devices.module';
import { ComponentsModule } from '../shared/components/components.module';
import { ModalDialogModule } from '../shared/components/modal-dialog/modal-dialog.module';
import { TabViewModule } from '../shared/components/tab-view';
import { ViegaCommonModule } from '../shared/lib/viega-common/lib/viega-common.module';
import { ProjectDataModule } from './project-data/project-data.module';
import { ProjectFileModule } from './project-file/project-file.module';
import { ProjectRoutingModule } from './project-routing.module';
import { ProjectDeviceComponent } from './project-structure/project-device/project-device.component';
import { ProjectStructureModule } from './project-structure/project-structure.module';
import { ProjectUnitComponent } from './project-structure/project-unit/project-unit.component';
import { ProjectComponent } from './project/project.component';

@NgModule({
  declarations: [
    ProjectComponent,
    ProjectUnitComponent,
    ProjectDeviceComponent,
  ],
  imports: [
    CommonModule,
    ProjectRoutingModule,
    TabViewModule,
    ViegaCommonModule,
    ProjectDataModule,
    ProjectStructureModule,
    ProjectFileModule,
    FormsModule,
    ReactiveFormsModule,
    ModalDialogModule,
    DevicesModule,
    TranslateModule,
    ComponentsModule,
  ],
})
export class ProjectModule {}
