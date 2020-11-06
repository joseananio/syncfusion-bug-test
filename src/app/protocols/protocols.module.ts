import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { TranslateModule } from '@ngx-translate/core';
import { DateTimePickerModule, TimePickerModule } from '@syncfusion/ej2-angular-calendars';
import {
  AccumulationChartAllModule, ChartAllModule,
  ChartModule,

  RangeNavigatorAllModule,
} from '@syncfusion/ej2-angular-charts';
import { MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
import { GridModule } from '@syncfusion/ej2-angular-grids';
import { PipesModule } from '../core/pipes/pipes.module';
import { FilterTemplateModule } from '../shared/components/filter-template/filter-template.module';
import { ModalDialogModule } from '../shared/components/modal-dialog/modal-dialog.module';
import { TabViewModule } from '../shared/components/tab-view';
import { ViegaCommonModule } from '../shared/lib/viega-common/lib/viega-common.module';
import { ProtocolsAutoLogFormEditComponent } from './protocol-auto-log/form-add/protocol-auto-log-form-edit.component';
import { ProtocolsAutoLogComponent } from './protocol-auto-log/protocols-auto-log.component';
import { ProtocolsFunctionsComponent } from './protocols-functions/protocols-functions.component';
import { ProtocolsMeasurementDataGraphComponent } from './protocols-measurement-data-graph/protocols-measurement-data-graph.component';
import { ProtocolsMeasurementDataComponent } from './protocols-measurement-data/protocols-measurement-data.component';
import { ProtocolsOperatingSystemComponent } from './protocols-operating-system/protocols-operating-system.component';
import { ProtocolsRoutingModule } from './protocols-routing.module';
import { ProtocolsUserActionsComponent } from './protocols-user-actions/protocols-user-actions.component';
import { ProtocolsComponent } from './protocols/protocols.component';

@NgModule({
  declarations: [
    ProtocolsComponent,
    ProtocolsMeasurementDataComponent,
    ProtocolsFunctionsComponent,
    ProtocolsUserActionsComponent,
    ProtocolsOperatingSystemComponent,
    ProtocolsMeasurementDataGraphComponent,
    ProtocolsAutoLogComponent,
    ProtocolsAutoLogFormEditComponent,
  ],
  imports: [
    MatMenuModule,
    CommonModule,
    ProtocolsRoutingModule,
    ChartModule,
    ChartAllModule,
    FormsModule,
    AccumulationChartAllModule,
    RangeNavigatorAllModule,
    MultiSelectModule,
    ModalDialogModule,
    DateTimePickerModule,
    TabViewModule,
    ViegaCommonModule,
    TimePickerModule,
    GridModule,
    FilterTemplateModule,
    TranslateModule,
    PipesModule,
  ],
})
export class ProtocolsModule {}
