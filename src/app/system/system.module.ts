import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GridModule } from '@syncfusion/ej2-angular-grids';
import { DateTimePickerModule } from '@syncfusion/ej2-angular-calendars';
import { TabViewModule } from '../shared/components/tab-view';
import { ComponentsModule } from '../shared/components/components.module';
import { ViegaCommonModule } from '../shared/lib/viega-common/lib/viega-common.module';

import { SystemRoutingModule } from './system-routing.module';
import { SystemComponent } from './system/system.component';
import { ControllerOverviewComponent } from './controller-overview/controller-overview.component';
import { SystemSettingsComponent } from './system-settings/system-settings.component';

@NgModule({
  declarations: [
    SystemComponent,
    ControllerOverviewComponent,
    SystemSettingsComponent,
  ],
  imports: [
    CommonModule,
    SystemRoutingModule,
    ViegaCommonModule,
    TabViewModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    GridModule,
    ComponentsModule,
    DateTimePickerModule,
  ],
})
export class SystemModule { }
