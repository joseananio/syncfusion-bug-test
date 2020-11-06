import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TreeViewModule } from '@syncfusion/ej2-angular-navigations';
import { DeviceIconComponent } from './device-icon/device-icon.component';

@NgModule({
  declarations: [
    DeviceIconComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    TreeViewModule,
  ],
  exports: [
    DeviceIconComponent,
  ],
})
export class ComponentsModule { }
