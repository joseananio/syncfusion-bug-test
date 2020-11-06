import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TreeViewModule } from '@syncfusion/ej2-angular-navigations';
import { ViegaCommonModule } from 'src/app/shared/lib/viega-common/lib/viega-common.module';
import { UserManagementModule } from 'src/app/user-management/user-management.module';
import { DeviceIconComponent } from './device-icon/device-icon.component';
import { ModalDialogModule } from './modal-dialog/modal-dialog.module';
import { ProgressStepperModule } from './progress-stepper/progress-stepper.module';
import { ProjectTreeComponent } from './project-tree/project-tree.component';
import { TabViewModule } from './tab-view';
import { UserProfileComponent } from './user-profile/user-profile.component';

@NgModule({
  declarations: [
    DeviceIconComponent,
    UserProfileComponent,
    ProjectTreeComponent,
  ],
  imports: [
    CommonModule,
    TabViewModule,
    ProgressStepperModule,
    UserManagementModule,
    ModalDialogModule,
    FormsModule,
    TranslateModule,
    TreeViewModule,
    ViegaCommonModule,
  ],
  exports: [
    ProgressStepperModule,
    DeviceIconComponent,
    ProjectTreeComponent,
  ],
})
export class ComponentsModule { }
